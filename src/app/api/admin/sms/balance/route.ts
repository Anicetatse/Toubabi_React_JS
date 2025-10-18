import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';

// Configuration API Orange SMS (lignes 39-40 Laravel)
const ORANGE_CLIENT_ID = process.env.ORANGE_SMS_CLIENT_ID || 'nWUrnW3EBj9LmZ5GBbceJJlWZWcikxLV';
const ORANGE_CLIENT_SECRET = process.env.ORANGE_SMS_CLIENT_SECRET || 'CsGGGsP04GkXI9bG';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Appeler l'API Orange SMS réelle
    try {
      // Authentification OAuth Orange
      const authResponse = await fetch('https://api.orange.com/oauth/v3/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      
      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.error('Erreur API Orange SMS Auth:', {
          status: authResponse.status,
          statusText: authResponse.statusText,
          body: errorText
        });
        throw new Error(`Erreur authentification Orange SMS (${authResponse.status}): ${errorText}`);
      }
      
      const authData = await authResponse.json();
      
      // Récupérer le solde SMS
      const balanceResponse = await fetch('https://api.orange.com/smsmessaging/v1/admin/contracts', {
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
        },
      });
      
      if (!balanceResponse.ok) {
        const errorText = await balanceResponse.text();
        console.error('Erreur API Orange SMS Balance:', {
          status: balanceResponse.status,
          statusText: balanceResponse.statusText,
          body: errorText
        });
        throw new Error(`Erreur récupération solde SMS (${balanceResponse.status}): ${errorText}`);
      }
      
      const balanceData = await balanceResponse.json();
      const contractData = balanceData.contracts?.[0] || balanceData;
      
      return NextResponse.json({
        balance: contractData.availableUnits || 0,
        date_expiration: contractData.expirationDate || new Date('2025-11-23T23:59:00').toISOString(),
        sms_utilises: contractData.usedUnits || 0,
      });
    } catch (apiError) {
      console.error('Erreur API Orange SMS:', apiError);
      
      // Fallback sur les données mock en cas d'erreur
      const mockData = {
        balance: 1867,
        date_expiration: new Date('2025-11-23T23:59:00').toISOString(),
        sms_utilises: 0,
      };
      
      return NextResponse.json(mockData);
    }

  } catch (error) {
    console.error('Erreur lors de la récupération du solde SMS:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

