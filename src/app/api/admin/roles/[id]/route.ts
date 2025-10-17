import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

// GET - Récupérer un rôle avec ses permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const roleId = parseInt(id);

    // Récupérer le rôle
    const role: any = await prisma.$queryRawUnsafe(`
      SELECT * FROM roles WHERE id = ? LIMIT 1
    `, roleId);

    if (role.length === 0) {
      return NextResponse.json({ error: 'Rôle non trouvé' }, { status: 404 });
    }

    // Récupérer les permissions du rôle
    const permissions: any = await prisma.$queryRawUnsafe(`
      SELECT p.* 
      FROM permissions p
      INNER JOIN role_has_permissions rhp ON rhp.permission_id = p.id
      WHERE rhp.role_id = ?
    `, roleId);

    return NextResponse.json({
      role: {
        id: Number(role[0].id),
        name: role[0].name,
        guard_name: role[0].guard_name,
        permissions: permissions.map((p: any) => ({
          id: Number(p.id),
          name: p.name
        }))
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un rôle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const roleId = parseInt(id);
    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du rôle est requis' },
        { status: 400 }
      );
    }

    // Vérifier si le rôle existe
    const role: any = await prisma.$queryRawUnsafe(`
      SELECT id, name FROM roles WHERE id = ? LIMIT 1
    `, roleId);

    if (role.length === 0) {
      return NextResponse.json({ error: 'Rôle non trouvé' }, { status: 404 });
    }

    // Vérifier si le nouveau nom existe déjà
    if (name !== role[0].name) {
      const existingRole: any = await prisma.$queryRawUnsafe(`
        SELECT id FROM roles WHERE name = ? AND id != ? LIMIT 1
      `, name, roleId);

      if (existingRole.length > 0) {
        return NextResponse.json(
          { error: 'Ce nom de rôle est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le rôle
    await prisma.$queryRawUnsafe(`
      UPDATE roles 
      SET name = ?, updated_at = NOW()
      WHERE id = ?
    `, name, roleId);

    return NextResponse.json({
      success: true,
      message: 'Rôle modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la modification du rôle:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du rôle' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un rôle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const roleId = parseInt(id);

    // Vérifier si le rôle existe
    const role: any = await prisma.$queryRawUnsafe(`
      SELECT id FROM roles WHERE id = ? LIMIT 1
    `, roleId);

    if (role.length === 0) {
      return NextResponse.json({ error: 'Rôle non trouvé' }, { status: 404 });
    }

    // Vérifier si le rôle est attribué à des utilisateurs
    const usersWithRole: any = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM model_has_roles 
      WHERE role_id = ?
    `, roleId);

    if (usersWithRole[0].count > 0) {
      return NextResponse.json(
        { error: `Ce rôle est attribué à ${usersWithRole[0].count} utilisateur(s) et ne peut pas être supprimé` },
        { status: 400 }
      );
    }

    // Supprimer les permissions du rôle
    await prisma.$queryRawUnsafe(`
      DELETE FROM role_has_permissions WHERE role_id = ?
    `, roleId);

    // Supprimer le rôle
    await prisma.$queryRawUnsafe(`
      DELETE FROM roles WHERE id = ?
    `, roleId);

    return NextResponse.json({
      success: true,
      message: 'Rôle supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du rôle:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rôle' },
      { status: 500 }
    );
  }
}

