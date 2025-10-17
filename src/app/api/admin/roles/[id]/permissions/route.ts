import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

// POST - Attribuer des permissions à un rôle
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const roleId = parseInt(params.id);
    const body = await request.json();
    const { permissionIds } = body; // Array des IDs de permissions

    // Validation
    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: 'Les IDs des permissions doivent être un tableau' },
        { status: 400 }
      );
    }

    // Vérifier si le rôle existe
    const role: any = await prisma.$queryRawUnsafe(`
      SELECT id FROM roles WHERE id = ? LIMIT 1
    `, roleId);

    if (role.length === 0) {
      return NextResponse.json({ error: 'Rôle non trouvé' }, { status: 404 });
    }

    // Supprimer toutes les permissions existantes du rôle
    await prisma.$queryRawUnsafe(`
      DELETE FROM role_has_permissions WHERE role_id = ?
    `, roleId);

    // Ajouter les nouvelles permissions
    if (permissionIds.length > 0) {
      const values = permissionIds.map((permId: number) => `(${permId}, ${roleId})`).join(', ');
      await prisma.$queryRawUnsafe(`
        INSERT INTO role_has_permissions (permission_id, role_id)
        VALUES ${values}
      `);
    }

    return NextResponse.json({
      success: true,
      message: 'Permissions mises à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des permissions' },
      { status: 500 }
    );
  }
}

