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

/**
 * Table pour tracker les tickets Jira créés
 */
export const jiraTickets = mysqlTable("jira_tickets", {
  id: int("id").autoincrement().primaryKey(),
  jiraKey: varchar("jiraKey", { length: 64 }).notNull().unique(),
  jiraUrl: text("jiraUrl").notNull(),
  technology: varchar("technology", { length: 64 }).notNull(),
  solutionCode: varchar("solutionCode", { length: 255 }).notNull(),
  environment: varchar("environment", { length: 32 }).notNull(),
  squad: varchar("squad", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  cpu: int("cpu"),
  ram: int("ram"),
  dbEngine: varchar("dbEngine", { length: 64 }),
  diskSize: int("diskSize"),
  storageType: varchar("storageType", { length: 64 }),
  storageQuota: int("storageQuota"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JiraTicket = typeof jiraTickets.$inferSelect;
export type InsertJiraTicket = typeof jiraTickets.$inferInsert;
