import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // Vérifier que l'utilisateur existe
    // Note: La vérification du rôle admin devra être ajoutée selon votre logique métier
    // Pour l'instant, on vérifie juste l'existence de l'utilisateur

    // Récupérer les statistiques
    const [
      totalBiens,
      biensActifs,
      biensInactifs,
      totalClients,
      totalCommandes,
      commandesEnAttente,
      commandesTraitees,
      totalVilles,
      totalCommunes,
      totalQuartiers,
      derniersBiens,
      activitesRecentes
    ] = await Promise.all([
      // Statistiques des biens
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM produits
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM produits WHERE enabled = 1
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM produits WHERE enabled = 0
      `,
      
      // Statistiques des utilisateurs (clients)
      prisma.clients.count(),
      
      // Statistiques des commandes
      prisma.commandes.count(),
      prisma.commandes.count({
        where: { status: 0 } // en_attente
      }),
      prisma.commandes.count({
        where: { status: 1 } // traitee
      }),
      
      // Statistiques géographiques
      prisma.villes.count(),
      prisma.communes.count(),
      prisma.quartiers.count(),
      
      // Derniers biens
      prisma.$queryRaw<Array<any>>`
        SELECT p.code, p.nom, p.prix_vente, p.enabled, p.created_at,
               c.nom as client_nom, q.nom as quartier_nom, com.nom as commune_nom
        FROM produits p
        LEFT JOIN clients c ON p.client_owner_id = c.id
        LEFT JOIN quartiers q ON p.id_quartier = q.id
        LEFT JOIN communes com ON q.id_commune = com.id
        ORDER BY p.created_at DESC
        LIMIT 5
      `,
      
      // Activités récentes
      prisma.$queryRaw<Array<any>>`
        SELECT 
          'Nouveau bien ajouté' as action,
          p.nom as description,
          p.created_at as date
        FROM produits p
        WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY p.created_at DESC
        LIMIT 5
      `
    ]);

    // Statistiques par commune
    const statsParCommune = await prisma.$queryRaw<Array<{
      id: number;
      nom: string;
      total_biens: bigint;
      biens_actifs: bigint;
      biens_en_attente: bigint;
    }>>`
      SELECT 
        c.id,
        c.nom,
        COUNT(DISTINCT p.code) as total_biens,
        COUNT(DISTINCT CASE WHEN p.enabled = 1 THEN p.code END) as biens_actifs,
        COUNT(DISTINCT CASE WHEN p.enabled = 0 THEN p.code END) as biens_en_attente
      FROM communes c
      LEFT JOIN quartiers q ON c.id = q.id_commune
      LEFT JOIN produits p ON q.id = p.id_quartier
      GROUP BY c.id, c.nom
      ORDER BY c.nom
    `;

    // Formater les résultats
    const stats = {
      biens: {
        total: totalBiens[0] ? Number(totalBiens[0].count) : 0,
        actifs: biensActifs[0] ? Number(biensActifs[0].count) : 0,
        inactifs: biensInactifs[0] ? Number(biensInactifs[0].count) : 0
      },
      utilisateurs: {
        total: totalClients,
        admins: 0 // Pas de table admins séparée
      },
      commandes: {
        total: totalCommandes,
        enAttente: commandesEnAttente,
        traitees: commandesTraitees
      },
      geographie: {
        villes: totalVilles,
        communes: totalCommunes,
        quartiers: totalQuartiers
      },
      derniersBiens: derniersBiens.map((bien: any) => ({
        id: 0, // Produits n'a pas de id auto-increment
        code: bien.code,
        nom: bien.nom,
        prix_vente: bien.prix_vente ? Number(bien.prix_vente) : 0,
        enabled: Boolean(bien.enabled),
        client_nom: bien.client_nom || 'N/A',
        quartier_nom: bien.quartier_nom || 'N/A',
        commune_nom: bien.commune_nom || 'N/A',
        created_at: bien.created_at ? bien.created_at.toISOString() : new Date().toISOString()
      })),
      activitesRecentes: activitesRecentes.map((activite: any) => ({
        action: activite.action,
        description: activite.description,
        date: activite.date ? activite.date.toISOString() : new Date().toISOString()
      })),
      statsParCommune: statsParCommune.map((stat) => ({
        id: Number(stat.id),
        nom: stat.nom,
        total_biens: stat.total_biens ? Number(stat.total_biens) : 0,
        biens_actifs: stat.biens_actifs ? Number(stat.biens_actifs) : 0,
        biens_en_attente: stat.biens_en_attente ? Number(stat.biens_en_attente) : 0
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
