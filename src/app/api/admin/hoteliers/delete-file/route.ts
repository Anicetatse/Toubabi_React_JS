import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'Chemin du fichier manquant' },
        { status: 400 }
      );
    }

    // Construire le chemin complet du fichier
    const fullPath = path.join(process.cwd(), 'public', filePath);

    // Supprimer le fichier
    try {
      await unlink(fullPath);
      return NextResponse.json({
        success: true,
        message: 'Fichier supprimé avec succès'
      });
    } catch (error) {
      // Le fichier n'existe peut-être pas, ce n'est pas grave
      console.error('Erreur lors de la suppression:', error);
      return NextResponse.json({
        success: true,
        message: 'Fichier déjà supprimé ou introuvable'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    );
  }
}

