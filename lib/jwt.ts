interface JWTPayload {
  userId: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
  iat: number;
  exp: number;
}

type TokenPayloadInput = {
  userId: string;
  email: string;
  name?: string;
  role?: string;
};

const TOKEN_ISSUER = 'gopi-misthan-bhandar';
const TOKEN_AUDIENCE = 'gopi-misthan-bhandar-auth';
const TOKEN_EXPIRY = '7d';

function getJWTSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is missing.');
  }
  return secret;
}

function normalizeRole(role?: string): 'user' | 'admin' {
  return typeof role === 'string' && role.toLowerCase() === 'admin' ? 'admin' : 'user';
}

function normalizePayload(payload: any): JWTPayload | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
    return null;
  }

  if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    role: normalizeRole(payload.role),
    iat: payload.iat,
    exp: payload.exp,
  };
}

function decodePayloadUnsafe(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payloadPart = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payloadPart + '='.repeat((4 - (payloadPart.length % 4)) % 4);
    const decoded = atob(paddedPayload);

    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export async function createToken(payload: TokenPayloadInput): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('Token signing is only available on the server.');
  }

  const jwt = await import('jsonwebtoken');
  const safePayload = {
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: normalizeRole(payload.role),
  };

  return jwt.sign(safePayload, getJWTSecret(), {
    algorithm: 'HS256',
    expiresIn: TOKEN_EXPIRY,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    subject: payload.userId,
  });
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (!token) {
      return null;
    }

    // Client-side verification cannot access the server secret.
    // We only decode for UX hydration; server authorization must use verified NextAuth JWT.
    if (typeof window !== 'undefined') {
      const decoded = normalizePayload(decodePayloadUnsafe(token));
      if (!decoded) {
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return null;
      }

      return decoded;
    }

    const jwt = await import('jsonwebtoken');
    const verified = jwt.verify(token, getJWTSecret(), {
      algorithms: ['HS256'],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    return normalizePayload(verified);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const expectedTokenError = /invalid signature|jwt expired|invalid token|jwt malformed/i.test(message);
    if (!expectedTokenError) {
      console.error('Token verification error:', error);
    }
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
export async function getUserFromToken(): Promise<JWTPayload | null> {
  const token = getToken();
  if (!token) return null;
  return await verifyToken(token);
}

// Sign token (server-side, same as createToken but exported with different name)
export async function signToken(payload: TokenPayloadInput): Promise<string> {
  return await createToken(payload);
}
