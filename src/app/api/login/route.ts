import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm'; // sql importiert für das Hochzählen
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import * as jose from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return NextResponse.json({ success: false, error: 'User nicht gefunden' }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ success: false, error: 'Falsches Passwort' }, { status: 401 });
    }

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
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

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