import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    // Créer le dossier de destination s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'assets', 'annonces');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedPaths: string[] = [];

    for (const image of images) {
      // Vérifier que c'est bien une image
      if (!image.type.startsWith('image/')) {
        continue;
      }

      // Générer un nom de fichier unique (hash MD5 comme dans Laravel)
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const hash = crypto.createHash('md5').update(buffer).digest('hex');
      const extension = image.name.split('.').pop() || 'jpg';
      const filename = `${hash}.${extension}`;

      // Sauvegarder le fichier
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // Ajouter le chemin relatif au tableau
      uploadedPaths.push(`/assets/annonces/${filename}`);
    }

    return NextResponse.json({
      success: true,
      paths: uploadedPaths,
      count: uploadedPaths.length
    });

  } catch (error) {
    console.error('Erreur upload images:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des images' },
      { status: 500 }
    );
  }
}

