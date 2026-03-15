export class SecureTokenStorage {
  private readonly key = 'auth_token';

  set(token: string, expiresIn?: number) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.key, token);
    
    // Optional: Store expiration
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem(`${this.key}_expires`, expiresAt.toString());
    }
  }

  get(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(this.key);
    const expiresAt = localStorage.getItem(`${this.key}_expires`);
    
    // Check if expired
    if (token && expiresAt && Date.now() > parseInt(expiresAt)) {
      this.clear();
      return null;
    }
    
    return token;
  }

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.key);
    localStorage.removeItem(`${this.key}_expires`);
  }

  isExpired(): boolean {
    const expiresAt = localStorage.getItem(`${this.key}_expires`);
    return expiresAt ? Date.now() > parseInt(expiresAt) : false;
  }
}

export const tokenStorage = new SecureTokenStorage();
