import { 
  users, type User, type InsertUser,
  heroes, type Hero, type InsertHero,
  npcs, type Npc, type InsertNpc,
  sessions, type Session, type InsertSession,
  quests, type Quest, type InsertQuest,
  activities, type Activity, type InsertActivity
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

// Import für Session-Speicher
import session from 'express-session';
import createMemoryStore from 'memorystore';
import connectPg from 'connect-pg-simple';

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private heroes: Map<number, Hero>;
  private npcs: Map<number, Npc>;
  private sessions: Map<number, Session>;
  private quests: Map<number, Quest>;
  private activities: Map<number, Activity>;
  
  private userId: number;
  private heroId: number;
  private npcId: number;
  private sessionId: number;
  private questId: number;
  private activityId: number;
  
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.heroes = new Map();
    this.npcs = new Map();
    this.sessions = new Map();
    this.quests = new Map();
    this.activities = new Map();
    
    this.userId = 1;
    this.heroId = 1;
    this.npcId = 1;
    this.sessionId = 1;
    this.questId = 1;
    this.activityId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  // User Management Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await this.hashPassword(insertUser.password);
    
    const id = this.userId++;
    const user: User = { ...insertUser, password: hashedPassword, id };
    this.users.set(id, user);
    return user;
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
    return Array.from(this.heroes.values()).filter(hero => hero.userId === userId);
  }
  
  async getHeroById(id: number): Promise<Hero | undefined> {
    return this.heroes.get(id);
  }
  
  async createHero(hero: InsertHero): Promise<Hero> {
    const id = this.heroId++;
    const timestamp = new Date().toISOString();
    
    // Korrekte Typenbehandlung
    let parsedStats: string | Record<string, string | number> | null = null;
    if (hero.stats) {
      if (typeof hero.stats === 'string') {
        // Wenn es ein JSON-String ist, parsen wir es
        try {
          parsedStats = JSON.parse(hero.stats);
        } catch (e) {
          // Wenn es kein gültiger JSON-String ist, belassen wir es so wie es ist
          parsedStats = hero.stats;
        }
      } else if (typeof hero.stats === 'object') {
        // Wenn es bereits ein Objekt ist
        parsedStats = hero.stats as Record<string, string | number>;
      }
    }
    
    // Arrays und Strings für Tags verarbeiten
    let parsedTags = null;
    if (hero.tags) {
      // Wenn tags ein String mit Kommas ist, wandeln wir es in ein Array um
      if (typeof hero.tags === 'string' && hero.tags.includes(',')) {
        parsedTags = hero.tags.split(',').map(t => t.trim());
      } else {
        parsedTags = hero.tags;
      }
    }
    
    // Wir stellen sicher, dass alle erforderlichen Felder vorhanden sind
    const newHero: Hero = { 
      // Kopiere alle Eigenschaften, außer die, die wir überschreiben
      ...hero as any, 
      // Gewährleiste, dass userId immer einen Wert hat
      userId: hero.userId || 0, // Sollte von routes.ts gesetzt werden
      id,
      age: hero.age || null,
      deceased: hero.deceased || false,
      portrait: hero.portrait || null,
      backstory: hero.backstory || null,
      backstoryPdf: hero.backstoryPdf || null,
      backstoryPdfName: hero.backstoryPdfName || null,
      tags: parsedTags,
      stats: parsedStats,
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    
    this.heroes.set(id, newHero);
    return newHero;
  }
  
  async updateHero(id: number, hero: Partial<InsertHero>): Promise<Hero | undefined> {
    const existingHero = this.heroes.get(id);
    if (!existingHero) return undefined;
    
    // Aktualisierte Daten vorbereiten
    const updatedData = { ...hero };
    
    // Korrekte Typenbehandlung für stats, falls vorhanden
    if (hero.stats !== undefined) {
      if (typeof hero.stats === 'string') {
        try {
          // Wenn es ein JSON-String ist, parsen wir es
          updatedData.stats = JSON.parse(hero.stats);
        } catch (e) {
          // Bei Fehler behalten wir den Originalwert bei
          updatedData.stats = hero.stats;
        }
      } else if (typeof hero.stats === 'object') {
        // Wenn es bereits ein Objekt ist
        updatedData.stats = hero.stats as Record<string, string | number>;
      }
    }
    
    // Korrekte Typenbehandlung für tags, falls vorhanden
    if (hero.tags !== undefined) {
      // Wenn tags ein String mit Kommas ist, wandeln wir es in ein Array um
      if (typeof hero.tags === 'string' && hero.tags.includes(',')) {
        updatedData.tags = hero.tags.split(',').map(t => t.trim());
      } else {
        updatedData.tags = hero.tags;
      }
    }
    
    const updatedHero: Hero = { 
      ...existingHero, 
      ...updatedData, 
      updatedAt: new Date().toISOString() 
    };
    
    this.heroes.set(id, updatedHero);
    return updatedHero;
  }
  
  async deleteHero(id: number): Promise<boolean> {
    return this.heroes.delete(id);
  }
  
  async isHeroOwnedByUser(heroId: number, userId: number): Promise<boolean> {
    const hero = await this.getHeroById(heroId);
    return hero?.userId === userId;
  }
  
  // NPC Management Methods
  async getNpcsByHeroId(heroId: number): Promise<Npc[]> {
    return Array.from(this.npcs.values()).filter(npc => npc.heroId === heroId);
  }
  
  async getNpcById(id: number): Promise<Npc | undefined> {
    return this.npcs.get(id);
  }
  
  async createNpc(npc: InsertNpc): Promise<Npc> {
    const id = this.npcId++;
    const timestamp = new Date().toISOString();
    const newNpc: Npc = { 
      ...npc, 
      id, 
      image: npc.image || null,
      location: npc.location || null,
      notes: npc.notes || null,
      favorite: npc.favorite || false,
      firstSessionId: npc.firstSessionId || null,
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.npcs.set(id, newNpc);
    return newNpc;
  }
  
  async updateNpc(id: number, npc: Partial<InsertNpc>): Promise<Npc | undefined> {
    const existingNpc = this.npcs.get(id);
    if (!existingNpc) return undefined;
    
    const updatedNpc: Npc = { 
      ...existingNpc, 
      ...npc, 
      updatedAt: new Date().toISOString() 
    };
    this.npcs.set(id, updatedNpc);
    return updatedNpc;
  }
  
  async deleteNpc(id: number): Promise<boolean> {
    return this.npcs.delete(id);
  }
  
  // Session Management Methods
  async getSessionsByHeroId(heroId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => session.heroId === heroId);
  }
  
  async getSessionById(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async createSession(session: InsertSession): Promise<Session> {
    const id = this.sessionId++;
    const timestamp = new Date().toISOString();
    
    // Tags-Verarbeitung
    let parsedTags = null;
    if (session.tags) {
      // Wenn tags ein String mit Kommas ist, wandeln wir es in ein Array um
      if (typeof session.tags === 'string' && session.tags.includes(',')) {
        parsedTags = session.tags.split(',').map(t => t.trim());
      } else {
        parsedTags = session.tags;
      }
    }
    
    const newSession: Session = { 
      ...session, 
      id, 
      tags: parsedTags,
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.sessions.set(id, newSession);
    return newSession;
  }
  
  async updateSession(id: number, session: Partial<InsertSession>): Promise<Session | undefined> {
    const existingSession = this.sessions.get(id);
    if (!existingSession) return undefined;
    
    // Aktualisierte Daten vorbereiten
    const updatedData = { ...session };
    
    // Tags-Verarbeitung, falls vorhanden
    if (session.tags !== undefined) {
      // Wenn tags ein String mit Kommas ist, wandeln wir es in ein Array um
      if (typeof session.tags === 'string' && session.tags.includes(',')) {
        updatedData.tags = session.tags.split(',').map(t => t.trim());
      } else {
        updatedData.tags = session.tags;
      }
    }
    
    const updatedSession: Session = { 
      ...existingSession, 
      ...updatedData, 
      updatedAt: new Date().toISOString() 
    };
    
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async deleteSession(id: number): Promise<boolean> {
    return this.sessions.delete(id);
  }
  
  // Quest Management Methods
  async getQuestsByHeroId(heroId: number): Promise<Quest[]> {
    return Array.from(this.quests.values()).filter(quest => quest.heroId === heroId);
  }
  
  async getQuestById(id: number): Promise<Quest | undefined> {
    return this.quests.get(id);
  }
  
  async createQuest(quest: InsertQuest): Promise<Quest> {
    const id = this.questId++;
    const timestamp = new Date().toISOString();
    const newQuest: Quest = { 
      ...quest, 
      id, 
      completed: quest.completed || false,
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.quests.set(id, newQuest);
    return newQuest;
  }
  
  async updateQuest(id: number, quest: Partial<InsertQuest>): Promise<Quest | undefined> {
    const existingQuest = this.quests.get(id);
    if (!existingQuest) return undefined;
    
    const updatedQuest: Quest = { 
      ...existingQuest, 
      ...quest, 
      updatedAt: new Date().toISOString() 
    };
    this.quests.set(id, updatedQuest);
    return updatedQuest;
  }
  
  async deleteQuest(id: number): Promise<boolean> {
    return this.quests.delete(id);
  }
  
  // Activity Management Methods
  async getActivitiesByHeroId(heroId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.heroId === heroId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

// PostgreSQL-Storage Implementation
export class DatabaseStorage implements IStorage {
  private db: any;
  sessionStore: session.Store;

  constructor() {
    // PostgreSQL-Verbindung mit Neon Serverless
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);

    // PostgreSQL-Session-Store mit korrektem Tabellennamen
    this.sessionStore = new PostgresStore({
      conObject: {
        connectionString: process.env.DATABASE_URL
      },
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 60
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

// Hier entscheiden wir, welche Storage-Implementierung verwendet wird
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
