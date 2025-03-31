import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import expressSession from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session-Einstellungen
  const sessionSettings: expressSession.SessionOptions = {
    secret: process.env.SESSION_SECRET || randomUUID(),
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
    }
  };

  app.set("trust proxy", 1);
  app.use(expressSession(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Middleware zur automatischen Abmeldung ungültiger Benutzer
  app.use((req, res, next) => {
    if (req.isAuthenticated() && !req.user) {
      console.log("Ungültiger Benutzer erkannt, Session wird beendet");
      req.logout((err) => {
        if (err) {
          console.error("Fehler beim Beenden der Session:", err);
        }
      });
    }
    next();
  });

  // Lokale Strategie für die Benutzerauthentifizierung
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Serialisierung/Deserialisierung für Sessions
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // Wenn der Benutzer in der Datenbank nicht gefunden wird, Session löschen
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registrierung
  app.post("/api/register", async (req, res, next) => {
    try {
      // Prüfen ob Username oder Email bereits existieren
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Benutzername existiert bereits" });
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: "E-Mail existiert bereits" });
      }

      // Benutzer erstellen
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Aktivitätseintrag erstellen
      await storage.addActivity({
        userId: user.id,
        type: "user_registered",
        message: `Benutzer ${user.username} hat sich registriert.`,
      });

      // Automatisches Login nach Registrierung
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Wir senden nicht das Passwort-Hash zurück
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: any) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ 
          error: "Ungültiger Benutzername oder Passwort" 
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Aktivitätseintrag erstellen
        storage.addActivity({
          userId: user.id,
          type: "user_login",
          message: `Benutzer ${user.username} hat sich angemeldet.`,
        })
        .catch(console.error);
        
        // Wir senden nicht das Passwort-Hash zurück
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/logout", (req, res, next) => {
    const user = req.user;
    req.logout((err) => {
      if (err) return next(err);
      
      if (user) {
        // Aktivitätseintrag erstellen
        storage.addActivity({
          userId: user.id,
          type: "user_logout",
          message: `Benutzer ${user.username} hat sich abgemeldet.`,
        })
        .catch(console.error);
      }
      
      res.sendStatus(200);
    });
  });

  // Benutzerinformationen abrufen
  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Nicht authentifiziert" });
    }
    
    // Überprüfen, ob der Benutzer noch in der Datenbank existiert
    const userId = (req.user as SelectUser).id;
    const freshUser = await storage.getUser(userId);
    
    if (!freshUser) {
      // Benutzer nicht mehr in der Datenbank vorhanden, Session beenden
      req.logout((err) => {
        if (err) {
          console.error("Fehler beim Beenden der Session:", err);
        }
      });
      return res.status(401).json({ error: "Benutzer existiert nicht mehr" });
    }
    
    // Wir senden nicht das Passwort-Hash zurück
    const { password, ...userWithoutPassword } = freshUser;
    res.json(userWithoutPassword);
  });
  
  // Profil aktualisieren
  app.patch("/api/user", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Nicht authentifiziert" });
    }
    
    try {
      const userId = (req.user as SelectUser).id;
      
      // Überprüfen, ob der Benutzer noch in der Datenbank existiert
      const freshUser = await storage.getUser(userId);
      if (!freshUser) {
        // Benutzer nicht mehr in der Datenbank vorhanden, Session beenden
        req.logout((err) => {
          if (err) {
            console.error("Fehler beim Beenden der Session:", err);
          }
        });
        return res.status(401).json({ error: "Benutzer existiert nicht mehr" });
      }
      
      // Validierung der Aktualisierungsdaten
      const { email, password, ...otherData } = req.body;
      const updateData: any = { ...otherData };
      
      // E-Mail-Änderung
      if (email && email !== freshUser.email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).json({ error: "E-Mail existiert bereits" });
        }
        updateData.email = email;
      }
      
      // Passwort-Änderung
      if (password) {
        updateData.password = await hashPassword(password);
      }
      
      // Aktualisieren des Benutzers
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Benutzer nicht gefunden" });
      }
      
      // Aktivitätseintrag erstellen
      await storage.addActivity({
        userId: userId,
        type: "user_updated",
        message: `Benutzer ${updatedUser.username} hat sein Profil aktualisiert.`,
      });
      
      // Wir senden nicht das Passwort-Hash zurück
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
}

// Middleware: Authentifizierung erforderlich
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Nicht authentifiziert" });
  }
  next();
}

// Middleware: Überprüfung des Benutzer-Besitzes einer Ressource
export function checkOwnership(resourceField: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Nicht authentifiziert" });
    }
    
    const userId = (req.user as Express.User).id;
    
    // Überprüfen, ob der Benutzer noch in der Datenbank existiert
    const freshUser = await storage.getUser(userId);
    if (!freshUser) {
      // Benutzer nicht mehr in der Datenbank vorhanden, Session beenden
      req.logout((err) => {
        if (err) {
          console.error("Fehler beim Beenden der Session:", err);
        }
      });
      return res.status(401).json({ error: "Benutzer existiert nicht mehr" });
    }
    
    const resourceId = req.params[resourceField];
    
    // Implementierung der Besitzprüfung je nach Ressourcentyp
    // Zum Beispiel für Helden
    if (resourceField === 'heroId') {
      const hero = await storage.getHeroById(resourceId);
      if (!hero) {
        return res.status(404).json({ error: "Ressource nicht gefunden" });
      }
      
      if (hero.userId !== userId) {
        return res.status(403).json({ error: "Keine Berechtigung für diese Aktion" });
      }
    }
    
    next();
  };
}