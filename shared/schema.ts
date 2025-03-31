import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Define the heroes table
export const heroes = pgTable("heroes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Referenz zum Benutzer, dem der Held gehört
  name: text("name").notNull(),
  system: text("system").notNull(),
  race: text("race").notNull(),
  class: text("class").notNull(),
  level: integer("level").notNull(),
  age: integer("age"),
  deceased: boolean("deceased").default(false),
  portrait: text("portrait"),
  backstory: text("backstory"),
  backstoryPdf: text("backstory_pdf"),
  backstoryPdfName: text("backstory_pdf_name"),
  tags: text("tags"), // Komma-getrennte Tags
  stats: text("stats"), // JSON-String für Statistiken
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Define the npcs table
export const npcs = pgTable("npcs", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  name: text("name").notNull(),
  image: text("image"),
  relationship: text("relationship").notNull(),
  location: text("location"),
  notes: text("notes"),
  favorite: boolean("favorite").default(false),
  firstSessionId: text("first_session_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Define the sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  content: text("content").notNull(),
  tags: text("tags"), // Komma-getrennte Tags
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Define the quests table
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  completed: boolean("completed").default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Define the activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  heroId: integer("hero_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  date: text("date").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHeroSchema = createInsertSchema(heroes).omit({
  id: true,
});

export const insertNpcSchema = createInsertSchema(npcs).omit({
  id: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export const insertQuestSchema = createInsertSchema(quests).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Hero = typeof heroes.$inferSelect;
export type InsertHero = z.infer<typeof insertHeroSchema>;
export type Npc = typeof npcs.$inferSelect;
export type InsertNpc = z.infer<typeof insertNpcSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
