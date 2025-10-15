import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const commandes = await prisma.commandes.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        details: {
          include: {
            produit: {
              select: {
                id: true,
                titre: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const commandesFormatted = commandes.map((c) => ({
      id: Number(c.id),
      user_id: Number(c.user_id),
      total: Number(c.total),
      statut: c.statut,
      created_at: c.created_at?.toISOString(),
      user: { ...c.user, id: Number(c.user.id) },
      details: c.details.map((d) => ({
        id: Number(d.id),
        quantite: d.quantite,
        prix_unitaire: Number(d.prix_unitaire),
        produit: {
          id: Number(d.produit.id),
          titre: d.produit.titre,
          images: d.produit.images.map((img) => ({
            id: Number(img.id),
            url: img.url,
          })),
        },
      })),
    }));

    return NextResponse.json({
      success: true,
      data: commandesFormatted,
    });
  } catch (error) {
    console.error('Erreur API commandes:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

