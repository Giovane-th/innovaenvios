import bcrypt from 'bcrypt';
import { appUsers } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { getDb } from './db.js';

const SALT_ROUNDS = 10;

export async function registerAppUser(name: string, email: string, password: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    // Verificar se email já existe
    const existing = await db.select().from(appUsers).where(eq(appUsers.email, email));
    if (existing.length > 0) {
      return { success: false, error: 'Email já cadastrado' };
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Criar usuário
    const result = await db.insert(appUsers).values({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isActive: 1
    });

    return {
      success: true,
      userId: (result as any).insertId,
      message: 'Usuário criado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { success: false, error: 'Erro ao registrar usuário' };
  }
}

export async function loginAppUser(email: string, password: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    // Buscar usuário
    const users = await db.select().from(appUsers).where(eq(appUsers.email, email));
    if (users.length === 0) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    const user = users[0];

    // Verificar se está ativo
    if (!user.isActive) {
      return { success: false, error: 'Usuário inativo' };
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    // Atualizar lastSignedIn
    await db.update(appUsers)
      .set({ lastSignedIn: new Date() })
      .where(eq(appUsers.id, user.id));

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: 'Erro ao fazer login' };
  }
}

export async function createAppUser(name: string, email: string, password: string, role: 'user' | 'admin' = 'user') {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    // Verificar se email já existe
    const existing = await db.select().from(appUsers).where(eq(appUsers.email, email));
    if (existing.length > 0) {
      return { success: false, error: 'Email já cadastrado' };
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Criar usuário
    const result = await db.insert(appUsers).values({
      name,
      email,
      password: hashedPassword,
      role,
      isActive: 1
    });

    return {
      success: true,
      userId: (result as any).insertId,
      message: 'Usuário criado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return { success: false, error: 'Erro ao criar usuário' };
  }
}

export async function listAppUsers() {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const users = await db.select({
      id: appUsers.id,
      name: appUsers.name,
      email: appUsers.email,
      role: appUsers.role,
      isActive: appUsers.isActive,
      createdAt: appUsers.createdAt,
      lastSignedIn: appUsers.lastSignedIn
    }).from(appUsers);

    return { success: true, users };
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return { success: false, error: 'Erro ao listar usuários' };
  }
}

export async function deleteAppUser(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    await db.update(appUsers)
      .set({ isActive: 0 })
      .where(eq(appUsers.id, userId));

    return { success: true, message: 'Usuário deletado com sucesso' };
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return { success: false, error: 'Erro ao deletar usuário' };
  }
}

export async function updateAppUser(userId: number, updates: { name?: string; email?: string; role?: 'user' | 'admin' }) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    await db.update(appUsers)
      .set(updates)
      .where(eq(appUsers.id, userId));

    return { success: true, message: 'Usuário atualizado com sucesso' };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return { success: false, error: 'Erro ao atualizar usuário' };
  }
}

export async function getAppUserById(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const users = await db.select().from(appUsers).where(eq(appUsers.id, userId));
    if (users.length === 0) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    return { success: true, user: users[0] };
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return { success: false, error: 'Erro ao buscar usuário' };
  }
}
