import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur admin existe
    const admin = await prisma.users.findFirst({
      where: { 
        email: email
      }
    });

    // Pour des raisons de sécurité, on retourne toujours un succès
    // même si l'email n'existe pas (pour ne pas divulguer si un compte existe)
    if (!admin) {
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Stocker le token dans la base de données via requête SQL directe
    await prisma.$executeRaw`
      UPDATE users 
      SET reset_token = ${resetToken}, 
          reset_token_expiry = ${resetTokenExpiry},
          updated_at = NOW()
      WHERE id = ${admin.id}
    `;

    // Créer le lien de réinitialisation
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4001'}/admin/reset-password?token=${resetToken}`;

    // Template d'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${admin.name}</strong>,</p>
            
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte administrateur.</p>
            
            <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important :</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Ce lien est valide pendant <strong>1 heure</strong></li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Ne partagez jamais ce lien avec personne</li>
              </ul>
            </div>
            
            <p>Cordialement,<br><strong>L'équipe Toubabi</strong></p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par Toubabi - Plateforme Immobilière</p>
            <p>© ${new Date().getFullYear()} Toubabi. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'email
    await sendEmail({
      to: admin.email,
      subject: 'Réinitialisation de votre mot de passe - Toubabi Admin',
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

