import { db } from '@/db';
import { users } from '@/db/schema';
import { getAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

// Anzahl paralleler Anfragen an das KI-Backend. Komplett sequentiell ist
// langsam, komplett parallel riskiert Rate-Limits bei der Claude API – 4 ist
// ein vernünftiger Mittelweg.
const CONCURRENCY = 4;

type User = typeof users.$inferSelect;

async function analysiereUser(user: User) {
  const jetzt = new Date().getTime();
  const registriertAm = user.createdAt
    ? new Date(user.createdAt).getTime()
    : jetzt;
  const letzterLoginAm = user.lastLogin
    ? new Date(user.lastLogin).getTime()
    : jetzt;

  const tageSeitRegistrierung = Math.max(
    0,
    Math.floor((jetzt - registriertAm) / (1000 * 60 * 60 * 24))
  );
  const tageSeitLetztemLogin = Math.max(
    0,
    Math.floor((jetzt - letzterLoginAm) / (1000 * 60 * 60 * 24))
  );

  try {
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
    const pythonRes = await fetch(`${pythonApiUrl}/api/analyze-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        days_since_registration: tageSeitRegistrierung,
        days_since_last_login: tageSeitLetztemLogin,
        login_count: user.loginCount || 0,
        feature_clicks: user.featureClicks || 0,
      }),
      // Harte Obergrenze, damit ein hängender Call nicht die ganze Admin-Seite blockiert
      signal: AbortSignal.timeout(15000),
    });

    if (!pythonRes.ok) throw new Error('Python API Fehler');
    const kiDaten = await pythonRes.json();

    return {
      id: user.id,
      email: user.email,
      loginCount: user.loginCount,
      featureClicks: user.featureClicks,
      kiStatus: kiDaten.status,
      kiSummary: kiDaten.summary,
      kiRecommendation: kiDaten.recommendation,
    };
  } catch (error) {
    logger.error('KI-Analyse für Nutzer fehlgeschlagen', {
      error,
      userId: user.id,
    });
    return {
      id: user.id,
      email: user.email,
      loginCount: user.loginCount,
      featureClicks: user.featureClicks,
      kiStatus: 'Error',
      kiSummary: 'KI-Analyse derzeit überlastet.',
      kiRecommendation: 'Seite in wenigen Sekunden erneut laden.',
    };
  }
}

// Führt die Analysen in Gruppen von CONCURRENCY parallel aus –
// statt komplett sequentiell (langsam) oder komplett parallel (riskiert Rate-Limits).
async function analysiereInBatches(alleUser: User[]) {
  const ergebnisse: Awaited<ReturnType<typeof analysiereUser>>[] = [];
  for (let i = 0; i < alleUser.length; i += CONCURRENCY) {
    const batch = alleUser.slice(i, i + CONCURRENCY);
    const batchErgebnisse = await Promise.all(batch.map(analysiereUser));
    ergebnisse.push(...batchErgebnisse);
  }
  return ergebnisse;
}

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== 'admin') {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
  }

  try {
    const alleUser = await db.select().from(users);
    const analysierteUser = await analysiereInBatches(alleUser);
    return NextResponse.json(analysierteUser);
  } catch (error) {
    logger.error('Laden der Nutzeranalyse fehlgeschlagen', { error });
    return NextResponse.json(
      { error: 'Systemfehler beim Laden der Nutzeranalyse.' },
      { status: 500 }
    );
  }
}
