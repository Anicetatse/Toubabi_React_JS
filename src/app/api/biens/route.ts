import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth-utils';
import { sendEmail, getPatienterTemplate, getNewAnnonceAdminTemplate, getAnnonceValideeTemplate, getAdminEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = 12;
    const offset = (page - 1) * perPage;

    // Construire la requête SQL comme Laravel
    let whereConditions: string[] = ['p.enabled = 1'];
    let queryParams: any[] = [];

    // Filtre par type (louer/acheter)
    const type = searchParams.get('type');
    if (type) {
      whereConditions.push('p.type_annonce = ?');
      queryParams.push(type);
    }

    // Filtre par commune  
    const communeId = searchParams.get('commune');
    if (communeId) {
      whereConditions.push('p.id_commune = ?');
      queryParams.push(parseInt(communeId));
    }

    // Filtre par quartier
    const quartierId = searchParams.get('quartier');
    if (quartierId) {
      whereConditions.push('p.id_quartier = ?');
      queryParams.push(parseInt(quartierId));
    }

    // Filtre par catégories (peut être multiple via code)
    const categories = searchParams.getAll('cate[]');
    if (categories.length > 0) {
      const placeholders = categories.map(() => '?').join(',');
      whereConditions.push(`p.code_categorie IN (${placeholders})`);
      queryParams.push(...categories);
    }

    // Filtre par nombre de pièces
    const piece = searchParams.get('piece');
    if (piece) {
      const pieceNum = parseInt(piece);
      if (pieceNum === 6) {
        whereConditions.push('p.piece > 5');
      } else {
        whereConditions.push('p.piece = ?');
        queryParams.push(pieceNum);
      }
    }

    // Filtre par nombre de chambres
    const chambre = searchParams.get('chambre');
    if (chambre) {
      const chambreNum = parseInt(chambre);
      if (chambreNum === 6) {
        whereConditions.push('p.chambre > 5');
      } else {
        whereConditions.push('p.chambre = ?');
        queryParams.push(chambreNum);
      }
    }

    // Filtre par budget (tranches de prix)
    const priceRange = searchParams.get('price');
    if (priceRange) {
      switch (priceRange) {
        case '1': // moins de 200.000 fr
          whereConditions.push('p.prix_vente < 200000');
          break;
        case '2': // 200.000 - 1.500.000 fr
          whereConditions.push('p.prix_vente BETWEEN 200000 AND 1500000');
          break;
        case '3': // 1.500.000 - 50.000.000 fr
          whereConditions.push('p.prix_vente BETWEEN 1500000 AND 50000000');
          break;
        case '4': // 50.000.000 - 200.000.000 fr
          whereConditions.push('p.prix_vente BETWEEN 50000000 AND 200000000');
          break;
        case '5': // Au delà de 200.000.000 fr
          whereConditions.push('p.prix_vente >= 200000000');
          break;
      }
    }

    // Déterminer l'ordre de tri
    const trie = searchParams.get('trie');
    let orderBy = 'p.created_at DESC'; // Par défaut : plus récents
    
    switch (trie) {
      case '1': // Prix croissant
        orderBy = 'p.prix_vente ASC';
        break;
      case '2': // Prix décroissant
        orderBy = 'p.prix_vente DESC';
        break;
      case '3': // Plus récentes
        orderBy = 'p.created_at DESC';
        break;
      case '4': // Plus anciennes
        orderBy = 'p.created_at ASC';
        break;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Compter le total
    const countQuery = `SELECT COUNT(*) as total FROM produits p ${whereClause}`;
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...queryParams) as any[];
    const total = Number(countResult[0].total);

    // Récupérer les biens
    const biensQuery = `
      SELECT p.*, c.nom as categorie_nom, c.code as categorie_code
      FROM produits p
      LEFT JOIN categories c ON p.code_categorie = c.code
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    
    const biens = await prisma.$queryRawUnsafe(
      biensQuery,
      ...queryParams,
      perPage,
      offset
    ) as any[];

    // Récupérer les quartiers et communes pour tous les biens
    const quartierIds = [...new Set(biens.map((b: any) => b.id_quartier).filter(Boolean))];
    let quartiersData: any[] = [];
    let communesData: any[] = [];
    
    if (quartierIds.length > 0) {
      const quartierIdsStr = quartierIds.map(id => `'${id}'`).join(',');
      quartiersData = await prisma.$queryRawUnsafe(`
        SELECT q.id, q.nom, q.id_commune, c.nom as commune_nom, c.id as commune_id
        FROM quartiers q
        LEFT JOIN communes c ON q.id_commune = c.id
        WHERE q.id IN (${quartierIdsStr})
      `) as any[];
    }

    // Formater les biens avec leurs données
    const biensFormatted = biens.map((bien: any) => {
      const quartierData = quartiersData.find((q: any) => Number(q.id) === bien.id_quartier);
      
      return {
        code: bien.code,
        nom: bien.nom,
        description: bien.description,
        prix_vente: bien.prix_vente ? Number(bien.prix_vente) : 0,
        surface: bien.surface || 0,
        piece: bien.piece || 0,
        chambre: bien.chambre || 0,
        type_annonce: bien.type_annonce,
        code_categorie: bien.code_categorie,
        image: bien.image,
        created_at: bien.created_at,
        updated_at: bien.updated_at,
        categorie: bien.categorie_nom ? {
          code: bien.categorie_code,
          nom: bien.categorie_nom,
        } : null,
        quartier: quartierData ? {
          id: Number(quartierData.id),
          nom: quartierData.nom,
        } : null,
        commune: quartierData ? {
          id: Number(quartierData.commune_id),
          nom: quartierData.commune_nom,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        data: biensFormatted,
        current_page: page,
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total,
      },
    });
  } catch (error) {
    console.error('Erreur API biens:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extraire les données du formulaire
    const type = formData.get('type') as string;
    const categorie = formData.get('categorie') as string;
    const souscategorie = formData.get('souscategorie') as string || null;
    const meuble = formData.get('meuble') as string;
    const piece = formData.get('piece') as string;
    const chambre = formData.get('chambre') as string;
    const surface = formData.get('surface') as string;
    const prix = formData.get('prix') as string;
    const commune = formData.get('commune') as string;
    const quartier = formData.get('quartier') as string;
    const description = formData.get('description') as string;
    const approuve = formData.get('approuve') as string;

    // Extraire les caractéristiques
    const caracteristiques: number[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('caracteristiques[')) {
        caracteristiques.push(parseInt(value as string));
      }
    });

    // Extraire les images
    const images: File[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('images[') && value instanceof File) {
        images.push(value);
      }
    });

    console.log('Données reçues:', {
      type, categorie, souscategorie, meuble, piece, chambre, 
      surface, prix, commune, quartier, description, approuve,
      caracteristiques, imagesCount: images.length
    });

    // Valider les champs requis
    if (!type || !categorie || !prix || !commune || !quartier || !description) {
      return NextResponse.json(
        { success: false, message: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur connecté depuis le token
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié - Token manquant' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const client_owner_id = parseInt(payload.userId);

    // Générer un code unique pour le produit (8 caractères aléatoires comme dans l'exemple)
    const code = Math.random().toString(36).substring(2, 10);

    // Générer le nom du produit
    const categorieData = await prisma.$queryRawUnsafe(
      'SELECT nom FROM categories WHERE code = ?',
      categorie
    ) as any[];
    const categorieNom = categorieData[0]?.nom || 'Bien';
    
    const communeData = await prisma.$queryRawUnsafe(
      'SELECT nom FROM communes WHERE id = ?',
      parseInt(commune)
    ) as any[];
    const communeNom = communeData[0]?.nom || '';

    const nom = `${categorieNom} ${piece || ''} pièce(s) à ${type === 'louer' ? 'louer' : 'vendre'} à ${communeNom}`;

    // Upload des images
    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'annonces');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imagesPaths: string[] = [];
    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${image.name.split('.').pop()}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      imagesPaths.push(`/assets/annonces/${filename}`);
    }

    // Stocker les images en JSON comme dans Laravel
    const imagesJson = JSON.stringify(imagesPaths);

    // Insérer le produit en base de données
    await prisma.$queryRawUnsafe(`
      INSERT INTO produits (
        code, nom, image, prix_vente, description, code_categorie, code_souscategorie,
        surface, piece, chambre, id_commune, id_quartier, type_annonce, meuble,
        enabled, client_owner_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      code,
      nom,
      imagesJson,
      parseInt(prix),
      description,
      categorie,
      souscategorie || null,
      surface ? parseInt(surface) : 0,
      piece ? parseInt(piece) : 0,
      chambre ? parseInt(chambre) : 0,
      parseInt(commune),
      parseInt(quartier),
      type,
      meuble ? parseInt(meuble) : null,
      0, // enabled = 0 (en attente de validation)
      client_owner_id
    );

    // Insérer les caractéristiques si présentes
    if (caracteristiques.length > 0) {
      for (const caracteristiqueId of caracteristiques) {
        await prisma.$queryRawUnsafe(`
          INSERT INTO caracretistique_produits (caracteristique_id, produit_code, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, caracteristiqueId, code);
      }
    }

    // Récupérer les infos du client pour l'email
    const clientData = await prisma.clients.findUnique({
      where: { id: client_owner_id },
      select: { nom: true, prenom: true, email: true }
    });

    // Envoyer les emails (au client et à l'admin)
    try {
      if (clientData) {
        // Email au client : annonce en attente de validation
        await sendEmail({
          to: clientData.email,
          subject: 'Annonce en attente de validation - Toubabi',
          html: getPatienterTemplate({ prenom: clientData.prenom || '', nom: clientData.nom || '' })
        });

        // Email à l'admin : nouvelle annonce soumise
        const adminEmail = await getAdminEmail();
        await sendEmail({
          to: adminEmail,
          subject: 'Nouvelle annonce soumise - Toubabi',
          html: getNewAnnonceAdminTemplate({
            nom,
            client: `${clientData.prenom} ${clientData.nom}`,
            prix: parseInt(prix).toLocaleString('fr-FR'),
            categorie: categorieNom
          })
        });

        console.log('Emails de nouvelle annonce envoyés');
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails d\'annonce:', emailError);
      // On continue même si l'email n'a pas pu être envoyé
    }
    
    return NextResponse.json({
      success: true,
      message: 'Annonce créée avec succès et en attente de validation',
      data: {
        code,
        nom,
        type_annonce: type,
        code_categorie: categorie,
        prix_vente: parseInt(prix),
        images_count: imagesPaths.length,
      }
    });

  } catch (error: any) {
    console.error('Erreur création annonce:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

