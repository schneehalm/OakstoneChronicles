import { Hero, Npc, Session, Quest, Activity } from './types';

// Local Storage Keys
const STORAGE_KEYS = {
  HEROES: 'oakstone-heroes',
  NPCS: 'oakstone-npcs',
  SESSIONS: 'oakstone-sessions',
  QUESTS: 'oakstone-quests',
  ACTIVITIES: 'oakstone-activities'
};

// Export/Import-Typen
export interface ExportedHero {
  hero: Hero;
  npcs: Npc[];
  sessions: Session[];
  quests: Quest[];
}

export interface ExportedHeroCollection {
  version: string;
  heroes: ExportedHero[];
  exportDate: string;
}

// Helper functions
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Heroes
export const getHeroes = (): Hero[] => {
  return getFromStorage<Hero>(STORAGE_KEYS.HEROES);
};

export const getHeroById = (id: string): Hero | undefined => {
  const heroes = getHeroes();
  return heroes.find(hero => hero.id === id);
};

export const saveHero = (hero: Hero): Hero => {
  const heroes = getHeroes();
  const existingIndex = heroes.findIndex(h => h.id === hero.id);
  let savedHero: Hero;
  
  if (existingIndex >= 0) {
    // Update existing hero
    savedHero = {
      ...heroes[existingIndex],
      ...hero,
      updatedAt: new Date().toISOString()
    };
    heroes[existingIndex] = savedHero;
  } else {
    // Add new hero
    const newId = crypto.randomUUID();
    savedHero = {
      ...hero,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    heroes.push(savedHero);
  }
  
  saveToStorage(STORAGE_KEYS.HEROES, heroes);
  
  // Add activity
  const isNew = existingIndex < 0;
  addActivity({
    heroId: savedHero.id, // Verwende die ID aus dem gespeicherten Helden
    type: isNew ? 'hero_created' : 'hero_updated',
    message: isNew ? `Neuer Held: ${hero.name}` : `Held aktualisiert: ${hero.name}`,
    date: new Date().toISOString()
  });
  
  return savedHero; // Gebe den gespeicherten Helden mit der korrekten ID zurück
};

export const deleteHero = (id: string): void => {
  const heroes = getHeroes();
  const hero = heroes.find(h => h.id === id);
  const filteredHeroes = heroes.filter(hero => hero.id !== id);
  saveToStorage(STORAGE_KEYS.HEROES, filteredHeroes);
  
  if (hero) {
    // Also delete related data
    const npcs = getNpcs().filter(npc => npc.heroId !== id);
    const sessions = getSessions().filter(session => session.heroId !== id);
    const quests = getQuests().filter(quest => quest.heroId !== id);
    
    saveToStorage(STORAGE_KEYS.NPCS, npcs);
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    saveToStorage(STORAGE_KEYS.QUESTS, quests);
    
    // Add activity
    addActivity({
      heroId: id,
      type: 'hero_deleted',
      message: `Held gelöscht: ${hero.name}`,
      date: new Date().toISOString()
    });
  }
};

// NPCs
export const getNpcs = (): Npc[] => {
  return getFromStorage<Npc>(STORAGE_KEYS.NPCS);
};

export const getNpcsByHeroId = (heroId: string): Npc[] => {
  const npcs = getNpcs();
  return npcs.filter(npc => npc.heroId === heroId);
};

export const getNpcsBySessionId = (sessionId: string): Npc[] => {
  const npcs = getNpcs();
  return npcs.filter(npc => npc.firstSessionId === sessionId);
};

export const getNpcById = (id: string): Npc | undefined => {
  const npcs = getNpcs();
  return npcs.find(npc => npc.id === id);
};

export const saveNpc = (npc: Npc): Npc => {
  const npcs = getNpcs();
  const existingIndex = npcs.findIndex(n => n.id === npc.id);
  let savedNpc: Npc;
  
  if (existingIndex >= 0) {
    // Update existing NPC
    savedNpc = {
      ...npcs[existingIndex],
      ...npc,
      updatedAt: new Date().toISOString()
    };
    npcs[existingIndex] = savedNpc;
  } else {
    // Add new NPC
    const newId = crypto.randomUUID();
    savedNpc = {
      ...npc,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    npcs.push(savedNpc);
  }
  
  saveToStorage(STORAGE_KEYS.NPCS, npcs);
  
  // Add activity
  const hero = getHeroById(npc.heroId);
  const isNew = existingIndex < 0;
  
  if (hero) {
    addActivity({
      heroId: npc.heroId,
      type: isNew ? 'npc_created' : 'npc_updated',
      message: isNew ? `Neuer NPC: ${npc.name}` : `NPC aktualisiert: ${npc.name}`,
      date: new Date().toISOString()
    });
  }
  
  return savedNpc;
};

export const deleteNpc = (id: string): void => {
  const npcs = getNpcs();
  const npc = npcs.find(n => n.id === id);
  const filteredNpcs = npcs.filter(npc => npc.id !== id);
  saveToStorage(STORAGE_KEYS.NPCS, filteredNpcs);
  
  if (npc) {
    // Add activity
    addActivity({
      heroId: npc.heroId,
      type: 'npc_deleted',
      message: `NPC gelöscht: ${npc.name}`,
      date: new Date().toISOString()
    });
  }
};

// Sessions
export const getSessions = (): Session[] => {
  return getFromStorage<Session>(STORAGE_KEYS.SESSIONS);
};

export const getSessionsByHeroId = (heroId: string): Session[] => {
  const sessions = getSessions();
  return sessions
    .filter(session => session.heroId === heroId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getSessionById = (id: string): Session | undefined => {
  const sessions = getSessions();
  return sessions.find(session => session.id === id);
};

export const getLatestSessionByHeroId = (heroId: string): Session | undefined => {
  const sessions = getSessionsByHeroId(heroId);
  return sessions[0];
};

export const saveSession = (session: Session): Session => {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  let savedSession: Session;
  
  if (existingIndex >= 0) {
    // Update existing session
    savedSession = {
      ...sessions[existingIndex],
      ...session,
      updatedAt: new Date().toISOString()
    };
    sessions[existingIndex] = savedSession;
  } else {
    // Add new session
    const newId = crypto.randomUUID();
    savedSession = {
      ...session,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    sessions.push(savedSession);
  }
  
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
  
  // Add activity
  const hero = getHeroById(session.heroId);
  const isNew = existingIndex < 0;
  
  if (hero) {
    addActivity({
      heroId: session.heroId,
      type: isNew ? 'session_created' : 'session_updated',
      message: isNew ? `Neue Session: ${session.title}` : `Session aktualisiert: ${session.title}`,
      date: new Date().toISOString()
    });
  }
  
  return savedSession;
};

export const deleteSession = (id: string): void => {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === id);
  const filteredSessions = sessions.filter(session => session.id !== id);
  saveToStorage(STORAGE_KEYS.SESSIONS, filteredSessions);
  
  if (session) {
    // Add activity
    addActivity({
      heroId: session.heroId,
      type: 'session_deleted',
      message: `Session gelöscht: ${session.title}`,
      date: new Date().toISOString()
    });
  }
};

// Quests
export const getQuests = (): Quest[] => {
  return getFromStorage<Quest>(STORAGE_KEYS.QUESTS);
};

export const getQuestsByHeroId = (heroId: string): Quest[] => {
  const quests = getQuests();
  return quests.filter(quest => quest.heroId === heroId);
};

export const getActiveQuestsByHeroId = (heroId: string): Quest[] => {
  return getQuestsByHeroId(heroId).filter(quest => !quest.completed);
};

export const getQuestById = (id: string): Quest | undefined => {
  const quests = getQuests();
  return quests.find(quest => quest.id === id);
};

export const saveQuest = (quest: Quest): Quest => {
  const quests = getQuests();
  const existingIndex = quests.findIndex(q => q.id === quest.id);
  let savedQuest: Quest;
  
  if (existingIndex >= 0) {
    // Update existing quest
    savedQuest = {
      ...quests[existingIndex],
      ...quest,
      updatedAt: new Date().toISOString()
    };
    quests[existingIndex] = savedQuest;
  } else {
    // Add new quest
    const newId = crypto.randomUUID();
    savedQuest = {
      ...quest,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    quests.push(savedQuest);
  }
  
  saveToStorage(STORAGE_KEYS.QUESTS, quests);
  
  // Add activity
  const hero = getHeroById(quest.heroId);
  const isNew = existingIndex < 0;
  
  if (hero) {
    addActivity({
      heroId: quest.heroId,
      type: isNew ? 'quest_created' : 'quest_updated',
      message: isNew ? `Neuer Auftrag: ${quest.title}` : `Auftrag aktualisiert: ${quest.title}`,
      date: new Date().toISOString()
    });
  }
  
  return savedQuest;
};

export const deleteQuest = (id: string): void => {
  const quests = getQuests();
  const quest = quests.find(q => q.id === id);
  const filteredQuests = quests.filter(quest => quest.id !== id);
  saveToStorage(STORAGE_KEYS.QUESTS, filteredQuests);
  
  if (quest) {
    // Add activity
    addActivity({
      heroId: quest.heroId,
      type: 'quest_deleted',
      message: `Auftrag gelöscht: ${quest.title}`,
      date: new Date().toISOString()
    });
  }
};

// Activities
export const getActivities = (): Activity[] => {
  return getFromStorage<Activity>(STORAGE_KEYS.ACTIVITIES);
};

export const addActivity = (activity: Omit<Activity, 'id'>): Activity => {
  const activities = getActivities();
  const newActivity = {
    ...activity,
    id: crypto.randomUUID()
  };
  
  // Add new activity to the beginning of the array
  activities.unshift(newActivity);
  
  // Keep only the latest 50 activities
  const trimmedActivities = activities.slice(0, 50);
  
  saveToStorage(STORAGE_KEYS.ACTIVITIES, trimmedActivities);
  
  return newActivity;
};

export const getRecentActivities = (limit: number = 10): Activity[] => {
  const activities = getActivities();
  return activities.slice(0, limit);
};

// Export/Import Funktionen
export const exportHeroData = (heroId: string): ExportedHero | null => {
  const hero = getHeroById(heroId);
  if (!hero) return null;
  
  const npcs = getNpcsByHeroId(heroId);
  const sessions = getSessionsByHeroId(heroId);
  const quests = getQuestsByHeroId(heroId);
  
  return {
    hero,
    npcs,
    sessions,
    quests
  };
};

export const exportAllHeroes = (): ExportedHeroCollection => {
  const heroes = getHeroes();
  const exportedHeroes: ExportedHero[] = [];
  
  for (const hero of heroes) {
    const exportedHero = exportHeroData(hero.id);
    if (exportedHero) {
      exportedHeroes.push(exportedHero);
    }
  }
  
  return {
    version: '1.0',
    heroes: exportedHeroes,
    exportDate: new Date().toISOString()
  };
};

export const importHeroData = (data: ExportedHero, replaceIfExists: boolean = false): boolean => {
  try {
    // Prüfe, ob ein Held mit der selben ID bereits existiert
    const existingHero = getHeroById(data.hero.id);
    
    if (existingHero && !replaceIfExists) {
      return false; // Abbrechen, wenn der Held existiert und nicht ersetzt werden soll
    }
    
    // Held speichern (oder ersetzen)
    saveHero(data.hero);
    
    // Zugehörige NPCs speichern
    for (const npc of data.npcs) {
      saveNpc(npc);
    }
    
    // Zugehörige Sessions speichern
    for (const session of data.sessions) {
      saveSession(session);
    }
    
    // Zugehörige Quests speichern
    for (const quest of data.quests) {
      saveQuest(quest);
    }
    
    // Aktivität hinzufügen
    addActivity({
      heroId: data.hero.id,
      type: existingHero ? 'hero_updated' : 'hero_created',
      message: existingHero ? `Held importiert: ${data.hero.name}` : `Neuer Held importiert: ${data.hero.name}`,
      date: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Fehler beim Importieren der Heldendaten:', error);
    return false;
  }
};

export const importHeroCollection = (data: ExportedHeroCollection, replaceExisting: boolean = false): { success: boolean; imported: number; total: number } => {
  try {
    let importedCount = 0;
    const totalHeroes = data.heroes.length;
    
    // Prüfe, ob die Datenversion kompatibel ist
    if (data.version !== '1.0') {
      console.warn(`Warnung: Import einer unbekannten Version (${data.version}). Es könnte zu Kompatibilitätsproblemen kommen.`);
    }
    
    // Importiere jeden Helden
    for (const heroData of data.heroes) {
      const success = importHeroData(heroData, replaceExisting);
      if (success) {
        importedCount++;
      }
    }
    
    return {
      success: importedCount > 0,
      imported: importedCount,
      total: totalHeroes
    };
  } catch (error) {
    console.error('Fehler beim Importieren der Helden-Sammlung:', error);
    return {
      success: false,
      imported: 0,
      total: data.heroes.length
    };
  }
};
