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
  // Daten für das Backend-Format vorbereiten
  const formattedHero = {
    ...hero,
    // Konvertiere Array zu String für das Backend
    tags: Array.isArray(hero.tags) ? hero.tags.join(',') : '',
    // Konvertiere Stats-Objekt zu JSON-String für das Backend
    stats: hero.stats ? JSON.stringify(hero.stats) : null
    // Wir entfernen die Timestamps, da diese vom Backend gesetzt werden
  };

  // Entferne eventuell vorhandene Timestamps, um Validierungsfehler zu vermeiden
  delete (formattedHero as any).createdAt;
  delete (formattedHero as any).updatedAt;

  const response = await apiRequest('POST', '/api/heroes', formattedHero);
  const newHero = await response.json();
  
  // Nach erfolgreichem Erstellen die Heldenliste invalidieren mit höherer Priorität
  // und auf die Invalidierung warten, erzwinge Refetch
  await queryClient.invalidateQueries({ 
    queryKey: ['/api/heroes'],
    refetchType: 'all',
    exact: true
  });
  
  // Expliziter Refetch der Heldenliste, um sicherzustellen, dass die neuesten Daten geladen werden
  await queryClient.fetchQuery({ queryKey: ['/api/heroes'] });
  
  return newHero;
};

export const updateHero = async (id: string, hero: Partial<Hero>): Promise<Hero> => {
  // Daten für das Backend-Format vorbereiten
  const formattedHero: any = {
    ...hero
    // Updatedat wird vom Backend gesetzt
  };

  // Konvertiere Tags nur wenn vorhanden
  if (hero.tags !== undefined) {
    formattedHero.tags = Array.isArray(hero.tags) ? hero.tags.join(',') : '';
  }

  // Konvertiere Stats nur wenn vorhanden
  if (hero.stats !== undefined) {
    formattedHero.stats = hero.stats ? JSON.stringify(hero.stats) : null;
  }

  // Entferne eventuell vorhandene Timestamps, um Validierungsfehler zu vermeiden
  delete formattedHero.createdAt;
  delete formattedHero.updatedAt;

  const response = await apiRequest('PUT', `/api/heroes/${id}`, formattedHero);
  const updatedHero = await response.json();
  
  // Ungültig machen sowohl der Liste als auch des spezifischen Helden
  // und auf die Invalidierung warten
  await Promise.all([
    queryClient.invalidateQueries({ 
      queryKey: ['/api/heroes'],
      refetchType: 'active'
    }),
    queryClient.invalidateQueries({ 
      queryKey: ['/api/heroes', id],
      refetchType: 'active'
    })
  ]);
  
  return updatedHero;
};

export const deleteHero = async (id: string): Promise<void> => {
  await apiRequest('DELETE', `/api/heroes/${id}`);
  // Ungültig machen der Heldenliste mit höherer Priorität und auf die Invalidierung warten
  await queryClient.invalidateQueries({ 
    queryKey: ['/api/heroes'],
    refetchType: 'active'
  });
};

// NPC API

export const fetchNpcsByHeroId = async (heroId: number): Promise<Npc[]> => {
  const response = await apiRequest('GET', `/api/heroes/${heroId}/npcs`);
  return await response.json();
};

export const fetchNpcById = async (id: number): Promise<Npc> => {
  const response = await apiRequest('GET', `/api/npcs/${id}`);
  return await response.json();
};

export const createNpc = async (heroId: number, npc: Omit<Npc, 'id' | 'heroId' | 'createdAt' | 'updatedAt'>): Promise<Npc> => {
  // Erstelle eine Kopie der Daten
  const now = new Date().toISOString();
  const formattedNpc = { 
    ...npc, 
    heroId, // heroId ist bereits eine Zahl
    createdAt: now,
    updatedAt: now
  };
  
  const response = await apiRequest('POST', `/api/heroes/${heroId}/npcs`, formattedNpc);
  // Ungültig machen der NPC-Liste für diesen Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'npcs'] });
  return await response.json();
};

export const updateNpc = async (id: number, npc: Partial<Npc>): Promise<Npc> => {
  // Erstelle eine Kopie der Daten und entferne Timestamps, um Validierungsfehler zu vermeiden
  const formattedNpc = { ...npc };
  delete (formattedNpc as any).createdAt;
  delete (formattedNpc as any).updatedAt;

  const response = await apiRequest('PUT', `/api/npcs/${id}`, formattedNpc);
  const updatedNpc = await response.json();
  // Ungültig machen der NPC-Liste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', updatedNpc.heroId, 'npcs'] });
  return updatedNpc;
};

