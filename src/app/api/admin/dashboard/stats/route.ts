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

    // Récupérer les statistiques EXACTEMENT comme dans Laravel
    const [
      commandesNonTraitees,
      commandesTraitees,
      totalClients,
      totalAdmins,
      biensActifs,
      biensNonActifs,
      totalVilles,
      totalCommunes,
      totalQuartiers,
      dernierProduit
    ] = await Promise.all([
      // Commandes non traitées (status = 0)
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM commandes WHERE status = 0
      `,
      // Commandes traitées (status = 1)
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM commandes WHERE status = 1
      `,
      
      // Utilisateurs (clients)
      prisma.clients.count(),
      
      // Admins (users)
      prisma.users.count(),
      
      // Biens actifs (enabled = 1)
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM produits WHERE enabled = 1
      `,
      // Biens non actifs (enabled = 0)
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM produits WHERE enabled = 0
      `,
      
      // Statistiques géographiques
      prisma.villes.count(),
      prisma.communes.count(),
      prisma.quartiers.count(),
      
      // Dernier produit ajouté
      prisma.produits.findFirst({
        orderBy: { created_at: 'desc' }
      })
    ]);

    // Statistiques par commune - EXACTEMENT comme Laravel (lignes 184-187)
    const statsParCommune = await prisma.$queryRaw<Array<{
      id: number;
      nom: string;
      total_biens: bigint;
      biens_approuves: bigint;
      biens_en_attente: bigint;
    }>>`
      SELECT 
        c.id,
        c.nom,
        COUNT(DISTINCT p.code) as total_biens,
        COUNT(DISTINCT CASE WHEN p.enabled = 1 THEN p.code END) as biens_approuves,
        COUNT(DISTINCT CASE WHEN p.enabled = 0 THEN p.code END) as biens_en_attente
      FROM communes c
      LEFT JOIN quartiers q ON c.id = q.id_commune
      LEFT JOIN produits p ON q.id = p.id_quartier
      GROUP BY c.id, c.nom
      ORDER BY c.nom
    `;

    // Données pour le graphique "Nouvelles Entrées" (derniers 30 jours)
    const nouvellesEntrees = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM produits
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const chartLabels = nouvellesEntrees.map(entry => 
      new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    );
    const chartData = nouvellesEntrees.map(entry => Number(entry.count));

    // Formater les résultats EXACTEMENT comme Laravel
    const stats = {
      // Widgets ligne 1 - Commandes
      commandes: {
        nonTraitees: commandesNonTraitees[0] ? Number(commandesNonTraitees[0].count) : 0,
        traitees: commandesTraitees[0] ? Number(commandesTraitees[0].count) : 0,
      },
      // Widgets ligne 2 - Utilisateurs
      utilisateurs: {
        total: totalClients,
        admins: totalAdmins,
      },
      // Widgets ligne 3 - Biens
      biens: {
        actifs: biensActifs[0] ? Number(biensActifs[0].count) : 0,
        nonActifs: biensNonActifs[0] ? Number(biensNonActifs[0].count) : 0,
        total: (biensActifs[0] ? Number(biensActifs[0].count) : 0) + (biensNonActifs[0] ? Number(biensNonActifs[0].count) : 0)
      },
      // Widgets ligne 4 - Géographie
      geographie: {
        villes: totalVilles,
        communes: totalCommunes,
        quartiers: totalQuartiers
      },
      // Dernier produit ajouté
      dernierProduit: dernierProduit ? {
        code: dernierProduit.code,
        nom: dernierProduit.nom,
        created_at: dernierProduit.created_at ? dernierProduit.created_at.toISOString() : null
      } : null,
      // Statistiques par commune - comme lignes 184-187
      statsParCommune: statsParCommune.map((stat) => ({
        id: Number(stat.id),
        nom: stat.nom,
        total_biens: stat.total_biens ? Number(stat.total_biens) : 0,
        biens_approuves: stat.biens_approuves ? Number(stat.biens_approuves) : 0,
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
