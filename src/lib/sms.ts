import axios from 'axios';

// Configuration Orange SMS API
const ORANGE_SMS_CLIENT_ID = process.env.ORANGE_SMS_CLIENT_ID || 'nWUrnW3EBj9LmZ5GBbceJJlWZWcikxLV';
const ORANGE_SMS_CLIENT_SECRET = process.env.ORANGE_SMS_CLIENT_SECRET || 'CsGGGsP04GkXI9bG';
const ORANGE_SMS_SENDER = process.env.ORANGE_SMS_SENDER || '+2250788364403';
const ORANGE_SMS_API_URL = 'https://api.orange.com/smsmessaging/v1';

interface SMSOptions {
  to: string; // Numéro du destinataire
  message: string; // Contenu du SMS
}

// Fonction pour obtenir le token d'accès Orange
async function getOrangeAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post(
      'https://api.orange.com/oauth/v3/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${ORANGE_SMS_CLIENT_ID}:${ORANGE_SMS_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token Orange SMS:', error);
    return null;
  }
}

// Fonction pour formater le numéro de téléphone
function formatPhoneNumber(numero: string): string {
  // Nettoyer le numéro
  let cleanNumber = numero.replace(/\s+/g, '').replace(/-/g, '');
  
  // Si le numéro ne commence pas par + ou 00, ajouter l'indicatif Côte d'Ivoire
  if (!cleanNumber.startsWith('+') && !cleanNumber.startsWith('00')) {
    cleanNumber = '+225' + cleanNumber;
  }
  
  // Convertir 00 en +
  if (cleanNumber.startsWith('00')) {
    cleanNumber = '+' + cleanNumber.substring(2);
  }
  
  return cleanNumber;
}

// Fonction pour envoyer un SMS via Orange API
export async function sendSMS({ to, message }: SMSOptions) {
  try {
    // Formater le numéro
    const formattedNumber = formatPhoneNumber(to);
    
    // Obtenir le token d'accès
    const accessToken = await getOrangeAccessToken();
    if (!accessToken) {
      console.error('Impossible d\'obtenir le token Orange SMS');
      return { success: false, error: 'Token non disponible' };
    }

    // Envoyer le SMS
    const response = await axios.post(
      `${ORANGE_SMS_API_URL}/outbound/${encodeURIComponent(ORANGE_SMS_SENDER)}/requests`,
      {
        outboundSMSMessageRequest: {
          address: `tel:${formattedNumber}`,
          senderAddress: `tel:${ORANGE_SMS_SENDER}`,
          senderName: 'Toubabi',
          outboundSMSTextMessage: {
            message: message
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('SMS envoyé avec succès à', formattedNumber);
    return { success: true, data: response.data };

  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du SMS:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Template SMS pour notification d'intérêt à l'annonceur
export function getSMSInteretAnnonceur(data: {
  annonceur_nom: string;
  bien_nom: string;
  bien_prix: string;
}): string {
  return `Mme/M. ${data.annonceur_nom},

un utilisateur a montré de l'intérêt pour l'annonce suivante :

Bien : ${data.bien_nom}
Prix : ${data.bien_prix} FCFA

Veuillez vous connecter à votre boite mail pour plus de détail en vue de traiter sa demande.

Cordialement,
L'équipe Toubabi`;
}

