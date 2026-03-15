import { Context } from 'hono';

// --- Security Utilities ---

const encoder = new TextEncoder();

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
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    // Fallback for old SHA-256 hashes if any exist, or just return false
    // Since this is a "fresh" improvement, we might just enforce new format
    return false;
  }
  
  const iterations = parseInt(parts[1], 10);
  const saltHex = parts[2];
  const hashHex = parts[3];
  
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
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
  
  const currentHashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return currentHashHex === hashHex;
}

// --- API Response Utilities ---

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

export function successResponse<T>(data: T, status: number = 200) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

export function errorResponse(message: string, status: number = 400) {
  return {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
}

// --- Rate Limiter ---

export class RateLimiter {
  private storage: Map<string, { count: number; expires: number }> = new Map();
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
