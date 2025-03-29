import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import { 
  users, heroes, npcs, sessions, quests, activities,
  type User, type InsertUser, type Hero, type InsertHero, 
  type Npc, type InsertNpc, type Session, type InsertSession, 
  type Quest, type InsertQuest, type Activity, type InsertActivity
} from '@shared/schema';
import expressSession from 'express-session';
import pgSessionStore from 'connect-pg-simple';
import memorystore from 'memorystore';

// Datenbankverbindung konfigurieren
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Postgres Session Store
const PostgresSessionStore = pgSessionStore(expressSession);
const MemoryStore = memorystore(expressSession);

export interface IStorage {
  // Benutzer-Operationen
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Helden-Operationen
  getHeroesByUserId(userId: number): Promise<Hero[]>;
  getHeroById(id: string): Promise<Hero | undefined>;
  createHero(hero: InsertHero): Promise<Hero>;
  updateHero(id: string, heroData: Partial<Hero>): Promise<Hero | undefined>;
  deleteHero(id: string): Promise<boolean>;
  
  // NPC-Operationen
  getNpcsByHeroId(heroId: string): Promise<Npc[]>;
  getNpcById(id: string): Promise<Npc | undefined>;
  createNpc(npc: InsertNpc): Promise<Npc>;
  updateNpc(id: string, npcData: Partial<Npc>): Promise<Npc | undefined>;
  deleteNpc(id: string): Promise<boolean>;
  
  // Sitzungs-Operationen
  getSessionsByHeroId(heroId: string): Promise<Session[]>;
  getSessionById(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, sessionData: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  
  // Auftrags-Operationen
  getQuestsByHeroId(heroId: string): Promise<Quest[]>;
  getActiveQuestsByHeroId(heroId: string): Promise<Quest[]>;
  getQuestById(id: string): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: string, questData: Partial<Quest>): Promise<Quest | undefined>;
  deleteQuest(id: string): Promise<boolean>;
  
  // Aktivitäts-Operationen
  getActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]>;
  addActivity(activity: InsertActivity): Promise<Activity>;
  
  // Express Session Store
  sessionStore: expressSession.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: expressSession.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true
    });
  }
  
  // Benutzer-Operationen
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  // Helden-Operationen
  async getHeroesByUserId(userId: number): Promise<Hero[]> {
    return await db.select().from(heroes).where(eq(heroes.userId, userId));
  }
  
  async getHeroById(id: string): Promise<Hero | undefined> {
    const result = await db.select().from(heroes).where(eq(heroes.id, id));
    return result[0];
  }
  
  async createHero(heroData: InsertHero): Promise<Hero> {
    const result = await db.insert(heroes).values(heroData).returning();
    return result[0];
  }
  
  async updateHero(id: string, heroData: Partial<Hero>): Promise<Hero | undefined> {
    const result = await db
      .update(heroes)
      .set({ ...heroData, updatedAt: new Date() })
      .where(eq(heroes.id, id))
      .returning();
    return result[0];
  }
  
  async deleteHero(id: string): Promise<boolean> {
    await db.delete(heroes).where(eq(heroes.id, id));
    return true;
  }
  
  // NPC-Operationen
  async getNpcsByHeroId(heroId: string): Promise<Npc[]> {
    return await db.select().from(npcs).where(eq(npcs.heroId, heroId));
  }
  
  async getNpcById(id: string): Promise<Npc | undefined> {
    const result = await db.select().from(npcs).where(eq(npcs.id, id));
    return result[0];
  }
  
  async createNpc(npcData: InsertNpc): Promise<Npc> {
    const result = await db.insert(npcs).values(npcData).returning();
    return result[0];
  }
  
  async updateNpc(id: string, npcData: Partial<Npc>): Promise<Npc | undefined> {
    const result = await db
      .update(npcs)
      .set({ ...npcData, updatedAt: new Date() })
      .where(eq(npcs.id, id))
      .returning();
    return result[0];
  }
  
  async deleteNpc(id: string): Promise<boolean> {
    await db.delete(npcs).where(eq(npcs.id, id));
    return true;
  }
  
  // Sitzungs-Operationen
  async getSessionsByHeroId(heroId: string): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.heroId, heroId));
  }
  
  async getSessionById(id: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id));
    return result[0];
  }
  
  async createSession(sessionData: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(sessionData).returning();
    return result[0];
  }
  
  async updateSession(id: string, sessionData: Partial<Session>): Promise<Session | undefined> {
    const result = await db
      .update(sessions)
      .set({ ...sessionData, updatedAt: new Date() })
      .where(eq(sessions.id, id))
      .returning();
    return result[0];
  }
  
  async deleteSession(id: string): Promise<boolean> {
    await db.delete(sessions).where(eq(sessions.id, id));
    return true;
  }
  
  // Auftrags-Operationen
  async getQuestsByHeroId(heroId: string): Promise<Quest[]> {
    return await db.select().from(quests).where(eq(quests.heroId, heroId));
  }
  
  async getActiveQuestsByHeroId(heroId: string): Promise<Quest[]> {
    return await db
      .select()
      .from(quests)
      .where(and(eq(quests.heroId, heroId), eq(quests.completed, false)));
  }
  
  async getQuestById(id: string): Promise<Quest | undefined> {
    const result = await db.select().from(quests).where(eq(quests.id, id));
    return result[0];
  }
  
  async createQuest(questData: InsertQuest): Promise<Quest> {
    const result = await db.insert(quests).values(questData).returning();
    return result[0];
  }
  
  async updateQuest(id: string, questData: Partial<Quest>): Promise<Quest | undefined> {
    const result = await db
      .update(quests)
      .set({ ...questData, updatedAt: new Date() })
      .where(eq(quests.id, id))
      .returning();
    return result[0];
  }
  
  async deleteQuest(id: string): Promise<boolean> {
    await db.delete(quests).where(eq(quests.id, id));
    return true;
  }
  
  // Aktivitäts-Operationen
  async getActivitiesByUserId(userId: number, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.date)
      .limit(limit);
  }
  
  async addActivity(activityData: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activityData).returning();
    return result[0];
  }
}

