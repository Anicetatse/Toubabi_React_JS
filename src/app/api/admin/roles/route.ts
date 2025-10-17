import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

// GET - Récupérer tous les rôles
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

    // Récupérer tous les rôles avec leurs permissions
    const roles: any = await prisma.$queryRawUnsafe(`
      SELECT r.id, r.name, r.guard_name, r.created_at, r.updated_at,
        COUNT(rhp.permission_id) as permissions_count
      FROM roles r
      LEFT JOIN role_has_permissions rhp ON rhp.role_id = r.id
      GROUP BY r.id, r.name, r.guard_name, r.created_at, r.updated_at
      ORDER BY r.created_at DESC
    `);

    const formattedRoles = roles.map((role: any) => ({
      id: Number(role.id),
      name: role.name,
      guard_name: role.guard_name,
      permissions_count: Number(role.permissions_count),
      created_at: role.created_at ? new Date(role.created_at).toISOString() : new Date().toISOString(),
      updated_at: role.updated_at ? new Date(role.updated_at).toISOString() : new Date().toISOString()
    }));

    return NextResponse.json({ roles: formattedRoles });

  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau rôle
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, guard_name = 'web' } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du rôle est requis' },
        { status: 400 }
      );
    }

    // Vérifier si le rôle existe déjà
    const existingRole: any = await prisma.$queryRawUnsafe(`
      SELECT id FROM roles WHERE name = ? LIMIT 1
    `, name);

    if (existingRole.length > 0) {
      return NextResponse.json(
        { error: 'Ce rôle existe déjà' },
        { status: 400 }
      );
    }

    // Créer le rôle
    await prisma.$queryRawUnsafe(`
      INSERT INTO roles (name, guard_name, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `, name, guard_name);

    return NextResponse.json({
      success: true,
      message: 'Rôle créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création du rôle:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rôle' },
      { status: 500 }
    );
  }
}

