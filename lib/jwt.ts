// Simple JWT-like token implementation for frontend
// In production, tokens should be generated and verified by the backend server

interface JWTPayload {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  iat: number;
  exp: number;
}

// Secret key (in production, this should be on the backend)
const SECRET = 'gopi-misthan-bhandar-secret-key-2024';

// Base64 URL encode
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64 URL decode
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

// Create a simple token (mimics JWT structure)
export function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  
  // Simple signature (in production, use HMAC)
  const signature = base64UrlEncode(JSON.stringify({ ...tokenPayload, secret: SECRET }));

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify and decode token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Save token to localStorage
export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

// Remove token from localStorage
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

// Get user from token
export function getUserFromToken(): JWTPayload | null {
  const token = getToken();
  if (!token) return null;
  return verifyToken(token);
}

// Sign token (server-side, same as createToken but exported with different name)
export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return createToken(payload);
}

