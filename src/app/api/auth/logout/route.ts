import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Dans une implémentation avec tokens JWT, le logout est géré côté client
  // On pourrait implémenter une blacklist de tokens ici si nécessaire
  
  return NextResponse.json({
    data: {
      message: 'Déconnexion réussie',
    },
  });
}

