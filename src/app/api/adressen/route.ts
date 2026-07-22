import { db } from '@/db';
import { adressen } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

const MAX_FIELD_LENGTH = 200;

// Eigene Adresse des angemeldeten Nutzers lesen
export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  const [adresse] = await db
    .select()
    .from(adressen)
    .where(eq(adressen.userId, authUser.id));

  if (!adresse) {
    return NextResponse.json(
      { error: 'Keine Adresse gefunden' },
      { status: 404 }
    );
  }

  return NextResponse.json(adresse);
}

// Eigene Adresse des angemeldeten Nutzers aktualisieren
export async function PUT(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json(
      { success: false, error: 'Nicht angemeldet' },
      { status: 401 }
    );
  }

  const { strasse, plz, stadt } = await request.json();

  if (
    [strasse, plz, stadt].some(
      (value) => typeof value !== 'string' || value.trim().length === 0
    )
  ) {
    return NextResponse.json(
      { success: false, error: 'Alle Felder müssen ausgefüllt sein.' },
      { status: 400 }
    );
  }

  if (
    [strasse, plz, stadt].some(
      (value: string) => value.length > MAX_FIELD_LENGTH
    )
  ) {
    return NextResponse.json(
      { success: false, error: 'Eingabe zu lang.' },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(adressen)
      .set({ strasse: strasse.trim(), plz: plz.trim(), stadt: stadt.trim() })
      .where(eq(adressen.userId, authUser.id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Keine Adresse gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, adresse: updated });
  } catch (error) {
    logger.error('Fehler beim Aktualisieren der Adresse', {
      error,
      userId: authUser.id,
    });
    return NextResponse.json(
      { success: false, error: 'Systemfehler. Bitte später erneut versuchen.' },
      { status: 500 }
    );
  }
}
