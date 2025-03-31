import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentifizierung einrichten
  setupAuth(app);

  // Weitere Anwendungsrouten hier einfügen
  // Alle Routen mit /api als Präfix verwenden

  const httpServer = createServer(app);

  return httpServer;
}
