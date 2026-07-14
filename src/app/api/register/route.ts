import { db } from '@/db';
import { users, adressen } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password, strasse, plz, stadt } = await request.json();

    if (!email || !password || !strasse || !plz || !stadt) {
      return NextResponse.json(
        { success: false, error: 'Alle Felder müssen ausgefüllt sein.' }, 
        { status: 400 }
      );
    }

    // 1. Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. User anlegen und die generierte ID zurückgeben lassen (.returning())
    const [neuerUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
    }).returning({ id: users.id });

    // Sicherheits-Check für TypeScript (falls aus irgendeinem Grund kein User zurückgegeben wurde)
    if (!neuerUser) {
      throw new Error('User-Erstellung fehlgeschlagen');
    }

    // 3. One-to-One Objekt: Adresse mit der userId verknüpfen und speichern
    await db.insert(adressen).values({
      strasse,
      plz,
      stadt,
      userId: neuerUser.id,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Registrierung inklusive Standortdaten erfolgreich!' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'User existiert bereits oder Systemfehler.' }, 
      { status: 400 }
    );
  }
}