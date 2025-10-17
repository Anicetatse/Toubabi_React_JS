import nodemailer from 'nodemailer';
import path from 'path';

// URL de base du site (à configurer dans .env.local)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toubabi.com';

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '465'),
  secure: true, // true pour le port 465
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Vérifier la configuration au démarrage (optionnel)
transporter.verify((error: Error | null, success: any) => {
  if (error) {
    console.error('Erreur de configuration email:', error);
  } else {
    console.log('Serveur email prêt pour l\'envoi de messages');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'img', 'logo.png');
    
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || 'Toubabi'}" <${process.env.MAIL_USERNAME}>`,
      to,
      subject,
      html,
      attachments: [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo@toubabi' // Content-ID pour référencer l'image dans le HTML
      }]
    });

    console.log('Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error };
  }
}

// Template pour le compte désactivé
export function getCompteDesactiveTemplate(client: { prenom: string; nom: string }) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Notification de désactivation de compte</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .title { font-size: 32px; font-weight: 700; color: #4d4d4d; padding: 35px 0 0; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="title">Compte désactivé</div>
              <p class="text">
                Bonjour M./Mme ${client.prenom} ${client.nom},<br><br>
                Nous vous informons que votre compte sur ${SITE_URL} a été désactivé par l'administrateur.<br><br>
                Veuillez contacter l'administrateur pour plus de détails.<br><br>
                Merci et à bientôt.
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour l'email à l'admin lors d'une nouvelle inscription
export function getNewUserAdminTemplate(data: { 
  fullname: string; 
  email: string; 
  telephone: string; 
  type_compte: string;
}) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nouvelle demande d'inscription</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .title { font-size: 32px; font-weight: 700; color: #4d4d4d; padding: 35px 0 0; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="title">Nouvelle Demande d'Inscription !</div>
              <p class="text">
                Bonjour,<br><br>
                Nouvelle demande d'inscription sur Toubabi<br>
                Veuillez examiner la demande et activer le compte si nécessaire.<br><br>
                <strong>Nom :</strong> ${data.fullname}<br>
                <strong>Email :</strong> ${data.email}<br>
                <strong>Numéro :</strong> ${data.telephone}<br>
                <strong>Type de Compte :</strong> ${data.type_compte}<br><br>
                Veuillez vous connecter à la partie administrateur de Toubabi pour examiner cette demande.
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour le client en attente de validation
export function getPatienterTemplate(client: { prenom: string; nom: string }) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Demande de création de compte</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
    a { color: #ff0000; text-decoration: none; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <p class="text">
                Bonjour ${client.prenom} ${client.nom},<br><br>
                Nous avons bien reçu votre demande de création de compte.<br>
                Votre requête est en cours de traitement.<br>
                Vous recevrez une notification par mail dès que votre espace personnel sera créé.<br><br>
                Dans l'attente vous pouvez poursuivre votre découverte des bonnes pratiques nécessaires à la
                protection de vos acquisitions 
                <a href="${SITE_URL}/tout-savoir" style="color: red;">en cliquant ici</a><br><br>
                <strong>Bien à vous,<br>
                L'Équipe Toubabi</strong><br><br>
                <strong>1er *F.AN. de l'immobilier ivoirien</strong><br>
                <strong>*Filtre Anti Nuisance</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour le compte activé
export function getCompteActiveTemplate(client: { prenom: string; nom: string }) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirmation de l'activation de votre compte</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
    a { color: #ff0000; text-decoration: none; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <p class="text">
                Bonjour ${client.prenom} ${client.nom},<br><br>
                FÉLICITATIONS !<br>
                Nous vous confirmons que votre compte sur ${SITE_URL} a été activé.<br><br>
                Lorsqu'une personne manifestera son intérêt pour votre bien, vous recevrez un e-mail et un SMS sur le numéro que vous avez utilisé pour vous enregistrer.<br><br>
                Procédez dès maintenant à toutes vos simulations et prenez une option sérieuse sur la concrétisation de vos projets de construction 
                <a href="${SITE_URL}/tout-savoir" style="color: red;">en cliquant ici</a><br><br>
                N'hésitez pas à nous envoyer toutes vos questions et préoccupations en remplissant le formulaire de contact 
                <a href="${SITE_URL}/contactez-nous" style="color: red;">en cliquant ici</a><br><br>
                <strong>Bien à vous,<br>
                L'Équipe Toubabi</strong><br><br>
                <strong>1er *F.AN. de l'immobilier ivoirien</strong><br>
                <strong>*Filtre Anti Nuisance</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour annonce validée (envoyé au client)
export function getAnnonceValideeTemplate(annonce: { nom: string }) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Annonce validée</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .title { font-size: 32px; font-weight: 700; color: #4d4d4d; padding: 35px 0 0; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="title">Annonce validée !</div>
              <p class="text">
                Votre annonce "${annonce.nom}" a été mise en ligne !<br><br>
                Après vérification des différentes informations que vous avez fournies, votre annonce a été acceptée et mise en ligne.<br><br>
                Merci pour votre confiance !<br><br>
                <a href="${SITE_URL}/mon-espace/annonces" style="display: inline-block; padding: 12px 30px; background-color: #ff6f6f; color: #ffffff; border-radius: 5px; text-decoration: none;">Mes annonces</a>
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour notification admin de nouvelle annonce
export function getNewAnnonceAdminTemplate(annonce: { nom: string; client: string; prix: string; categorie: string; }) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nouvelle annonce soumise</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .title { font-size: 32px; font-weight: 700; color: #4d4d4d; padding: 35px 0 0; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="title">Nouvelle Annonce Soumise !</div>
              <p class="text">
                Bonjour,<br><br>
                Une nouvelle annonce a été soumise sur Toubabi et est en attente de validation.<br><br>
                <strong>Titre :</strong> ${annonce.nom}<br>
                <strong>Client :</strong> ${annonce.client}<br>
                <strong>Catégorie :</strong> ${annonce.categorie}<br>
                <strong>Prix :</strong> ${annonce.prix} FCFA<br><br>
                Veuillez vous connecter à la partie administrateur pour examiner et valider cette annonce.
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour notification admin de formulaire de contact
export function getContactAdminTemplate(data: { name: string; email: string; message: string; }) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nouvelle demande de contact</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .title { font-size: 32px; font-weight: 700; color: #4d4d4d; padding: 35px 0 0; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="title">Demande de contact</div>
              <p class="text">
                Bonjour,<br><br>
                Nouvelle demande de contact sur Toubabi<br><br>
                <strong>Nom :</strong> ${data.name}<br>
                <strong>Email :</strong> ${data.email}<br>
                <strong>Message :</strong> ${data.message}<br><br>
                Veuillez vous connecter à la partie administrateur de Toubabi pour examiner cette demande.
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Fonction pour récupérer l'email admin
export async function getAdminEmail(): Promise<string> {
  return process.env.ADMIN_EMAIL || 'toubabi.ci@gmail.com';
}

// Template pour confirmation d'estimation au client
export function getEstimationClientTemplate(info: {
  fullname: string;
  commune: string;
  quartier: string;
  superficie: string;
  standing: string;
  niveau: string;
  pieces: string;
}) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Votre demande d'estimation</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 5px 0; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <p class="text">
                Bonjour Mme/M. ${info.fullname},<br><br>
                Merci de nous avoir contactés.<br>
                L'estimation demandée vous sera communiquée, entre 8h et 20h GMT, à l'adresse mail que vous avez fournie.<br><br>
                Vous recevrez éventuellement une alerte SMS qui vous invitera à vérifier votre boîte de réception et vos spams.<br><br>
                <strong>Détails de votre demande :</strong>
              </p>
              <ul class="text" style="text-align: left; max-width: 400px; margin: 20px auto;">
                <li><strong>Commune :</strong> ${info.commune}</li>
                <li><strong>Quartier :</strong> ${info.quartier}</li>
                <li><strong>Superficie :</strong> ${info.superficie} m²</li>
                <li><strong>Standing :</strong> ${info.standing}</li>
                <li><strong>Niveau :</strong> ${info.niveau}</li>
                <li><strong>Nombre de pièces :</strong> ${info.pieces}</li>
              </ul>
              <p class="text">
                Nous traitons actuellement vos informations et vous recevrez bientôt une réponse.<br><br>
                Bien à vous,<br>
                L'Équipe Toubabi
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour notification admin d'estimation
export function getEstimationAdminTemplate(data: {
  clientName: string;
  clientEmail: string;
  clientContact: string;
  selected_commune: string;
  selected_quartier: string;
  superficie: string;
  standing: string;
  niveau: string;
  pieces: string;
}) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nouvelle demande d'estimation</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .title { font-size: 32px; font-weight: 700; color: #4d4d4d; padding: 35px 0 0; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 5px 0; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="title">Nouvelle demande d'estimation reçue</div>
              <p class="text">Voici les détails de la demande :</p>
              <ul class="text" style="text-align: left; max-width: 400px; margin: 20px auto;">
                <li><strong>Nom et Prénom :</strong> ${data.clientName}</li>
                <li><strong>Email :</strong> ${data.clientEmail}</li>
                <li><strong>Contact :</strong> ${data.clientContact}</li>
                <li><strong>Commune :</strong> ${data.selected_commune}</li>
                <li><strong>Quartier :</strong> ${data.selected_quartier}</li>
                <li><strong>Superficie :</strong> ${data.superficie} m²</li>
                <li><strong>Standing :</strong> ${data.standing}</li>
                <li><strong>Niveau :</strong> ${data.niveau}</li>
                <li><strong>Nombre de pièces :</strong> ${data.pieces}</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour notifier l'annonceur d'un intérêt pour son bien
export function getInteretAnnonceurTemplate(data: {
  fullname: string;
  email: string;
  numero: string;
  description: string;
  bien_nom: string;
  bien_prix: string;
  commande_id: string;
  commande_date: string;
}) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Intérêt pour votre bien</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .title { font-size: 32px; font-weight: 700; color: #4d4d4d; padding: 35px 0 0; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
    .info-box { background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 5px; padding: 15px; margin: 10px 0; text-align: left; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="title">Intérêt pour un bien !</div>
              <p class="text">
                M./Mme ${data.fullname},<br><br>
                porte de l'intérêt pour le bien ci-dessous. Les informations de contact du client sont mentionnées ci-dessous.<br>
                N'hésitez pas à entrer en contact dès que possible pour fournir plus d'informations.
              </p>
              <div class="info-box">
                <strong>Informations Client</strong><br>
                <strong>Nom :</strong> ${data.fullname}<br>
                <strong>Email :</strong> ${data.email}<br>
                <strong>Numéro :</strong> ${data.numero}<br>
                <strong>Détail :</strong> ${data.description}
              </div>
              <div class="info-box">
                <strong>Détails du bien</strong><br>
                <strong>Bien :</strong> ${data.bien_nom}<br>
                <strong>Prix :</strong> ${data.bien_prix} FCFA<br><br>
                <strong>Date :</strong> ${data.commande_date}<br>
                <strong>Numéro de demande :</strong> #${data.commande_id}
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Template pour notifier l'admin d'un intérêt pour un bien
export function getInteretAdminTemplate(data: {
  fullname: string;
  email: string;
  numero: string;
  description: string;
  annonceur_fullname: string;
  annonceur_email: string;
  annonceur_numero: string;
  bien_nom: string;
  bien_prix: string;
  commande_id: string;
  commande_date: string;
}) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Intérêt pour un bien</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f7f7f7; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #ffffff; }
    .content { padding: 40px 60px; background-color: #f7f7f7; }
    .title { font-size: 32px; font-weight: 700; color: #4d4d4d; padding: 35px 0 0; }
    .text { font-size: 14px; color: #777777; line-height: 21px; }
    .footer { padding: 25px; text-align: center; background-color: #f7f7f7; font-size: 12px; color: #999999; }
    .info-box { background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 5px; padding: 15px; margin: 10px 0; text-align: left; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="cid:logo@toubabi" alt="Toubabi" width="137" height="47" />
            </td>
          </tr>
          <tr>
            <td class="content">
              <div class="title">Intérêt pour un bien !</div>
              <p class="text">
                M./Mme ${data.fullname},<br><br>
                porte de l'intérêt au bien ci-dessous. Les informations de contact du client et de l'annonceur sont mentionnées ci-dessous.
              </p>
              <div class="info-box">
                <strong>Annonceur</strong><br>
                <strong>Nom :</strong> ${data.annonceur_fullname}<br>
                <strong>Email :</strong> ${data.annonceur_email}<br>
                <strong>Contact :</strong> ${data.annonceur_numero}
              </div>
              <div class="info-box">
                <strong>Client intéressé</strong><br>
                <strong>Nom :</strong> ${data.fullname}<br>
                <strong>Email :</strong> ${data.email}<br>
                <strong>Numéro :</strong> ${data.numero}<br>
                <strong>Détail :</strong> ${data.description}
              </div>
              <div class="info-box">
                <strong>Bien concerné</strong><br>
                <strong>Titre :</strong> ${data.bien_nom}<br>
                <strong>Prix :</strong> ${data.bien_prix} FCFA<br><br>
                <strong>Date :</strong> ${data.commande_date}<br>
                <strong>Numéro de demande :</strong> #${data.commande_id}
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>${SITE_URL}</strong><br />
              Côte d'Ivoire, Abidjan<br />
              © ${new Date().getFullYear()} Toubabi, Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
