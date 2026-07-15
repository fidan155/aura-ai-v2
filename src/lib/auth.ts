import { cookies } from 'next/headers';
import * as jose from 'jose';

export interface AuthPayload {
  id: number;
  email: string;
  role: string;
}

// Lazy statt beim Modul-Laden geprüft: `next build` (z. B. im Docker-Image-Build)
// führt dieses Modul ohne Laufzeit-Env-Variablen aus, JWT_SECRET kommt bei diesem
// Projekt erst zur Container-Laufzeit über docker-compose.yml.
let cachedSecret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable must be set');
  }
  cachedSecret = new TextEncoder().encode(jwtSecret);
  return cachedSecret;
}

export async function signAuthToken(payload: AuthPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(getSecret());
}

export async function getAuthUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}
