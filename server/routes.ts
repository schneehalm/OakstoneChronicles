import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from './auth';
import { randomUUID } from 'crypto';

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentifizierung einrichten
  setupAuth(app);

  // API-Routen für Helden, die Authentifizierung erfordern
  app.get('/api/heroes', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Nicht authentifiziert" });
    }
    
    try {
      const userId = (req.user as Express.User).id;
      const heroes = await storage.getHeroesByUserId(userId);
      res.json(heroes);
    } catch (error) {
      console.error('Fehler beim Abrufen der Helden:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  });

  app.post('/api/heroes', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Nicht authentifiziert" });
    }
    
    try {
      const userId = (req.user as Express.User).id;
      
      // Neuen Helden erstellen mit UUID
      const heroData = {
        ...req.body,
        id: randomUUID(),
        userId: userId,
        stats: JSON.stringify(req.body.stats || {})
      };
      
      const hero = await storage.createHero(heroData);
      
      // Aktivität aufzeichnen
      await storage.addActivity({
        userId,
        heroId: hero.id,
        type: 'hero_created',
        message: `Held "${hero.name}" wurde erstellt.`
      });
      
      res.status(201).json(hero);
    } catch (error) {
      console.error('Fehler beim Erstellen des Helden:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  });

  // Weitere API-Routen für Helden, NPCs, Sessions, und Quests würden hier folgen

  const httpServer = createServer(app);
  return httpServer;
}
