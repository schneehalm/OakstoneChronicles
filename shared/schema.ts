import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Benutzer-Tabelle
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Helden-Tabelle
export const heroes = pgTable("heroes", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  system: text("system").notNull(),
  race: text("race").notNull(),
  class: text("class").notNull(),
  level: integer("level").notNull(),
  age: integer("age"),
  portrait: text("portrait"),
  backstory: text("backstory"),
  backstoryPdf: text("backstory_pdf"),
  backstoryPdfName: text("backstory_pdf_name"),
  tags: text("tags").array(),
  stats: text("stats").notNull(), // JSON-String für Statistiken
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NPC-Tabelle
export const npcs = pgTable("npcs", {
  id: text("id").primaryKey(),
  heroId: text("hero_id").notNull().references(() => heroes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  image: text("image"),
  relationship: text("relationship").notNull(),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sitzungs-Tabelle
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  heroId: text("hero_id").notNull().references(() => heroes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: text("date").notNull(), // ISO-Datumsstring
  content: text("content").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auftrags-Tabelle
export const quests = pgTable("quests", {
  id: text("id").primaryKey(),
  heroId: text("hero_id").notNull().references(() => heroes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // main, side, etc.
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Aktivitäts-Tabelle
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  heroId: text("hero_id").references(() => heroes.id, { onDelete: "set null" }),
  type: text("type").notNull(), // z.B. hero_created, npc_updated, etc.
  message: text("message").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

// Schemas für Einfügeoperationen

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertHeroSchema = createInsertSchema(heroes).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertNpcSchema = createInsertSchema(npcs).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertQuestSchema = createInsertSchema(quests).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  date: true,
});

// Typdefinitionen

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHero = z.infer<typeof insertHeroSchema>;
export type Hero = typeof heroes.$inferSelect;

export type InsertNpc = z.infer<typeof insertNpcSchema>;
export type Npc = typeof npcs.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type Quest = typeof quests.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
