import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

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

    const formData = await request.formData();
    const files: File[] = [];
    const type = formData.get('type') as string; // 'image' ou 'video'

    // Récupérer tous les fichiers
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const uploadedPaths: string[] = [];

    // Déterminer le dossier de destination
    const subFolder = type === 'video' ? 'videos' : 'Images';
    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'Hoteliers', subFolder);

    // Créer le dossier s'il n'existe pas
    await mkdir(uploadDir, { recursive: true });

    // Sauvegarder chaque fichier
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Générer un nom unique pour éviter les conflits
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.name);
      const fileName = `${timestamp}-${randomString}${fileExtension}`;
      
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      // Stocker le chemin relatif pour la base de données
      const relativePath = `/assets/Hoteliers/${subFolder}/${fileName}`;
      uploadedPaths.push(relativePath);
    }

    return NextResponse.json({
      success: true,
      data: {
        paths: uploadedPaths,
        message: `${files.length} fichier(s) téléchargé(s) avec succès`
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des fichiers' },
      { status: 500 }
    );
  }
}

