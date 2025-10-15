import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bienId = BigInt(id);

    const bien = await prisma.produits.findUnique({
      where: { id: bienId },
      include: {
        categorie: true,
        sous_categorie: true,
        type_annonce: true,
        quartier: {
          include: {
            commune: {
              include: {
                ville: true,
              },
            },
          },
        },
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            telephone: true,
          },
        },
        commentaires: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!bien) {
      return NextResponse.json(
        { success: false, message: 'Bien non trouvé' },
        { status: 404 }
      );
    }

    // Formatter les BigInt
    const bienFormatted = {
      ...bien,
      id: Number(bien.id),
      prix: Number(bien.prix),
      surface: bien.surface ? Number(bien.surface) : null,
      categorie_id: Number(bien.categorie_id),
      categorie: bien.categorie ? { ...bien.categorie, id: Number(bien.categorie.id) } : null,
      type_annonce: { ...bien.type_annonce, id: Number(bien.type_annonce.id) },
      quartier: {
        ...bien.quartier,
        id: Number(bien.quartier.id),
        commune_id: Number(bien.quartier.commune_id),
        prix_non_bati: bien.quartier.prix_non_bati ? Number(bien.quartier.prix_non_bati) : null,
        prix_bati: bien.quartier.prix_bati ? Number(bien.quartier.prix_bati) : null,
        commune: {
          ...bien.quartier.commune,
          id: Number(bien.quartier.commune.id),
          ville: {
            ...bien.quartier.commune.ville,
            id: Number(bien.quartier.commune.ville.id),
          },
        },
      },
      images: bien.images.map((img) => ({ ...img, id: Number(img.id) })),
      user: { ...bien.user, id: Number(bien.user.id) },
      commentaires: bien.commentaires.map((c) => ({
        ...c,
        id: Number(c.id),
        user: { ...c.user, id: Number(c.user.id) },
      })),
    };

    return NextResponse.json({
      success: true,
      data: bienFormatted,
    });
  } catch (error) {
    console.error('Erreur API bien détail:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

