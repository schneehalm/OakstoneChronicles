import { Hero, Npc, Session, Quest, Activity } from './types';
import { apiRequest, queryClient } from './queryClient';

// Hero API

export const fetchHeroes = async (): Promise<Hero[]> => {
  const response = await apiRequest('GET', '/api/heroes');
  return await response.json();
};

export const fetchHeroById = async (id: string): Promise<Hero> => {
  const response = await apiRequest('GET', `/api/heroes/${id}`);
  return await response.json();
};

export const createHero = async (hero: Omit<Hero, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Hero> => {
  const response = await apiRequest('POST', '/api/heroes', hero);
  // Nach erfolgreichem Erstellen die Heldenliste ungültig machen, um ein Neuladen zu erzwingen
  queryClient.invalidateQueries({ queryKey: ['/api/heroes'] });
  return await response.json();
};

export const updateHero = async (id: string, hero: Partial<Hero>): Promise<Hero> => {
  const response = await apiRequest('PUT', `/api/heroes/${id}`, hero);
  // Ungültig machen sowohl der Liste als auch des spezifischen Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes'] });
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', id] });
  return await response.json();
};

export const deleteHero = async (id: string): Promise<void> => {
  await apiRequest('DELETE', `/api/heroes/${id}`);
  // Ungültig machen der Heldenliste
  queryClient.invalidateQueries({ queryKey: ['/api/heroes'] });
};

// NPC API

export const fetchNpcsByHeroId = async (heroId: string): Promise<Npc[]> => {
  const response = await apiRequest('GET', `/api/heroes/${heroId}/npcs`);
  return await response.json();
};

export const fetchNpcById = async (id: string): Promise<Npc> => {
  const response = await apiRequest('GET', `/api/npcs/${id}`);
  return await response.json();
};

export const createNpc = async (heroId: string, npc: Omit<Npc, 'id' | 'heroId' | 'createdAt' | 'updatedAt'>): Promise<Npc> => {
  const response = await apiRequest('POST', `/api/heroes/${heroId}/npcs`, { ...npc, heroId });
  // Ungültig machen der NPC-Liste für diesen Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'npcs'] });
  return await response.json();
};

export const updateNpc = async (id: string, npc: Partial<Npc>): Promise<Npc> => {
  const response = await apiRequest('PUT', `/api/npcs/${id}`, npc);
  const updatedNpc = await response.json();
  // Ungültig machen der NPC-Liste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', updatedNpc.heroId, 'npcs'] });
  return updatedNpc;
};

export const deleteNpc = async (id: string, heroId: string): Promise<void> => {
  await apiRequest('DELETE', `/api/npcs/${id}`);
  // Ungültig machen der NPC-Liste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'npcs'] });
};

// Session API

export const fetchSessionsByHeroId = async (heroId: string): Promise<Session[]> => {
  const response = await apiRequest('GET', `/api/heroes/${heroId}/sessions`);
  return await response.json();
};

export const fetchSessionById = async (id: string): Promise<Session> => {
  const response = await apiRequest('GET', `/api/sessions/${id}`);
  return await response.json();
};

export const createSession = async (heroId: string, session: Omit<Session, 'id' | 'heroId' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
  const response = await apiRequest('POST', `/api/heroes/${heroId}/sessions`, { ...session, heroId });
  // Ungültig machen der Sitzungsliste für diesen Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'sessions'] });
  return await response.json();
};

export const updateSession = async (id: string, session: Partial<Session>): Promise<Session> => {
  const response = await apiRequest('PUT', `/api/sessions/${id}`, session);
  const updatedSession = await response.json();
  // Ungültig machen der Sitzungsliste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', updatedSession.heroId, 'sessions'] });
  return updatedSession;
};

export const deleteSession = async (id: string, heroId: string): Promise<void> => {
  await apiRequest('DELETE', `/api/sessions/${id}`);
  // Ungültig machen der Sitzungsliste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'sessions'] });
};

// Quest API

export const fetchQuestsByHeroId = async (heroId: string): Promise<Quest[]> => {
  const response = await apiRequest('GET', `/api/heroes/${heroId}/quests`);
  return await response.json();
};

export const fetchQuestById = async (id: string): Promise<Quest> => {
  const response = await apiRequest('GET', `/api/quests/${id}`);
  return await response.json();
};

export const createQuest = async (heroId: string, quest: Omit<Quest, 'id' | 'heroId' | 'createdAt' | 'updatedAt'>): Promise<Quest> => {
  const response = await apiRequest('POST', `/api/heroes/${heroId}/quests`, { ...quest, heroId });
  // Ungültig machen der Quest-Liste für diesen Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'quests'] });
  return await response.json();
};

export const updateQuest = async (id: string, quest: Partial<Quest>): Promise<Quest> => {
  const response = await apiRequest('PUT', `/api/quests/${id}`, quest);
  const updatedQuest = await response.json();
  // Ungültig machen der Quest-Liste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', updatedQuest.heroId, 'quests'] });
  return updatedQuest;
};

export const deleteQuest = async (id: string, heroId: string): Promise<void> => {
  await apiRequest('DELETE', `/api/quests/${id}`);
  // Ungültig machen der Quest-Liste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'quests'] });
};

// Activity API

export const fetchActivitiesByHeroId = async (heroId: string, limit?: number): Promise<Activity[]> => {
  const url = limit 
    ? `/api/heroes/${heroId}/activities?limit=${limit}`
    : `/api/heroes/${heroId}/activities`;
  const response = await apiRequest('GET', url);
  return await response.json();
};

// Export/Import Funktionen

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

export const exportHeroData = async (heroId: string): Promise<ExportedHero | null> => {
  try {
    const hero = await fetchHeroById(heroId);
    const npcs = await fetchNpcsByHeroId(heroId);
    const sessions = await fetchSessionsByHeroId(heroId);
    const quests = await fetchQuestsByHeroId(heroId);
    
    return {
      hero,
      npcs,
      sessions,
      quests
    };
  } catch (error) {
    console.error("Fehler beim Exportieren der Heldendaten:", error);
    return null;
  }
};

export const exportAllHeroes = async (): Promise<ExportedHeroCollection> => {
  try {
    const heroes = await fetchHeroes();
    const exportedHeroes: ExportedHero[] = [];
    
    for (const hero of heroes) {
      const exportedHero = await exportHeroData(hero.id.toString());
      if (exportedHero) {
        exportedHeroes.push(exportedHero);
      }
    }
    
    return {
      version: '1.0',
      heroes: exportedHeroes,
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error("Fehler beim Exportieren aller Helden:", error);
    return {
      version: '1.0',
      heroes: [],
      exportDate: new Date().toISOString()
    };
  }
};

// Import-Funktionen
export const importHeroData = async (data: ExportedHero, replaceIfExists: boolean = false): Promise<boolean> => {
  try {
    const response = await apiRequest('POST', '/api/import/hero', {
      ...data,
      replaceIfExists
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Fehler beim Importieren der Heldendaten:", error);
    return false;
  }
};

export const importHeroCollection = async (data: ExportedHeroCollection, replaceExisting: boolean = false): Promise<{ success: boolean; imported: number; total: number }> => {
  try {
    const response = await apiRequest('POST', '/api/import/all', {
      heroes: data.heroes,
      replaceExisting
    });
    
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Importieren der Helden-Sammlung:", error);
    return { success: false, imported: 0, total: data.heroes.length };
  }
};