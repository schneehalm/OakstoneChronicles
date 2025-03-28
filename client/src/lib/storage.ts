import { Hero, Npc, Session, Quest, Activity } from './types';

// Local Storage Keys
const STORAGE_KEYS = {
  HEROES: 'oakstone-heroes',
  NPCS: 'oakstone-npcs',
  SESSIONS: 'oakstone-sessions',
  QUESTS: 'oakstone-quests',
  ACTIVITIES: 'oakstone-activities'
};

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
  
  if (existingIndex >= 0) {
    // Update existing hero
    heroes[existingIndex] = {
      ...heroes[existingIndex],
      ...hero,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new hero
    heroes.push({
      ...hero,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  saveToStorage(STORAGE_KEYS.HEROES, heroes);
  
  // Add activity
  const isNew = existingIndex < 0;
  addActivity({
    heroId: hero.id,
    type: isNew ? 'hero_created' : 'hero_updated',
    message: isNew ? `Neuer Held: ${hero.name}` : `Held aktualisiert: ${hero.name}`,
    date: new Date().toISOString()
  });
  
  return hero;
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

export const getNpcById = (id: string): Npc | undefined => {
  const npcs = getNpcs();
  return npcs.find(npc => npc.id === id);
};

export const saveNpc = (npc: Npc): Npc => {
  const npcs = getNpcs();
  const existingIndex = npcs.findIndex(n => n.id === npc.id);
  
  if (existingIndex >= 0) {
    // Update existing NPC
    npcs[existingIndex] = {
      ...npcs[existingIndex],
      ...npc,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new NPC
    npcs.push({
      ...npc,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
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
  
  return npc;
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
  
  if (existingIndex >= 0) {
    // Update existing session
    sessions[existingIndex] = {
      ...sessions[existingIndex],
      ...session,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new session
    sessions.push({
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
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
  
  return session;
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
  
  if (existingIndex >= 0) {
    // Update existing quest
    quests[existingIndex] = {
      ...quests[existingIndex],
      ...quest,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new quest
    quests.push({
      ...quest,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
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
  
  return quest;
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
