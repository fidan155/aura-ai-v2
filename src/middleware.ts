import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Lazy statt beim Modul-Laden geprüft: `next build` (z. B. im Docker-Image-Build)
// führt dieses Modul ohne Laufzeit-Env-Variablen aus, JWT_SECRET kommt bei diesem
// Projekt erst zur Container-Laufzeit über docker-compose.yml.
let cachedSecret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set');
  }
  cachedSecret = new TextEncoder().encode(process.env.JWT_SECRET);
  return cachedSecret;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Ohne Token zurück zum Login
  if (!token) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // Token verifizieren
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role;

    // 2. Admin-Schutz: Nur Admins dürfen auf /admin
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 3. Dashboard-Schutz: Admins auf /admin umleiten
    if (pathname.startsWith('/dashboard') && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Login/Register blockieren, wenn bereits eingeloggt
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/dashboard', request.url));
    }

  } catch (error) {
    // Bei manipuliertem/abgelaufenem Token: Cookie löschen und zum Login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
};