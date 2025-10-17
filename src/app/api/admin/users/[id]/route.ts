import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

// PUT - Modifier un administrateur
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

    const userId = parseInt(params.id);
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Le nom et email sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'Administrateur non trouvé' }, { status: 404 });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== user.email) {
      const existingUser = await prisma.users.findUnique({
        where: { email }
      });

      if (existingUser && Number(existingUser.id) !== userId) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre administrateur' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      name,
      email,
      updated_at: new Date()
    };

    // Si un nouveau mot de passe est fourni, le hasher
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mettre à jour l'utilisateur
    await prisma.users.update({
      where: { id: BigInt(userId) },
      data: updateData
    });

    // Mettre à jour le rôle si fourni
    if (role) {
      try {
        // Supprimer l'ancien rôle
        await prisma.$queryRawUnsafe(`
          DELETE FROM model_has_roles 
          WHERE model_type = 'App\\\\Models\\\\User' AND model_id = ?
        `, userId);

        // Ajouter le nouveau rôle
        const roleExists: any = await prisma.$queryRawUnsafe(`
          SELECT id FROM roles WHERE name = ? LIMIT 1
        `, role);

        if (roleExists[0]) {
          await prisma.$queryRawUnsafe(`
            INSERT INTO model_has_roles (role_id, model_type, model_id)
            VALUES (?, 'App\\\\Models\\\\User', ?)
          `, roleExists[0].id, userId);
        }
      } catch (roleError) {
        console.log('Les tables de rôles n\'existent pas, ignorer...');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Administrateur modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la modification de l\'admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'admin' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un administrateur
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

    const userId = parseInt(params.id);

    // Vérifier si l'utilisateur existe
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'Administrateur non trouvé' }, { status: 404 });
    }

    // Supprimer les rôles associés
    try {
      await prisma.$queryRawUnsafe(`
        DELETE FROM model_has_roles 
        WHERE model_type = 'App\\\\Models\\\\User' AND model_id = ?
      `, userId);
    } catch (roleError) {
      console.log('Les tables de rôles n\'existent pas, ignorer...');
    }

    // Supprimer l'utilisateur
    await prisma.users.delete({
      where: { id: BigInt(userId) }
    });

    return NextResponse.json({
      success: true,
      message: 'Administrateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'admin' },
      { status: 500 }
    );
  }
}

