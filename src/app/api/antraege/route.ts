import { db } from '@/db';
import { antraege, users } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server'; // Import hinzugefügt
import * as jose from 'jose';

// 1. Alle Anträge aus der DB holen (mit NextRequest, um den Fehler zu beheben)
export async function GET(request: NextRequest) {
  const alleAntraege = await db
    .select()
    .from(antraege)
    .orderBy(asc(antraege.id));
    
  return Response.json(alleAntraege);
}

// 2. Einen neuen Antrag in der DB speichern
// 2. Einen neuen Antrag in der DB speichern
export async function POST(request: NextRequest) {
  const { titel, beschreibung } = await request.json();
  
  await db.insert(antraege).values({
    titel,
    beschreibung,
  });

  try {
    // ✅ JETZT MIT await, da cookies() in Next.js 15 ein Promise ist
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const userId = payload.id as number;

      await db
        .update(users)
        .set({ featureClicks: sql`${users.featureClicks} + 1` })
        .where(eq(users.id, userId));
    }
  } catch (e) {
    console.error("Fehler beim Erhöhen der Feature-Clicks:", e);
  }

  return Response.json({ success: true });
}
// 3. Status eines Antrags aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return Response.json({ success: false, error: 'ID und Status fehlen' }, { status: 400 });
    }

    await db
      .update(antraege)
      .set({ status: status.toLowerCase() })
      .where(eq(antraege.id, id));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}