export const deleteNpc = async (id: number, heroId: number): Promise<void> => {
  await apiRequest('DELETE', `/api/npcs/${id}`);
  // Ungültig machen der NPC-Liste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'npcs'] });
};

// Session API

export const fetchSessionsByHeroId = async (heroId: number): Promise<Session[]> => {
  const response = await apiRequest('GET', `/api/heroes/${heroId}/sessions`);
  return await response.json();
};

export const fetchSessionById = async (id: number): Promise<Session> => {
  const response = await apiRequest('GET', `/api/sessions/${id}`);
  return await response.json();
};

export const createSession = async (heroId: number, session: Omit<Session, 'id' | 'heroId' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
  // Erstelle eine Kopie der Daten mit Timestamps
  const now = new Date().toISOString();
  const formattedSession = { 
    ...session, 
    heroId, // heroId ist bereits eine Zahl
    createdAt: now,
    updatedAt: now
  };
  
  // Konvertiere Tags-Array zu String, falls nötig
  if (Array.isArray(formattedSession.tags)) {
    (formattedSession as any).tags = formattedSession.tags.join(',');
  }
  
  const response = await apiRequest('POST', `/api/heroes/${heroId}/sessions`, formattedSession);
  // Ungültig machen der Sitzungsliste für diesen Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'sessions'] });
  return await response.json();
};

export const updateSession = async (id: number, session: Partial<Session>): Promise<Session> => {
  // Erstelle eine Kopie der Daten und entferne Timestamps, um Validierungsfehler zu vermeiden
  const formattedSession = { ...session };
  delete (formattedSession as any).createdAt;
  delete (formattedSession as any).updatedAt;
  
  // Konvertiere Tags-Array zu String, falls nötig
  if (formattedSession.tags !== undefined && Array.isArray(formattedSession.tags)) {
    (formattedSession as any).tags = formattedSession.tags.join(',');
  }
  
  const response = await apiRequest('PUT', `/api/sessions/${id}`, formattedSession);
  const updatedSession = await response.json();
  // Ungültig machen der Sitzungsliste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', updatedSession.heroId, 'sessions'] });
  return updatedSession;
};

export const deleteSession = async (id: number, heroId: number): Promise<void> => {
  await apiRequest('DELETE', `/api/sessions/${id}`);
  // Ungültig machen der Sitzungsliste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'sessions'] });
};

// Quest API

export const fetchQuestsByHeroId = async (heroId: number): Promise<Quest[]> => {
  const response = await apiRequest('GET', `/api/heroes/${heroId}/quests`);
  return await response.json();
};

export const fetchQuestById = async (id: number): Promise<Quest> => {
  const response = await apiRequest('GET', `/api/quests/${id}`);
  return await response.json();
};

export const createQuest = async (heroId: number, quest: Omit<Quest, 'id' | 'heroId' | 'createdAt' | 'updatedAt'>): Promise<Quest> => {
  // Erstelle eine Kopie der Daten mit Timestamps
  const now = new Date().toISOString();
  const formattedQuest = { 
    ...quest, 
    heroId, // heroId ist bereits eine Zahl
    createdAt: now,
    updatedAt: now
  };
  
  const response = await apiRequest('POST', `/api/heroes/${heroId}/quests`, formattedQuest);
  // Ungültig machen der Quest-Liste für diesen Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'quests'] });
  return await response.json();
};

export const updateQuest = async (id: number, quest: Partial<Quest>): Promise<Quest> => {
  // Erstelle eine Kopie der Daten und entferne Timestamps, um Validierungsfehler zu vermeiden
  const formattedQuest = { ...quest };
  delete (formattedQuest as any).createdAt;
  delete (formattedQuest as any).updatedAt;
  
  const response = await apiRequest('PUT', `/api/quests/${id}`, formattedQuest);
  const updatedQuest = await response.json();
  // Ungültig machen der Quest-Liste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', updatedQuest.heroId, 'quests'] });
  return updatedQuest;
};

export const deleteQuest = async (id: number, heroId: number): Promise<void> => {
  await apiRequest('DELETE', `/api/quests/${id}`);
  // Ungültig machen der Quest-Liste für den Helden
  queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'quests'] });
};

// Activity API

export const fetchActivitiesByHeroId = async (heroId: number, limit?: number): Promise<Activity[]> => {
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

export const exportHeroData = async (heroId: number): Promise<ExportedHero | null> => {
  try {
    const hero = await fetchHeroById(heroId.toString());
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
      const exportedHero = await exportHeroData(hero.id);
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