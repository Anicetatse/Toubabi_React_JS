import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les commentaires d'un produit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const produit_code = searchParams.get('produit_code');

    if (!produit_code) {
      return NextResponse.json(
        { error: 'Le code du produit est requis' },
        { status: 400 }
      );
    }

    // Récupérer les commentaires actifs du produit
    const commentaires = await prisma.commentaires.findMany({
      where: {
        produit_code,
        active: 1, // Seulement les commentaires approuvés
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Formater les données
    const formattedCommentaires = commentaires.map(comment => ({
      id: comment.id.toString(),
      nom: comment.nom,
      commentaire: comment.commentaire,
      note: comment.note ? Number(comment.note) : null,
      active: comment.active,
      produit_code: comment.produit_code,
      created_at: comment.created_at?.toISOString() || null,
      updated_at: comment.updated_at?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCommentaires,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Ajouter un commentaire
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, commentaire, note, produit_code } = body;

    // Validation
    if (!nom || !commentaire || !note || !produit_code) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (note < 1 || note > 5) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      );
    }

    // Insérer le commentaire (actif par défaut)
    const newComment = await prisma.commentaires.create({
      data: {
        nom,
        commentaire,
        note: BigInt(note),
        produit_code,
        active: 1, // Actif par défaut (visible immédiatement)
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Commentaire ajouté avec succès !',
        data: {
          id: newComment.id.toString(),
          nom: newComment.nom,
          commentaire: newComment.commentaire,
          note: Number(newComment.note),
          active: newComment.active,
          produit_code: newComment.produit_code,
          created_at: newComment.created_at?.toISOString() || null,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

