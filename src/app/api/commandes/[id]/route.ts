import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commandeId = BigInt(id);

    const commande = await prisma.commandes.findUnique({
      where: { id: commandeId },
      include: {
        user: true,
        details: {
          include: {
            produit: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!commande) {
      return NextResponse.json(
        { success: false, message: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    const commandeFormatted = {
      id: Number(commande.id),
      total: Number(commande.total),
      statut: commande.statut,
      created_at: commande.created_at?.toISOString(),
      details: commande.details.map((d) => ({
        id: Number(d.id),
        quantite: d.quantite,
        prix_unitaire: Number(d.prix_unitaire),
        produit: {
          id: Number(d.produit.id),
          titre: d.produit.titre,
          prix: Number(d.produit.prix),
          images: d.produit.images.map((img) => ({
            id: Number(img.id),
            url: img.url,
          })),
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: commandeFormatted,
    });
  } catch (error) {
    console.error('Erreur API commande détail:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

