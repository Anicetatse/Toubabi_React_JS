import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Liste tous les types d'annonces
export async function GET(request: NextRequest) {
  try {
    // Utiliser une requête SQL brute pour voir la structure réelle
    const typeAnnonces = await prisma.$queryRawUnsafe(`
      SELECT * FROM type_annonces ORDER BY id ASC
    `) as any[];

    // Formater les données en fonction de la structure réelle
    const formatted = typeAnnonces.map(type => ({
      id: type.id.toString(),
      nom: type.nom || type.name || type.libelle || 'Sans nom',
      description: type.description || '',
      created_at: type.created_at ? new Date(type.created_at).toISOString() : null,
      updated_at: type.updated_at ? new Date(type.updated_at).toISOString() : null
    }));

    return NextResponse.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types d\'annonces:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des types d\'annonces' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau type d'annonce
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, description } = body;

    // Validation
    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Vérifier d'abord les colonnes disponibles
    const columns = await prisma.$queryRawUnsafe(`
      SHOW COLUMNS FROM type_annonces
    `) as any[];
    
    const columnNames = columns.map((col: any) => col.Field);
    console.log('Colonnes disponibles:', columnNames);

    // Construire la requête INSERT en fonction des colonnes disponibles
    let insertQuery = 'INSERT INTO type_annonces (';
    const values: any[] = [];
    const placeholders: string[] = [];

    // Essayer différents noms de colonnes
    if (columnNames.includes('nom')) {
      insertQuery += 'nom';
      values.push(nom);
      placeholders.push('?');
    } else if (columnNames.includes('name')) {
      insertQuery += 'name';
      values.push(nom);
      placeholders.push('?');
    } else if (columnNames.includes('libelle')) {
      insertQuery += 'libelle';
      values.push(nom);
      placeholders.push('?');
    }

    if (columnNames.includes('description') && description) {
      if (values.length > 0) insertQuery += ', ';
      insertQuery += 'description';
      values.push(description);
      placeholders.push('?');
    }

    if (columnNames.includes('created_at')) {
      if (values.length > 0) insertQuery += ', ';
      insertQuery += 'created_at';
      values.push(new Date());
      placeholders.push('?');
    }

    if (columnNames.includes('updated_at')) {
      if (values.length > 0) insertQuery += ', ';
      insertQuery += 'updated_at';
      values.push(new Date());
      placeholders.push('?');
    }

    insertQuery += `) VALUES (${placeholders.join(', ')})`;

    await prisma.$queryRawUnsafe(insertQuery, ...values);

    return NextResponse.json({
      success: true,
      message: 'Type d\'annonce créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du type d\'annonce' },
      { status: 500 }
    );
  }
}

