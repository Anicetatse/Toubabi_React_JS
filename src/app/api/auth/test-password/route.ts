import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password, hash } = await request.json();
    
    if (!password || !hash) {
      return NextResponse.json({ error: 'Password and hash required' }, { status: 400 });
    }

    // Tester la vérification
    const isValid = await bcrypt.compare(password, hash);
    
    // Convertir $2y$ en $2a$ si nécessaire (compatibilité Laravel)
    const convertedHash = hash.replace(/^\$2y\$/, '$2a$');
    const isValidConverted = await bcrypt.compare(password, convertedHash);
    
    return NextResponse.json({
      original: {
        hash,
        isValid,
      },
      converted: {
        hash: convertedHash,
        isValid: isValidConverted,
      },
      message: 'Test password verification',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

