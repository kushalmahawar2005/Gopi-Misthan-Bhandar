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


const MAINTENANCE_BYPASS_COOKIE = 'gmb_maintenance_bypass';

// Paths that must keep working while the site is under maintenance:
// admin (still auth-guarded below), the login flow that admin redirects to,
// and the scheduled cron jobs.
const MAINTENANCE_ALLOWED_PREFIXES = [
  '/admin',
  '/api/admin',
  '/api/auth',
  '/api/cron',
  '/login',
];

// Served straight from the middleware so the page carries nothing but the
// notice itself — no site chrome, chat widget or floating buttons from the
// root layout, and a guaranteed 503 for search engines.
const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Under Maintenance | Gopi Misthan Bhandar</title>
<link rel="icon" href="/logo.png" type="image/png">
<style>
  *{ margin:0; padding:0; box-sizing:border-box; }
  html,body{ height:100%; }
  body{
    display:flex; align-items:center; justify-content:center;
    padding:24px; background:#FFF7EC; color:#331818;
    font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  main{ text-align:center; }
  img{ width:120px; height:auto; margin:0 auto 28px; display:block; }
  h1{ font-size:clamp(28px,6vw,44px); font-weight:700; letter-spacing:-0.02em; }
  span{ color:#FE8E02; }
</style>
</head>
<body>
<main>
  <img src="/logo.png" alt="Gopi Misthan Bhandar">
  <h1>Under <span>Maintenance</span></h1>
</main>
</body>
</html>`;

function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === 'true';
}

function isMaintenanceAllowed(pathname: string): boolean {
  return MAINTENANCE_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function hasMaintenanceBypass(request: NextRequest): boolean {
  const secret = process.env.MAINTENANCE_BYPASS_TOKEN;
  if (!secret) {
    return false;
  }
  return request.cookies.get(MAINTENANCE_BYPASS_COOKIE)?.value === secret;
}

function handleMaintenance(request: NextRequest): NextResponse | null {
  if (!isMaintenanceMode()) {
    return null;
  }

  const { pathname, searchParams } = request.nextUrl;
  const secret = process.env.MAINTENANCE_BYPASS_TOKEN;

  // ?bypass=<token> drops a cookie so the team can browse the live site
  // normally while everyone else keeps seeing the maintenance page.
  if (secret && searchParams.get('bypass') === secret) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete('bypass');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(MAINTENANCE_BYPASS_COOKIE, secret, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (isMaintenanceAllowed(pathname) || hasMaintenanceBypass(request)) {
    return null;
  }

  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '3600',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const maintenanceResponse = handleMaintenance(request);
  if (maintenanceResponse) {
    return maintenanceResponse;
  }

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
    /*
     * Match every request path except:
     * - _next/static and _next/image (build output / optimizer)
     * - any path containing a dot (files served from /public)
     */
    '/((?!_next/static|_next/image|.*\\..*).*)',
  ],
};


