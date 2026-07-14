import { db } from '@/db';
import { users } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const alleUser = await db.select().from(users);
    const analysierteUser = [];

    // Nacheinander statt gleichzeitig abarbeiten, um den Mac zu entlasten
    for (const user of alleUser) {
      const jetzt = new Date().getTime();
      const registriertAm = user.createdAt ? new Date(user.createdAt).getTime() : jetzt;
      const letzterLoginAm = user.lastLogin ? new Date(user.lastLogin).getTime() : jetzt;

      const tageSeitRegistrierung = Math.max(0, Math.floor((jetzt - registriertAm) / (1000 * 60 * 60 * 24)));
      const tageSeitLetztemLogin = Math.max(0, Math.floor((jetzt - letzterLoginAm) / (1000 * 60 * 60 * 24)));

      try {
        const pythonRes = await fetch('http://backend:8000/api/analyze-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            days_since_registration: tageSeitRegistrierung,
            days_since_last_login: tageSeitLetztemLogin,
            login_count: user.loginCount || 0,
            feature_clicks: user.featureClicks || 0,
          }),
        });

        if (!pythonRes.ok) throw new Error('Python API Fehler');

        const kiDaten = await pythonRes.json();

        analysierteUser.push({
          id: user.id,
          email: user.email,
          loginCount: user.loginCount,
          featureClicks: user.featureClicks,
          kiStatus: kiDaten.status,
          kiSummary: kiDaten.summary,
          kiRecommendation: kiDaten.recommendation,
        });
      } catch (error) {
        analysierteUser.push({
          id: user.id,
          email: user.email,
          loginCount: user.loginCount,
          featureClicks: user.featureClicks,
          kiStatus: 'Error',
          kiSummary: 'KI-Analyse derzeit überlastet.',
          kiRecommendation: 'Seite in wenigen Sekunden erneut laden.',
        });
      }
    }

    return NextResponse.json(analysierteUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}