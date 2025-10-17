import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Liste toutes les caractéristiques
export async function GET(request: NextRequest) {
  try {
    // Utiliser une requête SQL brute pour voir la structure réelle
    const caracteristiques = await prisma.$queryRawUnsafe(`
      SELECT * FROM caracteristiques ORDER BY nom ASC
    `) as any[];

    // Formater les données
    const formatted = caracteristiques.map(carac => ({
      id: carac.id.toString(),
      nom: carac.nom,
      active: carac.active || 1,
      created_at: carac.created_at ? new Date(carac.created_at).toISOString() : null,
      updated_at: carac.updated_at ? new Date(carac.updated_at).toISOString() : null
    }));

    return NextResponse.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des caractéristiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des caractéristiques' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle caractéristique
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom } = body;

    // Validation
    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Vérifier les colonnes disponibles
    const columns = await prisma.$queryRawUnsafe(`
      SHOW COLUMNS FROM caracteristiques
    `) as any[];
    
    const columnNames = columns.map((col: any) => col.Field);
    console.log('Colonnes disponibles (caracteristiques):', columnNames);

    // Construire la requête INSERT
    const values: any[] = [nom];
    let insertQuery = 'INSERT INTO caracteristiques (nom';

    if (columnNames.includes('active')) {
      insertQuery += ', active';
      values.push(1);
    }

    if (columnNames.includes('created_at')) {
      insertQuery += ', created_at';
      values.push(new Date());
    }

    if (columnNames.includes('updated_at')) {
      insertQuery += ', updated_at';
      values.push(new Date());
    }

    const placeholders = values.map(() => '?').join(', ');
    insertQuery += `) VALUES (${placeholders})`;

    await prisma.$queryRawUnsafe(insertQuery, ...values);

    return NextResponse.json({
      success: true,
      message: 'Caractéristique créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la caractéristique' },
      { status: 500 }
    );
  }
}

