import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertHeroSchema, insertNpcSchema, insertSessionSchema, insertQuestSchema } from "@shared/schema";
import { z } from "zod";

// Middleware zur Überprüfung der Authentifizierung
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Nicht authentifiziert" });
  }
  next();
};

// Middleware zur Überprüfung, ob der Benutzer Zugriff auf einen Helden hat
const canAccessHero = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Nicht authentifiziert" });
  }

  const heroId = parseInt(req.params.id);
  if (isNaN(heroId)) {
    return res.status(400).json({ message: "Ungültige Helden-ID" });
  }

  const hero = await storage.getHeroById(heroId);
  if (!hero) {
    return res.status(404).json({ message: "Held nicht gefunden" });
  }

  if (hero.userId !== req.user!.id) {
    return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieses Helden." });
  }

  // Speichere den Helden in der Request, um ihn in den Routenhandlern verfügbar zu machen
  (req as any).hero = hero;
  next();
};

// Helper zur Validierung und Fehlerbehandlung mit Zod
const validateBody = (schema: z.ZodType<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validierungsfehler", 
          errors: error.errors 
        });
      }
      next(error);
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentifizierung einrichten
  setupAuth(app);

  // Helden-Routen
  app.get('/api/heroes', isAuthenticated, async (req, res) => {
    const heroes = await storage.getHeroesByUserId(req.user!.id);
    res.json(heroes);
  });

  app.post('/api/heroes', isAuthenticated, validateBody(insertHeroSchema), async (req, res) => {
    // Stellen Sie sicher, dass der Benutzer nur Helden für sich selbst erstellen kann
    const heroData = { ...req.body, userId: req.user!.id };
    const hero = await storage.createHero(heroData);
    
    // Aktivität aufzeichnen
    await storage.createActivity({
      heroId: hero.id, 
      type: 'hero_created', 
      message: `Held "${hero.name}" erstellt`,
      date: new Date().toISOString()
    });
    
    res.status(201).json(hero);
  });

  app.get('/api/heroes/:id', isAuthenticated, canAccessHero, (req, res) => {
    // Wir können hier (req as any).hero verwenden, da canAccessHero dies bereits gesetzt hat
    res.json((req as any).hero);
  });

  app.put('/api/heroes/:id', isAuthenticated, canAccessHero, async (req, res) => {
    const heroId = parseInt(req.params.id);
    const updatedHero = await storage.updateHero(heroId, req.body);
    
    if (updatedHero) {
      // Aktivität aufzeichnen
      await storage.createActivity({
        heroId: updatedHero.id, 
        type: 'hero_updated', 
        message: `Held "${updatedHero.name}" aktualisiert`,
        date: new Date().toISOString()
      });
      
      res.json(updatedHero);
    } else {
      res.status(404).json({ message: "Held nicht gefunden" });
    }
  });

  app.delete('/api/heroes/:id', isAuthenticated, canAccessHero, async (req, res) => {
    const heroId = parseInt(req.params.id);
    const heroName = (req as any).hero.name;
    const deleted = await storage.deleteHero(heroId);
    
    if (deleted) {
      // Wir müssen hier keine Aktivität aufzeichnen, da der Held gelöscht wurde
      
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Held nicht gefunden" });
    }
  });

  // NPC-Routen
  app.get('/api/heroes/:id/npcs', isAuthenticated, canAccessHero, async (req, res) => {
    const heroId = parseInt(req.params.id);
    const npcs = await storage.getNpcsByHeroId(heroId);
    res.json(npcs);
  });

  app.post('/api/heroes/:id/npcs', isAuthenticated, canAccessHero, validateBody(insertNpcSchema), async (req, res) => {
    const heroId = parseInt(req.params.id);
    // Stelle sicher, dass die heroId im Body mit der in der URL übereinstimmt
    const npcData = { ...req.body, heroId };
    const npc = await storage.createNpc(npcData);
    
    // Aktivität aufzeichnen
    await storage.createActivity({
      heroId, 
      type: 'npc_created', 
      message: `NPC "${npc.name}" erstellt`,
      date: new Date().toISOString()
    });
    
    res.status(201).json(npc);
  });

  app.get('/api/npcs/:id', isAuthenticated, async (req, res) => {
    const npcId = parseInt(req.params.id);
    const npc = await storage.getNpcById(npcId);
    
    if (!npc) {
      return res.status(404).json({ message: "NPC nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem der NPC gehört
    const hero = await storage.getHeroById(npc.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieses NPCs." });
    }
    
    res.json(npc);
  });

  app.put('/api/npcs/:id', isAuthenticated, async (req, res) => {
    const npcId = parseInt(req.params.id);
    const npc = await storage.getNpcById(npcId);
    
    if (!npc) {
      return res.status(404).json({ message: "NPC nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem der NPC gehört
    const hero = await storage.getHeroById(npc.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieses NPCs." });
    }
    
    const updatedNpc = await storage.updateNpc(npcId, req.body);
    
    if (updatedNpc) {
      // Aktivität aufzeichnen
      await storage.createActivity({
        heroId: npc.heroId, 
        type: 'npc_updated', 
        message: `NPC "${updatedNpc.name}" aktualisiert`,
        date: new Date().toISOString()
      });
      
      res.json(updatedNpc);
    } else {
      res.status(404).json({ message: "NPC nicht gefunden" });
    }
  });

  app.delete('/api/npcs/:id', isAuthenticated, async (req, res) => {
    const npcId = parseInt(req.params.id);
    const npc = await storage.getNpcById(npcId);
    
    if (!npc) {
      return res.status(404).json({ message: "NPC nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem der NPC gehört
    const hero = await storage.getHeroById(npc.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieses NPCs." });
    }
    
    const heroId = npc.heroId;
    const npcName = npc.name;
    const deleted = await storage.deleteNpc(npcId);
    
    if (deleted) {
      // Aktivität aufzeichnen
      await storage.createActivity({
        heroId, 
        type: 'npc_deleted', 
        message: `NPC "${npcName}" gelöscht`,
        date: new Date().toISOString()
      });
      
      res.status(204).send();
    } else {
      res.status(404).json({ message: "NPC nicht gefunden" });
    }
  });

  // Session-Routen
  app.get('/api/heroes/:id/sessions', isAuthenticated, canAccessHero, async (req, res) => {
    const heroId = parseInt(req.params.id);
    const sessions = await storage.getSessionsByHeroId(heroId);
    res.json(sessions);
  });

  app.post('/api/heroes/:id/sessions', isAuthenticated, canAccessHero, validateBody(insertSessionSchema), async (req, res) => {
    const heroId = parseInt(req.params.id);
    // Stelle sicher, dass die heroId im Body mit der in der URL übereinstimmt
    const sessionData = { ...req.body, heroId };
    const session = await storage.createSession(sessionData);
    
    // Aktivität aufzeichnen
    await storage.createActivity({
      heroId, 
      type: 'session_created', 
      message: `Sitzung "${session.title}" erstellt`,
      date: new Date().toISOString()
    });
    
    res.status(201).json(session);
  });

  app.get('/api/sessions/:id', isAuthenticated, async (req, res) => {
    const sessionId = parseInt(req.params.id);
    const session = await storage.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: "Sitzung nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem die Sitzung gehört
    const hero = await storage.getHeroById(session.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieser Sitzung." });
    }
    
    res.json(session);
  });

  app.put('/api/sessions/:id', isAuthenticated, async (req, res) => {
    const sessionId = parseInt(req.params.id);
    const session = await storage.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: "Sitzung nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem die Sitzung gehört
    const hero = await storage.getHeroById(session.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieser Sitzung." });
    }
    
    const updatedSession = await storage.updateSession(sessionId, req.body);
    
    if (updatedSession) {
      // Aktivität aufzeichnen
      await storage.createActivity({
        heroId: session.heroId, 
        type: 'session_updated', 
        message: `Sitzung "${updatedSession.title}" aktualisiert`,
        date: new Date().toISOString()
      });
      
      res.json(updatedSession);
    } else {
      res.status(404).json({ message: "Sitzung nicht gefunden" });
    }
  });

  app.delete('/api/sessions/:id', isAuthenticated, async (req, res) => {
    const sessionId = parseInt(req.params.id);
    const session = await storage.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: "Sitzung nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem die Sitzung gehört
    const hero = await storage.getHeroById(session.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieser Sitzung." });
    }
    
    const heroId = session.heroId;
    const sessionTitle = session.title;
    const deleted = await storage.deleteSession(sessionId);
    
    if (deleted) {
      // Aktivität aufzeichnen
      await storage.createActivity({
        heroId, 
        type: 'session_deleted', 
        message: `Sitzung "${sessionTitle}" gelöscht`,
        date: new Date().toISOString()
      });
      
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Sitzung nicht gefunden" });
    }
  });

  // Quest-Routen
  app.get('/api/heroes/:id/quests', isAuthenticated, canAccessHero, async (req, res) => {
    const heroId = parseInt(req.params.id);
    const quests = await storage.getQuestsByHeroId(heroId);
    res.json(quests);
  });

  app.post('/api/heroes/:id/quests', isAuthenticated, canAccessHero, validateBody(insertQuestSchema), async (req, res) => {
    const heroId = parseInt(req.params.id);
    // Stelle sicher, dass die heroId im Body mit der in der URL übereinstimmt
    const questData = { ...req.body, heroId };
    const quest = await storage.createQuest(questData);
    
    // Aktivität aufzeichnen
    await storage.createActivity({
      heroId, 
      type: 'quest_created', 
      message: `Quest "${quest.title}" erstellt`,
      date: new Date().toISOString()
    });
    
    res.status(201).json(quest);
  });

  app.get('/api/quests/:id', isAuthenticated, async (req, res) => {
    const questId = parseInt(req.params.id);
    const quest = await storage.getQuestById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem die Quest gehört
    const hero = await storage.getHeroById(quest.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieser Quest." });
    }
    
    res.json(quest);
  });

  app.put('/api/quests/:id', isAuthenticated, async (req, res) => {
    const questId = parseInt(req.params.id);
    const quest = await storage.getQuestById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem die Quest gehört
    const hero = await storage.getHeroById(quest.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieser Quest." });
    }
    
    const updatedQuest = await storage.updateQuest(questId, req.body);
    
    if (updatedQuest) {
      // Aktivität aufzeichnen
      await storage.createActivity({
        heroId: quest.heroId, 
        type: 'quest_updated', 
        message: `Quest "${updatedQuest.title}" aktualisiert`,
        date: new Date().toISOString()
      });
      
      res.json(updatedQuest);
    } else {
      res.status(404).json({ message: "Quest nicht gefunden" });
    }
  });

  app.delete('/api/quests/:id', isAuthenticated, async (req, res) => {
    const questId = parseInt(req.params.id);
    const quest = await storage.getQuestById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest nicht gefunden" });
    }
    
    // Überprüfe, ob der Benutzer Zugriff auf den Helden hat, zu dem die Quest gehört
    const hero = await storage.getHeroById(quest.heroId);
    if (!hero || hero.userId !== req.user!.id) {
      return res.status(403).json({ message: "Zugriff verweigert. Sie sind nicht der Besitzer dieser Quest." });
    }
    
    const heroId = quest.heroId;
    const questTitle = quest.title;
    const deleted = await storage.deleteQuest(questId);
    
    if (deleted) {
      // Aktivität aufzeichnen
      await storage.createActivity({
        heroId, 
        type: 'quest_deleted', 
        message: `Quest "${questTitle}" gelöscht`,
        date: new Date().toISOString()
      });
      
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Quest nicht gefunden" });
    }
  });

  // Aktivitäts-Routen
  app.get('/api/heroes/:id/activities', isAuthenticated, canAccessHero, async (req, res) => {
    const heroId = parseInt(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const activities = await storage.getActivitiesByHeroId(heroId, limit);
    res.json(activities);
  });

  const httpServer = createServer(app);

  return httpServer;
}
