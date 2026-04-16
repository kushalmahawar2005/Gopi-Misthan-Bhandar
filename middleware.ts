import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const TOKEN_ISSUER = 'gopi-misthan-bhandar';
const TOKEN_AUDIENCE = 'gopi-misthan-bhandar-auth';

function normalizeRole(role: unknown): 'user' | 'admin' {
  if (typeof role === 'string' && role.toLowerCase() === 'admin') {
    return 'admin';
  }
  return 'user';
}

function base64UrlToBuffer(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

function decodeBase64UrlJson(value: string): Record<string, any> | null {
  try {
    const json = new TextDecoder().decode(base64UrlToBuffer(value));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function hasExpectedAudience(aud: unknown): boolean {
  if (typeof aud === 'string') {
    return aud === TOKEN_AUDIENCE;
  }
  if (Array.isArray(aud)) {
    return aud.includes(TOKEN_AUDIENCE);
  }
  return false;
}

async function isValidCustomAdminToken(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const [headerPart, payloadPart, signaturePart] = parts;
    const header = decodeBase64UrlJson(headerPart);
    const payload = decodeBase64UrlJson(payloadPart);

    if (!header || !payload || header.alg !== 'HS256') {
      return false;
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return false;
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = new TextEncoder().encode(`${headerPart}.${payloadPart}`).buffer;
    const signature = base64UrlToBuffer(signaturePart);
    const isSignatureValid = await crypto.subtle.verify('HMAC', key, signature, data);

    if (!isSignatureValid) {
      return false;
    }

    if (payload.iss !== TOKEN_ISSUER || !hasExpectedAudience(payload.aud)) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) {
      return false;
    }

    return normalizeRole(payload.role) === 'admin';
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercepts all requests to /admin/* and /api/admin/*
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    }) as any;

    const nextAuthIsAdmin = token && normalizeRole(token.role) === 'admin';
    if (nextAuthIsAdmin) {
      return NextResponse.next();
    }

    const customToken = request.cookies.get('auth_token')?.value;
    const customIsAdmin = customToken ? await isValidCustomAdminToken(customToken) : false;

    if (!customIsAdmin) {

      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized. Admin access required.' },
          { status: 401 }
        );
      }

      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};


