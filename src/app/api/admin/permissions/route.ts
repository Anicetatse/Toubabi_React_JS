import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

// GET - Récupérer toutes les permissions
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

    // Récupérer toutes les permissions
    const permissions: any = await prisma.$queryRawUnsafe(`
      SELECT p.id, p.name, p.guard_name, p.created_at, p.updated_at,
        COUNT(rhp.role_id) as roles_count
      FROM permissions p
      LEFT JOIN role_has_permissions rhp ON rhp.permission_id = p.id
      GROUP BY p.id, p.name, p.guard_name, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
    `);

    const formattedPermissions = permissions.map((perm: any) => ({
      id: Number(perm.id),
      name: perm.name,
      guard_name: perm.guard_name,
      roles_count: Number(perm.roles_count),
      created_at: perm.created_at ? new Date(perm.created_at).toISOString() : new Date().toISOString(),
      updated_at: perm.updated_at ? new Date(perm.updated_at).toISOString() : new Date().toISOString()
    }));

    return NextResponse.json({ permissions: formattedPermissions });

  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle permission
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
        { error: 'Le nom de la permission est requis' },
        { status: 400 }
      );
    }

    // Vérifier si la permission existe déjà
    const existingPerm: any = await prisma.$queryRawUnsafe(`
      SELECT id FROM permissions WHERE name = ? LIMIT 1
    `, name);

    if (existingPerm.length > 0) {
      return NextResponse.json(
        { error: 'Cette permission existe déjà' },
        { status: 400 }
      );
    }

    // Créer la permission
    await prisma.$queryRawUnsafe(`
      INSERT INTO permissions (name, guard_name, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `, name, guard_name);

    return NextResponse.json({
      success: true,
      message: 'Permission créée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de la permission:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la permission' },
      { status: 500 }
    );
  }
}

