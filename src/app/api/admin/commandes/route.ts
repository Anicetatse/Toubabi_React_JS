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

    // Récupérer les paramètres
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Construire la requête SQL complète
    let sqlTotal = `
      SELECT COUNT(*) as count
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.id_client = c.id
    `;

    let sqlCommandes = `
      SELECT 
        cmd.*,
        c.nom as client_nom,
        c.prenom as client_prenom
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.id_client = c.id
    `;

    const conditions = [];
    if (search) {
      conditions.push(`(cmd.id LIKE '%${search}%' OR c.nom LIKE '%${search}%' OR c.email LIKE '%${search}%')`);
    }
    if (status !== undefined && status !== null) {
      conditions.push(`cmd.status = ${status}`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      sqlTotal += whereClause;
      sqlCommandes += whereClause;
    }

    sqlCommandes += ` ORDER BY cmd.created_at DESC LIMIT ${limit} OFFSET ${skip}`;

    // Récupérer le total
    const totalResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(sqlTotal);
    const total = Number(totalResult[0]?.count || 0);

    // Récupérer les commandes
    const commandes = await prisma.$queryRawUnsafe<Array<any>>(sqlCommandes);

    const formattedCommandes = commandes.map((cmd: any) => ({
      id: Number(cmd.id),
      numero_commande: `CMD-${cmd.id.toString().padStart(6, '0')}`,
      status: Number(cmd.status),
      nom: cmd.nom || 'N/A',
      email: cmd.email || '',
      numero: cmd.numero || '',
      code_produit: cmd.code_produit,
      detail: cmd.detail || '',
      description: cmd.description || '',
      client_nom: cmd.client_nom && cmd.client_prenom ? `${cmd.client_nom} ${cmd.client_prenom}` : 'N/A',
      created_at: cmd.created_at ? cmd.created_at.toISOString() : new Date().toISOString(),
      updated_at: cmd.updated_at ? cmd.updated_at.toISOString() : new Date().toISOString()
    }));

    return NextResponse.json({ commandes: formattedCommandes, total });

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

