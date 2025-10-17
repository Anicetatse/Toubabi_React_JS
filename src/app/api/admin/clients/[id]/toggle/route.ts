import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import { sendEmail, getCompteDesactiveTemplate, getCompteActiveTemplate } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const clientId = parseInt(params.id);

    // Récupérer le client actuel
    const client = await prisma.clients.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        enabled: true
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // Inverser le statut
    const newStatus = !Boolean(client.enabled);

    // Mettre à jour le client
    await prisma.clients.update({
      where: { id: clientId },
      data: {
        enabled: newStatus,
        updated_at: new Date()
      }
    });

    // Envoyer l'email approprié
    try {
      const emailData = {
        to: client.email,
        subject: newStatus ? 'Activation de votre compte Toubabi' : 'Désactivation de votre compte Toubabi',
        html: newStatus 
          ? getCompteActiveTemplate({ prenom: client.prenom || '', nom: client.nom || '' })
          : getCompteDesactiveTemplate({ prenom: client.prenom || '', nom: client.nom || '' })
      };

      await sendEmail(emailData);
      console.log(`Email ${newStatus ? 'activation' : 'désactivation'} envoyé à ${client.email}`);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue même si l'email n'a pas pu être envoyé
    }

    return NextResponse.json({
      success: true,
      message: newStatus ? 'Client activé avec succès' : 'Client désactivé avec succès',
      enabled: newStatus
    });

  } catch (error) {
    console.error('Erreur lors du changement de statut du client:', error);
    return NextResponse.json(
      { error: 'Erreur lors du changement de statut' },
      { status: 500 }
    );
  }
}

