import { eq, like, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, InsertClient, Client, shippingLabels, InsertShippingLabel, ShippingLabel, employees, InsertEmployee, Employee, settings, InsertSetting, Setting } from "../drizzle/schema";
import { ENV } from "./_core/env";



let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== CLIENTES =====

export async function createClient(data: InsertClient): Promise<Client | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create client: database not available");
    return null;
  }

  try {
    // Drizzle retorna um objeto com insertId ou id
    const result = await db.insert(clients).values(data);
    const insertId = (result as any).insertId || (result as any)[0]?.id;
    
    if (!insertId) {
      // Se não conseguir o ID, retorna os dados inseridos
      return { ...data, id: 0, createdAt: new Date(), updatedAt: new Date() } as Client;
    }
    
    const newClient = await db.select().from(clients).where(eq(clients.id, Number(insertId))).limit(1);
    return newClient.length > 0 ? newClient[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create client:", error);
    throw error;
  }
}

export async function getClients(limit?: number, offset?: number): Promise<Client[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get clients: database not available");
    return [];
  }

  try {
    let query: any = db.select().from(clients);
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.offset(offset);
    }
    return await query;
  } catch (error) {
    console.error("[Database] Failed to get clients:", error);
    return [];
  }
}

export async function searchClients(query: string): Promise<Client[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search clients: database not available");
    return [];
  }

  try {
    const searchTerm = `%${query}%`;
    const results: any = await db
      .select()
      .from(clients)
      .where(
        and(
          like(clients.nome, searchTerm),
          like(clients.email, searchTerm),
          like(clients.cpf_cnpj, searchTerm),
          like(clients.cidade, searchTerm)
        )
      );
    return results;
  } catch (error) {
    console.error("[Database] Failed to search clients:", error);
    return [];
  }
}

export async function getClientById(id: number): Promise<Client | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get client: database not available");
    return null;
  }

  try {
    const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get client:", error);
    return null;
  }
}

export async function updateClient(id: number, data: Partial<InsertClient>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update client: database not available");
    return;
  }

  try {
    await db.update(clients).set({ ...data, updatedAt: new Date() }).where(eq(clients.id, id));
  } catch (error) {
    console.error("[Database] Failed to update client:", error);
    throw error;
  }
}

export async function deleteClient(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete client: database not available");
    return;
  }

  try {
    await db.delete(clients).where(eq(clients.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete client:", error);
    throw error;
  }
}

// ===== ETIQUETAS DE ENVIO =====

export async function createShippingLabel(data: InsertShippingLabel): Promise<ShippingLabel | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create shipping label: database not available");
    return null;
  }

  try {
    const result = await db.insert(shippingLabels).values(data);
    const newLabel = await db.select().from(shippingLabels).where(eq(shippingLabels.id, Number((result as any).insertId))).limit(1);
    return newLabel.length > 0 ? newLabel[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create shipping label:", error);
    throw error;
  }
}

export async function getShippingLabels(limit?: number, offset?: number): Promise<ShippingLabel[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get shipping labels: database not available");
    return [];
  }

  try {
    let query: any = db.select().from(shippingLabels);
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.offset(offset);
    }
    return await query;
  } catch (error) {
    console.error("[Database] Failed to get shipping labels:", error);
    return [];
  }
}

export async function getShippingLabelByCode(code: string): Promise<ShippingLabel | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get shipping label: database not available");
    return null;
  }

  try {
    const result = await db.select().from(shippingLabels).where(eq(shippingLabels.code, code)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get shipping label:", error);
    return null;
  }
}

export async function updateShippingLabel(id: number, data: Partial<InsertShippingLabel>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update shipping label: database not available");
    return;
  }

  try {
    await db.update(shippingLabels).set({ ...data, updatedAt: new Date() }).where(eq(shippingLabels.id, id));
  } catch (error) {
    console.error("[Database] Failed to update shipping label:", error);
    throw error;
  }
}

export async function deleteShippingLabel(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete shipping label: database not available");
    return;
  }

  try {
    await db.delete(shippingLabels).where(eq(shippingLabels.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete shipping label:", error);
    throw error;
  }
}

// ===== FUNCIONÁRIOS =====

export async function createEmployee(data: InsertEmployee): Promise<Employee | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create employee: database not available");
    return null;
  }

  try {
    const result = await db.insert(employees).values(data);
    const newEmployee = await db.select().from(employees).where(eq(employees.id, Number((result as any).insertId))).limit(1);
    return newEmployee.length > 0 ? newEmployee[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create employee:", error);
    throw error;
  }
}

export async function getEmployees(limit?: number, offset?: number): Promise<Employee[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get employees: database not available");
    return [];
  }

  try {
    let query: any = db.select().from(employees);
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.offset(offset);
    }
    return await query;
  } catch (error) {
    console.error("[Database] Failed to get employees:", error);
    return [];
  }
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get employee: database not available");
    return null;
  }

  try {
    const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get employee:", error);
    return null;
  }
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update employee: database not available");
    return;
  }

  try {
    await db.update(employees).set({ ...data, updatedAt: new Date() }).where(eq(employees.id, id));
  } catch (error) {
    console.error("[Database] Failed to update employee:", error);
    throw error;
  }
}

export async function deleteEmployee(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete employee: database not available");
    return;
  }

  try {
    await db.delete(employees).where(eq(employees.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete employee:", error);
    throw error;
  }
}

// ===== CONFIGURAÇÕES =====

export async function getSettings(): Promise<Setting | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get settings: database not available");
    return null;
  }

  try {
    const result = await db.select().from(settings).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get settings:", error);
    return null;
  }
}

export async function updateSettings(data: Partial<InsertSetting>): Promise<Setting | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update settings: database not available");
    return null;
  }

  try {
    const existingSettings = await getSettings();
    if (!existingSettings) {
      const result = await db.insert(settings).values(data as InsertSetting);
      const newSettings = await db.select().from(settings).where(eq(settings.id, Number((result as any).insertId))).limit(1);
      return newSettings.length > 0 ? newSettings[0] : null;
    } else {
      await db.update(settings).set({ ...data, updatedAt: new Date() }).where(eq(settings.id, existingSettings.id));
      return await getSettings();
    }
  } catch (error) {
    console.error("[Database] Failed to update settings:", error);
    throw error;
  }
}
