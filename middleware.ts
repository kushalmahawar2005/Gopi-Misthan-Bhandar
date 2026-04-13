import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Intercepts all requests to /admin/* and /api/admin/*
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    
    // 2. Checks for valid NextAuth session token
    let token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    }) as any;

    // 2b. If no NextAuth token, check for custom auth_token cookie
    if (!token) {
      const customToken = request.cookies.get('auth_token')?.value;
      if (customToken) {
        // Simple manual decode for middleware (avoiding complex dependencies)
        try {
          const parts = customToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp > now) {
              token = {
                id: payload.userId,
                email: payload.email,
                role: payload.role,
              };
            }
          }
        } catch (e) {
          console.error('Middleware: Error decoding custom token', e);
        }
      }
    }

    // 3. Handle unauthenticated users
    if (!token || token.role !== 'admin') {
      
      // 4. Protects /api/admin/* routes — returns 401 JSON instead of redirect
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized. Admin access required.' },
          { status: 401 }
        );
      }

      // 5. Redirects unauthenticated /admin/* users to /login with callbackUrl
      // If they are logged in but not admin, maybe redirect to profile instead of login?
      // Actually, if they are logged in as 'user', staying at /login will redirect to /profile anyway.
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

  }

  return NextResponse.next();
}

// 5. Uses matcher config — only runs on specific paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};

