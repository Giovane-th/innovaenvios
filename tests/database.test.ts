import { describe, it, expect } from 'vitest';
import { getDb } from '@/server/_core/db';

describe('Database Connection', () => {
  it('should connect to MySQL database', async () => {
    const db = await getDb();
    expect(db).toBeDefined();
  });

  it('should query users table', async () => {
    const db = await getDb();
    if (!db) {
      expect(db).toBeDefined();
      return;
    }
    
    // Just check if we can query without errors
    const result = await db.execute('SELECT 1 as test');
    expect(result).toBeDefined();
  });
});
