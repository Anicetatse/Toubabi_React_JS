import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getInteretAnnonceurTemplate, getInteretAdminTemplate, getAdminEmail } from '@/lib/email';
import { sendSMS, getSMSInteretAnnonceur } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, email, numero, description, code_produit, id_client } = body;

    // Validation
    if (!nom) {
      return NextResponse.json(
        { success: false, message: 'Veuillez saisir votre nom' },
        { status: 400 }
      );
    }

    if (!email && !numero) {
      return NextResponse.json(
        { success: false, message: 'Veuillez saisir votre e-mail ou votre contact' },
        { status: 400 }
      );
    }

    if (!code_produit) {
      return NextResponse.json(
        { success: false, message: 'Produit non spécifié' },
        { status: 400 }
      );
    }

    // Récupérer le bien
    const bienData = await prisma.$queryRawUnsafe(
      'SELECT * FROM produits WHERE code = ?',
      code_produit
    ) as any[];

    if (!bienData || bienData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Bien non trouvé' },
        { status: 404 }
      );
    }

    const bien = bienData[0];

    // Récupérer l'annonceur
    let annonceur = null;
    if (bien.client_owner_id) {
      const annonceurData = await prisma.$queryRawUnsafe(
        'SELECT id, nom, prenom, email, telephone FROM clients WHERE id = ?',
        bien.client_owner_id
      ) as any[];
      annonceur = annonceurData[0] || null;
    }

    // Créer la commande dans la BD
    const result = await prisma.$queryRawUnsafe(`
      INSERT INTO commandes (nom, email, numero, description, code_produit, id_client, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, 
      nom, 
      email || null, 
      numero || null, 
      description || '', 
      code_produit, 
      id_client ? parseInt(id_client) : null
    );

    // Récupérer l'ID de la commande créée
    const commandeIdData = await prisma.$queryRawUnsafe(
      'SELECT LAST_INSERT_ID() as id'
    ) as any[];
    const commandeId = commandeIdData[0]?.id || '0';

    const commande_date = new Date().toLocaleDateString('fr-FR');
    const bien_prix = parseInt(bien.prix_vente || '0').toLocaleString('fr-FR');

    // Envoyer les emails
    try {
      // 1. Email au client (si email fourni)
      if (email) {
        await sendEmail({
          to: email,
          subject: 'Merci de nous avoir contacté - Toubabi',
          html: getInteretAnnonceurTemplate({
            fullname: nom,
            email: email,
            numero: numero || '',
            description: description || '',
            bien_nom: bien.nom,
            bien_prix,
            commande_id: commandeId.toString(),
            commande_date
          })
        });
      }

      // 2. Email à l'annonceur
      if (annonceur && annonceur.email) {
        await sendEmail({
          to: annonceur.email,
          subject: 'Intérêt pour votre bien - Toubabi',
          html: getInteretAnnonceurTemplate({
            fullname: nom,
            email: email || 'Non fourni',
            numero: numero || 'Non fourni',
            description: description || '',
            bien_nom: bien.nom,
            bien_prix,
            commande_id: commandeId.toString(),
            commande_date
          })
        });
      }

      // 3. Email à l'admin
      const adminEmail = await getAdminEmail();
      await sendEmail({
        to: adminEmail,
        subject: 'Intérêt pour un bien - Toubabi',
        html: getInteretAdminTemplate({
          fullname: nom,
          email: email || 'Non fourni',
          numero: numero || 'Non fourni',
          description: description || '',
          annonceur_fullname: annonceur ? `${annonceur.prenom} ${annonceur.nom}` : 'Inconnu',
          annonceur_email: annonceur?.email || 'Non fourni',
          annonceur_numero: annonceur?.telephone || 'Non fourni',
          bien_nom: bien.nom,
          bien_prix,
          commande_id: commandeId.toString(),
          commande_date
        })
      });

      console.log('Emails de commande/intérêt envoyés');

      // 4. SMS à l'annonceur (si numéro disponible)
      if (annonceur && annonceur.telephone) {
        try {
          await sendSMS({
            to: annonceur.telephone,
            message: getSMSInteretAnnonceur({
              annonceur_nom: annonceur.nom,
              bien_nom: bien.nom,
              bien_prix
            })
          });
          console.log('SMS envoyé à l\'annonceur');
        } catch (smsError) {
          console.error('Erreur lors de l\'envoi du SMS:', smsError);
          // On continue même si le SMS n'a pas pu être envoyé
        }
      }

    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails de commande:', emailError);
      // On continue même si l'email n'a pas pu être envoyé
    }

    return NextResponse.json({
      success: true,
      message: 'Votre demande a été envoyée avec succès'
    });

  } catch (error: any) {
    console.error('Erreur lors du traitement de la commande:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors du traitement' },
      { status: 500 }
    );
  }
}

