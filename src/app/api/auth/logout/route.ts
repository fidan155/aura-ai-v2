import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Löscht den Cookie sicher serverseitig
  response.cookies.set('auth_token', '', {
    path: '/',
    expires: new Date(0), // Setzt das Ablaufdatum in die Vergangenheit
  });

  return response;
}