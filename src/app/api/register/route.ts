import { db } from '@/db';
import { users, adressen } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { logger } from '@/lib/logger';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;

export async function POST(request: NextRequest) {
  try {
    const { email, password, strasse, plz, stadt } = await request.json();

    if (!email || !password || !strasse || !plz || !stadt) {
      return NextResponse.json(
        { success: false, error: 'Alle Felder müssen ausgefüllt sein.' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Ungültige E-Mail-Adresse.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
        },
        { status: 400 }
      );
    }

    if (
      [strasse, plz, stadt].some(
        (value) => typeof value !== 'string' || value.length > MAX_FIELD_LENGTH
      )
    ) {
      return NextResponse.json(
        { success: false, error: 'Eingabe zu lang.' },
        { status: 400 }
      );
    }

    // 1. Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. User anlegen und die generierte ID zurückgeben lassen (.returning())
    const [neuerUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id });

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
      message: 'Registrierung inklusive Standortdaten erfolgreich!',
    });
  } catch (error) {
    logger.error('Registrierung fehlgeschlagen', { error });
    return NextResponse.json(
      { success: false, error: 'User existiert bereits oder Systemfehler.' },
      { status: 400 }
    );
  }
}
