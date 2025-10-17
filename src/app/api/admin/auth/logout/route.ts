import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Pour une API stateless avec JWT, la déconnexion se fait côté client
    // On pourrait ajouter une blacklist de tokens ici si nécessaire
    
    return NextResponse.json({
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}

