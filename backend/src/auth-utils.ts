import { sign, verify } from 'hono/jwt';

/**
 * Password Hashing Utilities
 * 
 * For Cloudflare Workers, we use a polyfill approach since argon2 is heavy.
 * This uses scrypt as a compromise (more secure than SHA-256 but lightweight).
 * 
 * In production, consider using a dedicated authentication service like:
 * - Auth0
 * - Clerk
 * - Supabase Auth
 * 
 * These handle password hashing securely on their infrastructure.
 */

/**
 * Hash a password using Web Crypto API with PBKDF2
 * This is secure enough for most use cases and works in Cloudflare Workers
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes = 128 bits

  // PBKDF2 with SHA-256
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // High iteration count = slower to crack
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  // Combine salt + hash
  const hashArray = new Uint8Array(derivedBits);
  const saltArray = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashStr = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');

  // Return format: algorithm$iterations$salt$hash
  return `pbkdf2$100000$${saltArray}$${hashStr}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    throw new Error('Invalid hash format');
  }

  const iterations = parseInt(parts[1], 10);
  const salt = Uint8Array.from(
    parts[2].match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const storedHash = parts[3];
  return hashArray === storedHash;
}

/**
 * JWT Token Management
 */
export interface JWTPayload {
  sub: string; // user ID
  exp: number; // expiration time
  iat?: number; // issued at
}

export async function generateToken(
  userId: string,
  secret: string,
  expiresInHours: number = 24
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + expiresInHours * 60 * 60;

  return await sign(
    {
      sub: userId,
      exp: expiresAt,
      iat: now,
    },
    secret,
    'HS256'
  );
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload> {
  try {
    const payload = await verify(token, secret, 'HS256');
    return payload as unknown as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Rate Limiting Helper
 * Stores rate limit counters in memory (for single-instance)
 * For distributed systems, use Redis or D1
 */
class RateLimiter {
  private counters: Map<string, { count: number; resetTime: number }> = new Map();

  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.counters.get(key);

    if (!entry || now > entry.resetTime) {
      this.counters.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count < limit) {
      entry.count++;
      return true;
    }

    return false;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.counters.entries()) {
      if (now > entry.resetTime) {
        this.counters.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();
