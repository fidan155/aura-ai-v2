import { db } from '@/db';
import { antraege, users } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

const MAX_TITEL_LENGTH = 200;
const MAX_BESCHREIBUNG_LENGTH = 5000;

// 1. Anträge aus der DB holen: Admins sehen alle, normale User nur ihre eigenen
export async function GET(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return Response.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  const alleAntraege =
    authUser.role === 'admin'
      ? await db.select().from(antraege).orderBy(asc(antraege.id))
      : await db
          .select()
          .from(antraege)
          .where(eq(antraege.userId, authUser.id))
          .orderBy(asc(antraege.id));

  return Response.json(alleAntraege);
}

// 2. Einen neuen Antrag in der DB speichern
export async function POST(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return Response.json(
      { success: false, error: 'Nicht angemeldet' },
      { status: 401 }
    );
  }

  const { titel, beschreibung } = await request.json();

  if (typeof titel !== 'string' || titel.trim().length === 0) {
    return Response.json(
      { success: false, error: 'Titel darf nicht leer sein.' },
      { status: 400 }
    );
  }

  if (titel.length > MAX_TITEL_LENGTH) {
    return Response.json(
      { success: false, error: 'Titel ist zu lang.' },
      { status: 400 }
    );
  }

  if (
    beschreibung != null &&
    (typeof beschreibung !== 'string' ||
      beschreibung.length > MAX_BESCHREIBUNG_LENGTH)
  ) {
    return Response.json(
      { success: false, error: 'Beschreibung ist ungültig oder zu lang.' },
      { status: 400 }
    );
  }

  await db.insert(antraege).values({
    titel: titel.trim(),
    beschreibung: beschreibung ?? null,
    userId: authUser.id,
  });

  try {
    await db
      .update(users)
      .set({ featureClicks: sql`${users.featureClicks} + 1` })
      .where(eq(users.id, authUser.id));
  } catch (e) {
    logger.error('Fehler beim Erhöhen der Feature-Clicks', {
      error: e,
      userId: authUser.id,
    });
  }

  return Response.json({ success: true });
}

// 3. Status eines Antrags aktualisieren (nur Admins)
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'admin') {
      return Response.json(
        { success: false, error: 'Nicht autorisiert' },
        { status: 403 }
      );
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return Response.json(
        { success: false, error: 'ID und Status fehlen' },
        { status: 400 }
      );
    }

    await db
      .update(antraege)
      .set({ status: status.toLowerCase() })
      .where(eq(antraege.id, id));

    return Response.json({ success: true });
  } catch (error) {
    logger.error('Fehler beim Aktualisieren des Antrags', { error });
    return Response.json(
      { success: false, error: 'Systemfehler. Bitte später erneut versuchen.' },
      { status: 500 }
    );
  }
}
