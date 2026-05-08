import { describe, it, expect, beforeAll } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import { clients } from '../../drizzle/schema';
import { like, or } from 'drizzle-orm';

describe('Client Search Functionality', () => {
  let db: ReturnType<typeof drizzle>;

  beforeAll(async () => {
    // Get database URL
    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl && process.env.DB_HOST) {
      const host = process.env.DB_HOST || 'localhost';
      const port = process.env.DB_PORT || '3306';
      const user = process.env.DB_USER || 'root';
      const password = process.env.DB_PASSWORD || '';
      const database = process.env.DB_NAME || 'innovaenvios';
      dbUrl = `mysql://${user}${password ? ':' + password : ''}@${host}:${port}/${database}`;
    }

    if (!dbUrl) {
      throw new Error('No database URL provided');
    }

    db = drizzle(dbUrl);
  });

  it('should search clients by name (Rita)', async () => {
    const searchTerm = '%Rita%';
    // @ts-ignore
    const results = await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((c: any) => c.nome.includes('Rita'))).toBe(true);
    console.log(`✅ Found ${results.length} clients with "Rita"`);
  });

  it('should search clients by email', async () => {
    const searchTerm = '%@%';
    // @ts-ignore
    const results = await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );

    expect(results.length).toBeGreaterThan(0);
    console.log(`✅ Found ${results.length} clients with email`);
  });

  it('should search clients by CNPJ', async () => {
    const searchTerm = '%12.558.779%';
    // @ts-ignore
    const results = await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );

    expect(results.length).toBeGreaterThan(0);
    console.log(`✅ Found ${results.length} clients with CNPJ`);
  });

  it('should search clients by city', async () => {
    const searchTerm = '%SÃO PAULO%';
    // @ts-ignore
    const results = await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );

    expect(results.length).toBeGreaterThan(0);
    console.log(`✅ Found ${results.length} clients in SÃO PAULO`);
  });

  it('should return empty array for non-existent search', async () => {
    const searchTerm = '%XYZABC123NONEXISTENT%';
    // @ts-ignore
    const results = await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );

    expect(results.length).toBe(0);
    console.log(`✅ Correctly returned 0 results for non-existent search`);
  });

  it('should have at least 1000 clients in database', async () => {
    // @ts-ignore
    const results = await db.select().from(clients);
    expect(results.length).toBeGreaterThanOrEqual(1000);
    console.log(`✅ Database has ${results.length} clients`);
  });

  it('should find POLYSTAR client', async () => {
    const searchTerm = '%POLYSTAR%';
    // @ts-ignore
    const results = await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nome).toContain('POLYSTAR');
    console.log(`✅ Found POLYSTAR: ${results[0].nome}`);
  });

  it('should find Elaine client', async () => {
    const searchTerm = '%Elaine%';
    // @ts-ignore
    const results = await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nome).toContain('Elaine');
    console.log(`✅ Found Elaine: ${results[0].nome}`);
  });

  it('should search case-insensitive', async () => {
    const searchTerm = '%rita%'; // lowercase
    // @ts-ignore
    const results = await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );

    expect(results.length).toBeGreaterThan(0);
    console.log(`✅ Case-insensitive search works: found ${results.length} results`);
  });
});
