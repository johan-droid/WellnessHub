// ============ SECURITY UTILITIES ============

const encoder = new TextEncoder();

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;
  
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
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `pbkdf2$${iterations}$${saltHex}$${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false;
    }

    const iterations = parseInt(parts[1], 10);
    if (isNaN(iterations) || iterations < 1) return false;

    const saltHex = parts[2];
    const storedHashHex = parts[3];

    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      keyMaterial,
      256
    );

    const currentHashHex = Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return timingSafeEqual(currentHashHex, storedHashHex);
  } catch {
    return false;
  }
}

// ============ API RESPONSE UTILITIES ============

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

export function successResponse<T>(data: T, _status = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

export function errorResponse(message: string, _status = 400): ApiResponse<never> {
  return {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
}

// ============ RATE LIMITER ============

interface RateLimitRecord {
  count: number;
  expires: number;
}

export class RateLimiter {
  private storage: Map<string, RateLimitRecord> = new Map();
  private lastCleanupAt = 0;
  private readonly cleanupIntervalMs = 15 * 60 * 1000;

  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();

    if (now - this.lastCleanupAt >= this.cleanupIntervalMs) {
      this.cleanup(now);
      this.lastCleanupAt = now;
    }

    const record = this.storage.get(key);

    if (!record || now > record.expires) {
      this.storage.set(key, { count: 1, expires: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count += 1;
    return true;
  }

  cleanup(now = Date.now()) {
    for (const [key, record] of this.storage.entries()) {
      if (now > record.expires) {
        this.storage.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// ============ INPUT SANITIZATION ============

export function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim().replace(/\0/g, '') || null;
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}
