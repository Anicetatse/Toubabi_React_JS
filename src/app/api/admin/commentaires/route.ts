import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Liste tous les commentaires avec infos produit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';

    const skip = (page - 1) * limit;

    // Construction de la clause where
    const where: any = {};

    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { commentaire: { contains: search } },
        { produit: { nom: { contains: search } } }
      ];
    }

    if (statusFilter === 'active') {
      where.active = 1;
    } else if (statusFilter === 'inactive') {
      where.active = 0;
    }

    // Récupérer les commentaires avec les informations du produit
    const [commentaires, total] = await Promise.all([
      prisma.commentaires.findMany({
        where,
        include: {
          produit: {
            select: {
              code: true,
              nom: true,
              image: true,
              type_annonce: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.commentaires.count({ where })
    ]);

    // Récupérer les stats
    const stats = {
      total: await prisma.commentaires.count(),
      active: await prisma.commentaires.count({ where: { active: 1 } }),
      inactive: await prisma.commentaires.count({ where: { active: 0 } }),
      thisMonth: await prisma.commentaires.count({
        where: {
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    };

    // Formater les données pour le frontend
    const formattedCommentaires = commentaires.map(comment => ({
      id: comment.id.toString(),
      nom: comment.nom,
      commentaire: comment.commentaire,
      note: comment.note ? Number(comment.note) : null,
      active: comment.active,
      produit_code: comment.produit_code,
      produit_nom: comment.produit?.nom || 'Produit supprimé',
      produit_image: comment.produit?.image || null,
      produit_type: comment.produit?.type_annonce || null,
      created_at: comment.created_at?.toISOString() || null,
      updated_at: comment.updated_at?.toISOString() || null
    }));

    return NextResponse.json({
      data: formattedCommentaires,
      total,
      page,
      limit,
      stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

