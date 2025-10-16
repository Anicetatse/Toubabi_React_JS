import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

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
        { error: 'Bien non trouvé' },
        { status: 404 }
      );
    }

    const bien = biens[0];

    // Récupérer la commune
    let commune = null;
    if (bien.id_commune) {
      const communeQuery = `SELECT * FROM communes WHERE id = ? LIMIT 1`;
      const communeResult = await prisma.$queryRawUnsafe<any[]>(communeQuery, bien.id_commune);
      commune = communeResult[0] || null;
    }

    // Récupérer le quartier
    let quartier = null;
    console.log('🔍 Recherche quartier pour id_quartier:', bien.id_quartier, 'Type:', typeof bien.id_quartier);
    
    if (bien.id_quartier) {
      const quartierQuery = `SELECT * FROM quartiers WHERE id = ? LIMIT 1`;
      console.log('📝 Exécution requête quartier:', quartierQuery, 'Param:', bien.id_quartier);
      
      const quartierResult = await prisma.$queryRawUnsafe<any[]>(quartierQuery, bien.id_quartier);
      console.log('📦 Résultat brut quartier:', quartierResult);
      
      quartier = quartierResult[0] || null;
      console.log('🗺️ Quartier final:', quartier);
      
      if (quartier) {
        console.log('📍 Coordonnées quartier:', {
          nom: quartier.nom,
          lat: quartier.lat,
          lng: quartier.lng,
          lat_type: typeof quartier.lat,
          lng_type: typeof quartier.lng
        });
      } else {
        console.log('❌ Quartier null après extraction');
      }
    } else {
      console.log('⚠️ Pas de id_quartier sur ce bien');
    }

    // Récupérer l'annonceur (client)
    let annonceur = null;
    if (bien.client_owner_id) {
      const annonceurQuery = `SELECT id, nom, prenom, telephone, email, type_compte FROM clients WHERE id = ? LIMIT 1`;
      const annonceurResult = await prisma.$queryRawUnsafe<any[]>(annonceurQuery, bien.client_owner_id);
      annonceur = annonceurResult[0] || null;
    }

    // Récupérer les commentaires avec la note moyenne
    const commentairesQuery = `
      SELECT * FROM commentaires 
      WHERE produit_code = ? 
      ORDER BY created_at DESC
    `;
    const commentaires = await prisma.$queryRawUnsafe<any[]>(commentairesQuery, code);

    // Calculer la note moyenne
    const totalNotes = commentaires.length;
    console.log('📊 Commentaires trouvés:', totalNotes);
    console.log('📝 Commentaires:', commentaires.map(c => ({ nom: c.nom, note: c.note })));
    const sumNotes = commentaires.reduce((sum, c) => sum + Number(c.note || 0), 0);
    const averageNote = totalNotes > 0 ? (sumNotes / totalNotes).toFixed(1) : 0;
    console.log('⭐ Note moyenne calculée:', averageNote);

    // Formater la réponse et convertir tous les BigInt
    const bienFormatted = convertBigIntToNumber({
      ...bien,
      commune,
      quartier,
      annonceur,
      commentaires,
      averageNote,
      totalComments: totalNotes,
    });

    return NextResponse.json(bienFormatted);

  } catch (error) {
    console.error('Erreur lors de la récupération du bien:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

