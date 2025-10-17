import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth-utils';
import fs from 'fs';
import path from 'path';

// Helper pour convertir les BigInt en nombres et les Dates en strings
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  // Convertir BigInt en Number
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  // Convertir Date en string ISO
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Traiter les tableaux
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToNumber(item));
  }
  
  // Traiter les objets
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  
  return obj;
}

// GET - Récupérer une annonce spécifique (publique)
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    console.log('🔍 GET /api/biens/[code] - Code:', code);

    // Récupérer le bien avec SQL brut
    const query = `
      SELECT 
        p.*,
        c.nom as categorie_nom,
        c.code as categorie_code
      FROM produits p
      LEFT JOIN categories c ON p.code_categorie = c.code
      WHERE p.code = ? AND p.enabled = 1
      LIMIT 1
    `;

    const biens = await prisma.$queryRawUnsafe<any[]>(query, code);

    if (!biens || biens.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Bien non trouvé' },
        { status: 404 }
      );
    }

    const bien = biens[0];

    // Parser les images JSON
    let images: string[] = [];
    if (bien.image) {
      try {
        images = typeof bien.image === 'string' ? JSON.parse(bien.image) : bien.image;
        console.log('🖼️ Images parsées:', images);
        
        // Corriger les chemins d'images anciennes et s'assurer qu'ils commencent par /
        images = images.map((img: string) => {
          // Remplacer l'ancien chemin par le nouveau
          if (img.startsWith('assets/images/annonces/')) {
            img = img.replace('assets/images/annonces/', 'assets/annonces/');
          }
          // S'assurer que le chemin commence par / pour Next.js Image
          if (!img.startsWith('/') && !img.startsWith('http')) {
            return '/' + img;
          }
          return img;
        });
        
        console.log('🖼️ Images après correction:', images);
      } catch (e) {
        console.error('Erreur parsing images:', e);
        images = [];
      }
    }

    // Récupérer la commune
    let commune = null;
    if (bien.id_commune) {
      const communeQuery = `SELECT id, nom FROM communes WHERE id = ? LIMIT 1`;
      const communeResult = await prisma.$queryRawUnsafe<any[]>(communeQuery, bien.id_commune);
      commune = communeResult[0] || null;
    }

    // Récupérer le quartier avec lat/lng
    let quartier = null;
    if (bien.id_quartier) {
      const quartierQuery = `SELECT id, nom, lat, lng FROM quartiers WHERE id = ? LIMIT 1`;
      const quartierResult = await prisma.$queryRawUnsafe<any[]>(quartierQuery, bien.id_quartier);
      quartier = quartierResult[0] || null;
    }

    // Récupérer l'annonceur (client)
    let annonceur = null;
    if (bien.client_owner_id) {
      const annonceurQuery = `SELECT id, nom, prenom, telephone, email, type_compte FROM clients WHERE id = ? LIMIT 1`;
      const annonceurResult = await prisma.$queryRawUnsafe<any[]>(annonceurQuery, bien.client_owner_id);
      annonceur = annonceurResult[0] || null;
    }

    // Récupérer les commentaires
    const commentairesQuery = `
      SELECT id, auteur as nom, contenu as commentaire, note, created_at
      FROM commentaires_annonces 
      WHERE produit_code = ? 
      ORDER BY created_at DESC
    `;
    const commentaires = await prisma.$queryRawUnsafe<any[]>(commentairesQuery, code);

    // Calculer la note moyenne
    const totalComments = commentaires.length;
    const sumNotes = commentaires.reduce((sum, c) => sum + Number(c.note || 0), 0);
    const averageNote = totalComments > 0 ? parseFloat((sumNotes / totalComments).toFixed(1)) : 0;

    // Formater la réponse et convertir tous les BigInt
    const bienFormatted = convertBigIntToNumber({
      ...bien,
      images, // Tableau d'images déjà parsé
      commune,
      quartier,
      annonceur,
      commentaires,
      averageNote,
      totalComments,
    });

    return NextResponse.json({
      success: true,
      data: bienFormatted,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du bien:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Mettre à jour une annonce (avec method spoofing _method=PUT)
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    console.log('🔧 API POST /api/biens/[code] - Code:', code);

    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    console.log('🔑 Token présent:', !!token);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    const clientOwnerId = parseInt(decoded.userId);
    console.log('👤 Client Owner ID:', clientOwnerId);

    // Vérifier que l'annonce appartient bien à l'utilisateur
    const existingProduit = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM produits WHERE code = ? AND client_owner_id = ? LIMIT 1`,
      code,
      clientOwnerId
    );

    console.log('🔍 Annonce trouvée:', existingProduit.length > 0);

    if (!existingProduit || existingProduit.length === 0) {
      console.log('❌ Annonce non trouvée ou accès refusé');
      return NextResponse.json(
        { success: false, message: 'Annonce non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    console.log('📦 FormData reçue');

    // Extraire les données du formulaire
    const type = formData.get('type') as string;
    const categorie = formData.get('categorie') as string;
    const souscategorie = formData.get('souscategorie') as string || null;
    const meuble = formData.get('meuble') ? parseInt(formData.get('meuble') as string) : 0;
    const piece = formData.get('piece') ? parseInt(formData.get('piece') as string) : 0;
    const chambre = formData.get('chambre') ? parseInt(formData.get('chambre') as string) : 0;
    const surface = formData.get('surface') ? parseFloat(formData.get('surface') as string) : null;
    const prix = formData.get('prix') ? parseFloat(formData.get('prix') as string) : 0;
    const commune = formData.get('commune') ? parseInt(formData.get('commune') as string) : null;
    const quartier = formData.get('quartier') ? parseInt(formData.get('quartier') as string) : null;
    const description = formData.get('description') as string;

    // Récupérer les images existantes
    const existingImagesData: string[] = [];
    let idx = 0;
    while (formData.has(`existing_images[${idx}]`)) {
      const imgPath = formData.get(`existing_images[${idx}]`) as string;
      existingImagesData.push(imgPath);
      idx++;
    }

    // Traiter les nouvelles images
    const newImages: string[] = [];
    let imgIdx = 0;
    while (formData.has(`images[${imgIdx}]`)) {
      const imageFile = formData.get(`images[${imgIdx}]`) as File;
      
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Générer un nom unique
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(imageFile.name)}`;
        const uploadDir = path.join(process.cwd(), 'public', 'assets', 'annonces');
        
        // Créer le dossier si nécessaire
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(filePath, buffer);

        newImages.push(`/assets/annonces/${uniqueName}`);
      }
      imgIdx++;
    }

    // Combiner les images existantes et nouvelles
    const allImages = [...existingImagesData, ...newImages];
    const imagesJson = JSON.stringify(allImages);

    // Mettre à jour le produit
    await prisma.$queryRawUnsafe(
      `UPDATE produits 
       SET type_annonce = ?,
           code_categorie = ?,
           code_souscategorie = ?,
           meuble = ?,
           piece = ?,
           chambre = ?,
           surface = ?,
           prix_vente = ?,
           id_commune = ?,
           id_quartier = ?,
           description = ?,
           image = ?,
           updated_at = NOW()
       WHERE code = ? AND client_owner_id = ?`,
      type,
      categorie,
      souscategorie,
      meuble,
      piece,
      chambre,
      surface,
      prix,
      commune,
      quartier,
      description,
      imagesJson,
      code,
      clientOwnerId
    );

    // Supprimer les anciennes caractéristiques
    await prisma.$queryRawUnsafe(
      `DELETE FROM caracretistique_produits WHERE produit_code = ?`,
      code
    );

    // Ajouter les nouvelles caractéristiques
    const caracteristiques: number[] = [];
    let caracIdx = 0;
    while (formData.has(`caracteristiques[${caracIdx}]`)) {
      const caracId = parseInt(formData.get(`caracteristiques[${caracIdx}]`) as string);
      caracteristiques.push(caracId);
      caracIdx++;
    }

    if (caracteristiques.length > 0) {
      for (const caracId of caracteristiques) {
        await prisma.$queryRawUnsafe(
          `INSERT INTO caracretistique_produits (produit_code, caracteristique_id, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW())`,
          code,
          caracId
        );
      }
    }

    console.log('✅ Annonce mise à jour avec succès - Code:', code);
    
    return NextResponse.json({
      success: true,
      message: 'Annonce mise à jour avec succès',
      data: { code },
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour annonce:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une annonce
export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    const clientOwnerId = parseInt(decoded.userId);

    // Vérifier que l'annonce appartient bien à l'utilisateur
    const existingProduit = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM produits WHERE code = ? AND client_owner_id = ? LIMIT 1`,
      code,
      clientOwnerId
    );

    if (!existingProduit || existingProduit.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Annonce non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    // Supprimer les caractéristiques associées
    await prisma.$queryRawUnsafe(
      `DELETE FROM caracretistique_produits WHERE produit_code = ?`,
      code
    );

    // Supprimer le produit
    await prisma.$queryRawUnsafe(
      `DELETE FROM produits WHERE code = ? AND client_owner_id = ?`,
      code,
      clientOwnerId
    );

    return NextResponse.json({
      success: true,
      message: 'Annonce supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression annonce:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
