import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

// GET - Récupérer tous les administrateurs
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

    // Récupérer les paramètres de pagination et recherche
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Construire la requête avec recherche
    const whereClause = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } }
          ]
        }
      : {};

    // Récupérer le total
    const total = await prisma.users.count({ where: whereClause });

    // Récupérer les utilisateurs
    const users = await prisma.users.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
        email_verified_at: true
      }
    });

    // Récupérer les rôles depuis une table personnalisée si elle existe
    // Sinon, on va utiliser un champ JSON ou une logique simple
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        // Récupérer le rôle depuis la table model_has_roles si elle existe
        const roleResult: any = await prisma.$queryRawUnsafe(`
          SELECT r.name as role
          FROM model_has_roles mhr
          LEFT JOIN roles r ON r.id = mhr.role_id
          WHERE mhr.model_type = 'App\\\\Models\\\\User' 
          AND mhr.model_id = ?
          LIMIT 1
        `, Number(user.id));

        return {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          role: roleResult[0]?.role || 'admin',
          email_verified: !!user.email_verified_at,
          created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString(),
          updated_at: user.updated_at ? user.updated_at.toISOString() : new Date().toISOString()
        };
      })
    );

    return NextResponse.json({ users: usersWithRoles, total });

  } catch (error) {
    console.error('Erreur lors de la récupération des admins:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel administrateur
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
    const { name, email, password, role } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Le nom, email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Assigner le rôle si la table existe
    try {
      // Vérifier si la table roles existe
      const roleExists: any = await prisma.$queryRawUnsafe(`
        SELECT id FROM roles WHERE name = ? LIMIT 1
      `, role || 'admin');

      if (roleExists[0]) {
        await prisma.$queryRawUnsafe(`
          INSERT INTO model_has_roles (role_id, model_type, model_id)
          VALUES (?, 'App\\\\Models\\\\User', ?)
        `, roleExists[0].id, Number(newUser.id));
      }
    } catch (roleError) {
      console.log('Les tables de rôles n\'existent pas, ignorer...');
    }

    return NextResponse.json({
      success: true,
      message: 'Administrateur créé avec succès',
      user: {
        id: Number(newUser.id),
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'admin' },
      { status: 500 }
    );
  }
}

