import { db } from '@/db';
import { antraege, users } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

// 1. Anträge aus der DB holen: Admins sehen alle, normale User nur ihre eigenen
export async function GET(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return Response.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  const alleAntraege =
    authUser.role === 'admin'
      ? await db.select().from(antraege).orderBy(asc(antraege.id))
      : await db.select().from(antraege).where(eq(antraege.userId, authUser.id)).orderBy(asc(antraege.id));

  return Response.json(alleAntraege);
}

// 2. Einen neuen Antrag in der DB speichern
export async function POST(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return Response.json({ success: false, error: 'Nicht angemeldet' }, { status: 401 });
  }

  const { titel, beschreibung } = await request.json();

  await db.insert(antraege).values({
    titel,
    beschreibung,
    userId: authUser.id,
  });

  try {
    await db
      .update(users)
      .set({ featureClicks: sql`${users.featureClicks} + 1` })
      .where(eq(users.id, authUser.id));
  } catch (e) {
    console.error('Fehler beim Erhöhen der Feature-Clicks:', e);
  }

  return Response.json({ success: true });
}

// 3. Status eines Antrags aktualisieren (nur Admins)
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'admin') {
      return Response.json({ success: false, error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return Response.json({ success: false, error: 'ID und Status fehlen' }, { status: 400 });
    }

    await db
      .update(antraege)
      .set({ status: status.toLowerCase() })
      .where(eq(antraege.id, id));

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}