import { users, type User, type InsertUser } from "@shared/schema";
import bcrypt from "bcryptjs";

// modify the interface with any CRUD methods
// you might need

import session from 'express-session';
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
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

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await this.hashPassword(insertUser.password);
    
    const id = this.currentId++;
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
}

export const storage = new MemStorage();
