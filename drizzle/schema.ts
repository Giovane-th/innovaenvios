import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de usuários com autenticação por email/senha
export const appUsers = mysqlTable("app_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Hash bcrypt
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type AppUser = typeof appUsers.$inferSelect;
export type InsertAppUser = typeof appUsers.$inferInsert;

// Tabela de clientes
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  cpf_cnpj: varchar("cpf_cnpj", { length: 20 }),
  telefone: varchar("telefone", { length: 20 }),
  celular: varchar("celular", { length: 20 }),
  endereco: varchar("endereco", { length: 255 }),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 255 }),
  cidade: varchar("cidade", { length: 100 }),
  uf: varchar("uf", { length: 2 }),
  bairro: varchar("bairro", { length: 100 }),
  cep: varchar("cep", { length: 10 }),
  ponto_referencia: text("ponto_referencia"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Tabela de etiquetas de envio
export const shippingLabels = mysqlTable("shipping_labels", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  clientId: int("clientId"),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: varchar("address", { length: 255 }).notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  complement: varchar("complement", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }),
  zipcode: varchar("zipcode", { length: 10 }).notNull(),
  reference_point: text("reference_point"),
  status: mysqlEnum("status", ["Gerada", "Postada", "Em trânsito", "Entregue"]).default("Gerada").notNull(),
  cost: varchar("cost", { length: 20 }), // Custo do envio (ex: 15.50)
  weight: varchar("weight", { length: 20 }), // Peso do pacote (ex: 500g)
  service_type: varchar("service_type", { length: 100 }), // Tipo de serviço (ex: PAC, SEDEX)
  created_by: int("created_by").notNull(), // ID do funcionário que criou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShippingLabel = typeof shippingLabels.$inferSelect;
export type InsertShippingLabel = typeof shippingLabels.$inferInsert;

// Tabela de funcionários
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  role: varchar("role", { length: 100 }).notNull(), // Cargo (ex: Operador, Gerente)
  password: varchar("password", { length: 255 }).notNull(), // Hash da senha
  isActive: int("isActive").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// Tabela de configurações
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull().default("InNova Envios - IEP"),
  cnpj: varchar("cnpj", { length: 20 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zip: varchar("zip", { length: 10 }),
  correiosContract: varchar("correiosContract", { length: 255 }),
  correiosApiKey: varchar("correiosApiKey", { length: 255 }),
  correiosUser: varchar("correiosUser", { length: 255 }),
  correiosPassword: varchar("correiosPassword", { length: 255 }),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#0a7ea4"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#1abc9c"),
  logoUrl: text("logoUrl"),
  enableNotifications: int("enableNotifications").default(1),
  enableAutoBackup: int("enableAutoBackup").default(1),
  darkMode: int("darkMode").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
