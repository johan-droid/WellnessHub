import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../src/utils';


describe('Password Hashing/Verification', () => {
  it('hashes and verifies a password correctly', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    expect(hash.startsWith('pbkdf2$')).toBe(true);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('WrongPassword', hash)).toBe(false);
  });
});
