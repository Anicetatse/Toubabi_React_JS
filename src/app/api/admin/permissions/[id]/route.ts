import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

// PUT - Modifier une permission
export async function PUT(
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

    const permId = parseInt(params.id);
    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de la permission est requis' },
        { status: 400 }
      );
    }

    // Vérifier si la permission existe
    const permission: any = await prisma.$queryRawUnsafe(`
      SELECT id, name FROM permissions WHERE id = ? LIMIT 1
    `, permId);

    if (permission.length === 0) {
      return NextResponse.json({ error: 'Permission non trouvée' }, { status: 404 });
    }

    // Vérifier si le nouveau nom existe déjà
    if (name !== permission[0].name) {
      const existingPerm: any = await prisma.$queryRawUnsafe(`
        SELECT id FROM permissions WHERE name = ? AND id != ? LIMIT 1
      `, name, permId);

      if (existingPerm.length > 0) {
        return NextResponse.json(
          { error: 'Ce nom de permission est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la permission
    await prisma.$queryRawUnsafe(`
      UPDATE permissions 
      SET name = ?, updated_at = NOW()
      WHERE id = ?
    `, name, permId);

    return NextResponse.json({
      success: true,
      message: 'Permission modifiée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la modification de la permission:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la permission' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une permission
export async function DELETE(
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

    const permId = parseInt(params.id);

    // Vérifier si la permission existe
    const permission: any = await prisma.$queryRawUnsafe(`
      SELECT id FROM permissions WHERE id = ? LIMIT 1
    `, permId);

    if (permission.length === 0) {
      return NextResponse.json({ error: 'Permission non trouvée' }, { status: 404 });
    }

    // Vérifier si la permission est attribuée à des rôles
    const rolesWithPerm: any = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM role_has_permissions 
      WHERE permission_id = ?
    `, permId);

    if (rolesWithPerm[0].count > 0) {
      return NextResponse.json(
        { error: `Cette permission est attribuée à ${rolesWithPerm[0].count} rôle(s) et ne peut pas être supprimée` },
        { status: 400 }
      );
    }

    // Supprimer la permission
    await prisma.$queryRawUnsafe(`
      DELETE FROM permissions WHERE id = ?
    `, permId);

    return NextResponse.json({
      success: true,
      message: 'Permission supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la permission:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la permission' },
      { status: 500 }
    );
  }
}

