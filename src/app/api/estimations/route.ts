import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth-utils';
import { sendEmail, getEstimationClientTemplate, getEstimationAdminTemplate, getAdminEmail } from '@/lib/email';

// Fonction pour convertir le standing en description
function getStandingDescription(standing: string): string {
  switch (standing) {
    case 'bas':
      return 'Standing économique (bas)';
    case 'moyen':
      return 'Milieu de gamme (moyen)';
    case 'haut':
      return 'Haut de gamme (haut)';
    case 'tres_haut':
      return 'Luxe (très haut)';
    default:
      return 'Inconnu';
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié - Veuillez vous connecter' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      selected_commune_id, 
      selected_quartier_id, 
      superficie, 
      standing, 
      niveau, 
      pieces 
    } = body;

    // Validation
    if (!selected_commune_id || !selected_quartier_id || !superficie || !standing || !niveau || !pieces) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur connecté
    const userId = parseInt(payload.userId);
    const client = await prisma.clients.findUnique({
      where: { id: userId },
      select: { nom: true, prenom: true, email: true, telephone: true }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer commune et quartier
    const communeData = await prisma.$queryRawUnsafe(
      'SELECT nom FROM communes WHERE id = ?',
      parseInt(selected_commune_id)
    ) as any[];
    const commune = communeData[0]?.nom || 'Inconnu';

    const quartierData = await prisma.$queryRawUnsafe(
      'SELECT nom FROM quartiers WHERE id = ?',
      parseInt(selected_quartier_id)
    ) as any[];
    const quartier = quartierData[0]?.nom || 'Inconnu';

    const clientName = `${client.prenom} ${client.nom}`;
    const standingDescription = getStandingDescription(standing);

    // Envoyer les emails
    try {
      // Email au client : confirmation
      await sendEmail({
        to: client.email,
        subject: 'Votre demande d\'estimation - Toubabi',
        html: getEstimationClientTemplate({
          fullname: clientName,
          commune,
          quartier,
          superficie: superficie.toString(),
          standing: standingDescription,
          niveau,
          pieces: pieces.toString()
        })
      });

      // Email à l'admin : nouvelle demande
      const adminEmail = await getAdminEmail();
      await sendEmail({
        to: adminEmail,
        subject: 'Nouvelle demande d\'estimation - Toubabi',
        html: getEstimationAdminTemplate({
          clientName,
          clientEmail: client.email,
          clientContact: client.telephone || 'Non fourni',
          selected_commune: commune,
          selected_quartier: quartier,
          superficie: superficie.toString(),
          standing: standingDescription,
          niveau,
          pieces: pieces.toString()
        })
      });

      console.log('Emails d\'estimation envoyés');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails d\'estimation:', emailError);
      // On continue même si l'email n'a pas pu être envoyé
    }

    return NextResponse.json({
      success: true,
      message: 'Demande d\'estimation soumise avec succès ! Merci de vérifier votre boîte de réception et vos spams dans le prochain quart d\'heure.'
    });

  } catch (error: any) {
    console.error('Erreur lors du traitement de l\'estimation:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors du traitement' },
      { status: 500 }
    );
  }
}
