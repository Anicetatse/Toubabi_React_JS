import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth-utils';
import { sendEmail, getPatienterTemplate, getNewUserAdminTemplate, getAdminEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, prenom, email, telephone, type_compte, password, password_confirmation, captcha } = body;

    // Validation
    if (!nom || !prenom || !email || !telephone || !password || !type_compte) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        { message: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingClient = await prisma.clients.findUnique({
      where: { email },
    });

    if (existingClient) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Créer le client (désactivé par défaut, en attente de validation admin)
    const hashedPassword = await hashPassword(password);
    
    const client = await prisma.clients.create({
      data: {
        nom,
        prenom,
        email,
        password: hashedPassword,
        telephone,
        type_compte,
        enabled: false, // Compte désactivé par défaut
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Envoyer les emails (au client et à l'admin)
    try {
      // Email au client : compte en attente
      await sendEmail({
        to: client.email,
        subject: 'Demande de création de compte - Toubabi',
        html: getPatienterTemplate({ prenom: client.prenom || '', nom: client.nom || '' })
      });

      // Email à l'admin : nouvelle inscription
      const adminEmail = await getAdminEmail();
      await sendEmail({
        to: adminEmail,
        subject: 'Nouvelle demande d\'inscription - Toubabi',
        html: getNewUserAdminTemplate({
          fullname: `${client.prenom} ${client.nom}`,
          email: client.email,
          telephone: client.telephone || '',
          type_compte: client.type_compte || 'client'
        })
      });

      console.log('Emails d\'inscription envoyés');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails d\'inscription:', emailError);
      // On continue même si l'email n'a pas pu être envoyé
    }

    // NE PAS connecter automatiquement - Le compte doit être validé par l'admin
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! Votre compte est en attente d\'activation. Vous recevrez un email dès que votre compte sera activé par un administrateur.'
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}

