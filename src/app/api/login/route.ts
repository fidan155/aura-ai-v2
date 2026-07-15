import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm'; // sql importiert für das Hochzählen
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { signAuthToken } from '@/lib/auth';

// Einfacher In-Memory-Rate-Limiter gegen Brute-Force auf einzelne E-Mails.
// Für Multi-Instance-Deployments besser durch Redis o.ä. ersetzen.
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(email: string): boolean {
  const entry = loginAttempts.get(email);
  if (!entry) return false;
  if (Date.now() - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(email);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(email: string) {
  const entry = loginAttempts.get(email);
  if (!entry || Date.now() - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.set(email, { count: 1, firstAttempt: Date.now() });
  } else {
    entry.count += 1;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (isRateLimited(email)) {
      return NextResponse.json(
        { success: false, error: 'Zu viele Fehlversuche. Bitte in ein paar Minuten erneut versuchen.' },
        { status: 429 }
      );
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;

    // Bewusst identische Fehlermeldung/Statuscode für "User unbekannt" und
    // "Passwort falsch", damit sich E-Mail-Adressen nicht per Login enumerieren lassen.
    if (!user || !isPasswordCorrect) {
      recordFailedAttempt(email);
      return NextResponse.json({ success: false, error: 'Ungültige Anmeldedaten' }, { status: 401 });
    }

    loginAttempts.delete(email);

    // --- NEU: KI-TRACKING-DATEN AKTUALISIEREN ---
    await db
      .update(users)
      .set({
        lastLogin: new Date(),                     // Setzt das aktuelle Datum
        loginCount: sql`${users.loginCount} + 1`, // Erhöht den bestehenden Zähler um 1
      })
      .where(eq(users.id, user.id));
    // --------------------------------------------

    // JWT Token erstellen
    const token = await signAuthToken({ id: user.id, email: user.email, role: user.role || 'user' });

    // Response mit sicherem HTTP-Only Cookie erstellen
    const response = NextResponse.json({ 
      success: true, 
      role: user.role || 'user' 
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true', 
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}