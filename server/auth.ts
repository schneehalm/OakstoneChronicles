import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { storage } from './storage_fix';
import { User, InsertUser } from '@shared/schema';

// TypeScript-Deklaration für Express-Session mit Benutzerdaten
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User {
      id: number;
      username: string;
      password?: string;
    }
  }
}

// Konfiguriere die Local Strategy für Passport
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Versuche, den Benutzer anhand des Benutzernamens zu finden
      const user = await storage.getUserByUsername(username);
      
      // Wenn der Benutzer nicht gefunden wurde, gib einen Fehler zurück
      if (!user) {
        return done(null, false, { message: 'Benutzername oder Passwort ungültig' });
      }
      
      // Überprüfe das Passwort
      const isValidPassword = await storage.validatePassword(password, user.password);
      
      // Wenn das Passwort ungültig ist, gib einen Fehler zurück
      if (!isValidPassword) {
        return done(null, false, { message: 'Benutzername oder Passwort ungültig' });
      }
      
      // Wenn alles in Ordnung ist, gib den Benutzer zurück
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Serialisiere den Benutzer für die Session
passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

// Deserialisiere den Benutzer aus der Session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Setup Auth-Funktionen für Express
export function setupAuth(app: Express) {
  // Session-Secret
  const SESSION_SECRET = process.env.SESSION_SECRET || 'oakstone-chronicles-secret';
  
  // Cookie-Parser einrichten
  app.use(cookieParser(SESSION_SECRET));
  
  // Session-Einstellungen
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // ⬅️ WICHTIG für Cookies über HTTPS + Cross-Origin
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 Woche
      },
    })
  );
  
  // Passport initialisieren
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Auth-Routen
  
  // Registrierung
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Prüfen, ob Benutzer bereits existiert
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Benutzername existiert bereits' });
      }
      
      // Neuen Benutzer erstellen
      const user = await storage.createUser({ username, password } as InsertUser);
      
      // Passwort aus der Antwort entfernen
      const userResponse = { ...user } as any;
      if (userResponse.password) {
        userResponse.password = undefined;
      }
      
      // Benutzer anmelden
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Fehler bei der Anmeldung' });
        }
        return res.status(201).json(userResponse);
      });
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      res.status(500).json({ message: 'Interner Serverfehler' });
    }
  });
  
  // Login
  app.post('/api/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Anmeldung fehlgeschlagen' });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        // Passwort aus der Antwort entfernen
        const userResponse = { ...user } as any;
        if (userResponse.password) {
          userResponse.password = undefined;
        }
        return res.json(userResponse);
      });
    })(req, res, next);
  });
  
  // Logout
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Fehler beim Abmelden' });
      }
      res.json({ message: 'Erfolgreich abgemeldet' });
    });
  });
  
  // Aktuelle Benutzerdaten abrufen
  app.get('/api/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Nicht authentifiziert' });
    }
    
    // Passwort aus der Antwort entfernen
    const userResponse = { ...req.user } as any;
    if (userResponse.password) {
      userResponse.password = undefined;
    }
    
    res.json(userResponse);
  });
}
