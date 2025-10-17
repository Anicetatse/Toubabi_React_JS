import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import { sendEmail, getAnnonceValideeTemplate } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    // Vérifier l'authentification admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { code } = params;

    // Récupérer l'annonce actuelle
    const annonceData = await prisma.$queryRawUnsafe(`
      SELECT p.*, c.nom as client_nom, c.prenom as client_prenom, c.email as client_email
      FROM produits p
      LEFT JOIN clients c ON p.client_owner_id = c.id
      WHERE p.code = ?
    `, code) as any[];

    if (!annonceData || annonceData.length === 0) {
      return NextResponse.json({ error: 'Annonce non trouvée' }, { status: 404 });
    }

    const annonce = annonceData[0];
    const currentStatus = Boolean(annonce.enabled);
    const newStatus = !currentStatus;

    // Mettre à jour le statut
    await prisma.$queryRawUnsafe(`
      UPDATE produits 
      SET enabled = ?, updated_at = NOW() 
      WHERE code = ?
    `, newStatus ? 1 : 0, code);

    // Si l'annonce vient d'être activée, envoyer un email au client
    if (newStatus && annonce.client_email) {
      try {
        await sendEmail({
          to: annonce.client_email,
          subject: 'Annonce validée - Toubabi',
          html: getAnnonceValideeTemplate({ nom: annonce.nom })
        });
        console.log(`Email de validation envoyé à ${annonce.client_email} pour l'annonce ${annonce.nom}`);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de validation:', emailError);
        // On continue même si l'email n'a pas pu être envoyé
      }
    }

    return NextResponse.json({
      success: true,
      message: newStatus ? 'Annonce activée avec succès' : 'Annonce désactivée avec succès',
      enabled: newStatus
    });

  } catch (error) {
    console.error('Erreur lors du changement de statut de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Erreur lors du changement de statut' },
      { status: 500 }
    );
  }
}