// Für Entwicklungszwecke behalten wir die MemStorage-Klasse bei
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: expressSession.Store;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Speicher-Session-Store für Entwicklungszwecke
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 Stunden (prüft, ob die Sitzungen abgelaufen sind)
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => (user as any).email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now,
      email: (insertUser as any).email || 'test@example.com' // Fallback für Abwärtskompatibilität
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...userData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Diese Methoden werden vorübergehend eingerichtet, bis die lokale Speicherung 
  // vollständig durch die Datenbankimplementierung ersetzt wird
  async getHeroesByUserId(_userId: number): Promise<Hero[]> {
    return [];
  }
  
  async getHeroById(_id: string): Promise<Hero | undefined> {
    return undefined;
  }
  
  async createHero(hero: InsertHero): Promise<Hero> {
    return hero as any;
  }
  
  async updateHero(_id: string, _heroData: Partial<Hero>): Promise<Hero | undefined> {
    return undefined;
  }
  
  async deleteHero(_id: string): Promise<boolean> {
    return true;
  }
  
  async getNpcsByHeroId(_heroId: string): Promise<Npc[]> {
    return [];
  }
  
  async getNpcById(_id: string): Promise<Npc | undefined> {
    return undefined;
  }
  
  async createNpc(npc: InsertNpc): Promise<Npc> {
    return npc as any;
  }
  
  async updateNpc(_id: string, _npcData: Partial<Npc>): Promise<Npc | undefined> {
    return undefined;
  }
  
  async deleteNpc(_id: string): Promise<boolean> {
    return true;
  }
  
  async getSessionsByHeroId(_heroId: string): Promise<Session[]> {
    return [];
  }
  
  async getSessionById(_id: string): Promise<Session | undefined> {
    return undefined;
  }
  
  async createSession(session: InsertSession): Promise<Session> {
    return session as any;
  }
  
  async updateSession(_id: string, _sessionData: Partial<Session>): Promise<Session | undefined> {
    return undefined;
  }
  
  async deleteSession(_id: string): Promise<boolean> {
    return true;
  }
  
  async getQuestsByHeroId(_heroId: string): Promise<Quest[]> {
    return [];
  }
  
  async getActiveQuestsByHeroId(_heroId: string): Promise<Quest[]> {
    return [];
  }
  
  async getQuestById(_id: string): Promise<Quest | undefined> {
    return undefined;
  }
  
  async createQuest(quest: InsertQuest): Promise<Quest> {
    return quest as any;
  }
  
  async updateQuest(_id: string, _questData: Partial<Quest>): Promise<Quest | undefined> {
    return undefined;
  }
  
  async deleteQuest(_id: string): Promise<boolean> {
    return true;
  }
  
  async getActivitiesByUserId(_userId: number, _limit?: number): Promise<Activity[]> {
    return [];
  }
  
  async addActivity(activity: InsertActivity): Promise<Activity> {
    return activity as any;
  }
}

// Erstelle und exportiere die passende Speicherimplementierung basierend auf der Umgebung
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new DatabaseStorage(); // Wir verwenden jetzt immer die Datenbankimplementierung