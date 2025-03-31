import { 
  users, type User, type InsertUser,
  heroes, type Hero, type InsertHero,
  npcs, type Npc, type InsertNpc,
  sessions, type Session, type InsertSession,
  quests, type Quest, type InsertQuest,
  activities, type Activity, type InsertActivity
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from './db';

// Import für Session-Speicher
import session from 'express-session';
import createMemoryStore from 'memorystore';
import connectPg from 'connect-pg-simple';
import { pool } from './db';

// Speicher-Konfiguration
const MemoryStore = createMemoryStore(session);
const PostgresStore = connectPg(session);

export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  
  // Hero Management
  getHeroesByUserId(userId: number): Promise<Hero[]>;
  getHeroById(id: number): Promise<Hero | undefined>;
  createHero(hero: InsertHero): Promise<Hero>;
  updateHero(id: number, hero: Partial<InsertHero>): Promise<Hero | undefined>;
  deleteHero(id: number): Promise<boolean>;
  isHeroOwnedByUser(heroId: number, userId: number): Promise<boolean>;
  
  // NPC Management
  getNpcsByHeroId(heroId: number): Promise<Npc[]>;
  getNpcById(id: number): Promise<Npc | undefined>;
  createNpc(npc: InsertNpc): Promise<Npc>;
  updateNpc(id: number, npc: Partial<InsertNpc>): Promise<Npc | undefined>;
  deleteNpc(id: number): Promise<boolean>;
  
  // Session Management
  getSessionsByHeroId(heroId: number): Promise<Session[]>;
  getSessionById(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;
  
  // Quest Management
  getQuestsByHeroId(heroId: number): Promise<Quest[]>;
  getQuestById(id: number): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: number, quest: Partial<InsertQuest>): Promise<Quest | undefined>;
  deleteQuest(id: number): Promise<boolean>;
  
  // Activity Management
  getActivitiesByHeroId(heroId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  sessionStore: session.Store;
}

// PostgreSQL-Storage Implementation
export class DatabaseStorage implements IStorage {
  private db: any;
  sessionStore: session.Store;

  constructor() {
    // Wir verwenden das "db"-Objekt, das bereits am Anfang der Datei importiert wurde
    this.db = db;

    // PostgreSQL für die Sitzungsverwaltung
    this.sessionStore = new PostgresStore({
      pool,
      tableName: 'session'
    });
  }

  // User Management Methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await this.hashPassword(insertUser.password);
    
    const result = await this.db.insert(users).values({
      username: insertUser.username,
      password: hashedPassword
    }).returning();
    
    return result[0];
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
  
  // Hero Management Methods
  async getHeroesByUserId(userId: number): Promise<Hero[]> {
    const result = await this.db.select().from(heroes).where(eq(heroes.userId, userId));
    
    // Konvertieren der Daten in die richtige Form
    return result.map((hero: any) => this.processHero(hero));
  }
  
  async getHeroById(id: number): Promise<Hero | undefined> {
    const result = await this.db.select().from(heroes).where(eq(heroes.id, id));
    if (result.length === 0) return undefined;
    
    return this.processHero(result[0]);
  }
  
  async createHero(hero: InsertHero): Promise<Hero> {
    const timestamp = new Date().toISOString();
    
    // Korrekte Typenbehandlung
    const processedStats = this.processStatsToDb(hero.stats);
    const processedTags = this.processTagsToDb(hero.tags);
    
    const result = await this.db.insert(heroes).values({
      userId: hero.userId ?? 0,
      name: hero.name,
      system: hero.system,
      race: hero.race,
      class: hero.class,
      level: hero.level,
      age: hero.age,
      deceased: hero.deceased ?? false,
      portrait: hero.portrait,
      backstory: hero.backstory,
      backstoryPdf: hero.backstoryPdf,
      backstoryPdfName: hero.backstoryPdfName,
      stats: processedStats,
      tags: processedTags,
      createdAt: timestamp,
      updatedAt: timestamp
    }).returning();
    
    return this.processHero(result[0]);
  }
  
  async updateHero(id: number, hero: Partial<InsertHero>): Promise<Hero | undefined> {
    const existingHero = await this.getHeroById(id);
    if (!existingHero) return undefined;
    
    // Aktualisierte Daten vorbereiten
    const updatedData: any = { ...hero, updatedAt: new Date().toISOString() };
    
    // Korrekte Typenbehandlung für stats, falls vorhanden
    if (hero.stats !== undefined) {
      updatedData.stats = this.processStatsToDb(hero.stats);
    }
    
    // Korrekte Typenbehandlung für tags, falls vorhanden
    if (hero.tags !== undefined) {
      updatedData.tags = this.processTagsToDb(hero.tags);
    }
    
    const result = await this.db.update(heroes)
      .set(updatedData)
      .where(eq(heroes.id, id))
      .returning();
    
    if (result.length === 0) return undefined;
    return this.processHero(result[0]);
  }
  
  async deleteHero(id: number): Promise<boolean> {
    const result = await this.db.delete(heroes).where(eq(heroes.id, id)).returning();
    return result.length > 0;
  }
  
  async isHeroOwnedByUser(heroId: number, userId: number): Promise<boolean> {
    const hero = await this.getHeroById(heroId);
    return hero?.userId === userId;
  }
  
  // NPC Management Methods
  async getNpcsByHeroId(heroId: number): Promise<Npc[]> {
    const result = await this.db.select().from(npcs).where(eq(npcs.heroId, heroId));
    return result;
  }
  
  async getNpcById(id: number): Promise<Npc | undefined> {
    const result = await this.db.select().from(npcs).where(eq(npcs.id, id));
    return result[0];
  }
  
  async createNpc(npc: InsertNpc): Promise<Npc> {
    const timestamp = new Date().toISOString();
    
    const result = await this.db.insert(npcs).values({
      ...npc,
      favorite: npc.favorite ?? false,
      createdAt: timestamp,
      updatedAt: timestamp
    }).returning();
    
    return result[0];
  }
  
  async updateNpc(id: number, npc: Partial<InsertNpc>): Promise<Npc | undefined> {
    const result = await this.db.update(npcs)
      .set({
        ...npc,
        updatedAt: new Date().toISOString()
      })
      .where(eq(npcs.id, id))
      .returning();
    
    if (result.length === 0) return undefined;
    return result[0];
  }
  
  async deleteNpc(id: number): Promise<boolean> {
    const result = await this.db.delete(npcs).where(eq(npcs.id, id)).returning();
    return result.length > 0;
  }
  
  // Session Management Methods
  async getSessionsByHeroId(heroId: number): Promise<Session[]> {
    const result = await this.db.select().from(sessions).where(eq(sessions.heroId, heroId));
    
    // Konvertieren der Daten in die richtige Form
    return result.map((session: any) => this.processSession(session));
  }
  
  async getSessionById(id: number): Promise<Session | undefined> {
    const result = await this.db.select().from(sessions).where(eq(sessions.id, id));
    if (result.length === 0) return undefined;
    
    return this.processSession(result[0]);
  }
  
  async createSession(session: InsertSession): Promise<Session> {
    const timestamp = new Date().toISOString();
    const processedTags = this.processTagsToDb(session.tags);
    
    const result = await this.db.insert(sessions).values({
      ...session,
      tags: processedTags,
      createdAt: timestamp,
      updatedAt: timestamp
    }).returning();
    
    return this.processSession(result[0]);
  }
  
  async updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined> {
    const updatedData: any = { ...session, updatedAt: new Date().toISOString() };
    
    // Tags-Verarbeitung, falls vorhanden
    if (session.tags !== undefined) {
      updatedData.tags = this.processTagsToDb(session.tags);
    }
    
    const result = await this.db.update(sessions)
      .set(updatedData)
      .where(eq(sessions.id, id))
      .returning();
    
    if (result.length === 0) return undefined;
    return this.processSession(result[0]);
  }
  
  async deleteSession(id: number): Promise<boolean> {
    const result = await this.db.delete(sessions).where(eq(sessions.id, id)).returning();
    return result.length > 0;
  }
  
  // Quest Management Methods
  async getQuestsByHeroId(heroId: number): Promise<Quest[]> {
    const result = await this.db.select().from(quests).where(eq(quests.heroId, heroId));
    return result;
  }
  
  async getQuestById(id: number): Promise<Quest | undefined> {
    const result = await this.db.select().from(quests).where(eq(quests.id, id));
    return result[0];
  }
  
  async createQuest(quest: InsertQuest): Promise<Quest> {
    const timestamp = new Date().toISOString();
    
    const result = await this.db.insert(quests).values({
      ...quest,
      completed: quest.completed ?? false,
      createdAt: timestamp,
      updatedAt: timestamp
    }).returning();
    
    return result[0];
  }
  
  async updateQuest(id: number, quest: Partial<InsertQuest>): Promise<Quest | undefined> {
    const result = await this.db.update(quests)
      .set({
        ...quest,
        updatedAt: new Date().toISOString()
      })
      .where(eq(quests.id, id))
      .returning();
    
    if (result.length === 0) return undefined;
    return result[0];
  }
  
  async deleteQuest(id: number): Promise<boolean> {
    const result = await this.db.delete(quests).where(eq(quests.id, id)).returning();
    return result.length > 0;
  }
  
  // Activity Management Methods
  async getActivitiesByHeroId(heroId: number, limit?: number): Promise<Activity[]> {
    let query = this.db.select().from(activities).where(eq(activities.heroId, heroId));
    
    // Sortieren und begrenzen
    const result = await query;
    const sortedResult = result.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return limit ? sortedResult.slice(0, limit) : sortedResult;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await this.db.insert(activities).values(activity).returning();
    return result[0];
  }

  // Hilfsfunktionen für die Datenverarbeitung
  private processHero(hero: any): Hero {
    // Prozessiere stats
    let parsedStats = null;
    if (hero.stats) {
      try {
        parsedStats = JSON.parse(hero.stats);
      } catch (e) {
        parsedStats = hero.stats;
      }
    }
    
    // Prozessiere tags
    let parsedTags = null;
    if (hero.tags) {
      try {
        parsedTags = JSON.parse(hero.tags);
      } catch (e) {
        parsedTags = hero.tags;
      }
    }
    
    return {
      ...hero,
      tags: parsedTags,
      stats: parsedStats
    };
  }
  
  private processSession(session: any): Session {
    // Prozessiere tags
    let parsedTags = null;
    if (session.tags) {
      try {
        parsedTags = JSON.parse(session.tags);
      } catch (e) {
        parsedTags = session.tags;
      }
    }
    
    return {
      ...session,
      tags: parsedTags
    };
  }
  
  private processStatsToDb(stats: any): string | null {
    if (!stats) return null;
    
    if (typeof stats === 'string') {
      return stats;
    } else {
      return JSON.stringify(stats);
    }
  }
  
  private processTagsToDb(tags: any): string | null {
    if (!tags) return null;
    
    if (typeof tags === 'string') {
      return tags;
    } else if (Array.isArray(tags)) {
      return JSON.stringify(tags);
    }
    
    return null;
  }
}

// Verwende DatabaseStorage für persistente Datenspeicherung
export const storage = new DatabaseStorage();