import { Hero, Npc, Session, Quest, Activity } from './types';

// Demo Hero
const demoHero: Omit<Hero, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Thalia Feuerweber',
  system: 'dnd5e',
  race: 'Halbelf',
  class: 'Hexenmeister',
  level: 7,
  age: 27,
  portrait: 'https://i.imgur.com/aHfQsQL.jpg',
  backstory: `Thalia wurde in einer kleinen Siedlung am Rande des Sturmgehölzes geboren. Ihre elfische Mutter war eine wandernde Kräuterkundige, ihr Vater ein menschlicher Gelehrter aus Silbermond.

Als Kind spürte Thalia immer eine Verbindung zu den Elementen, besonders zum Feuer. In ihrem 16. Lebensjahr, während eines heftigen Gewitters, wurde sie von einem magischen Blitz getroffen und überlebte wie durch ein Wunder. Seitdem kann sie arkane Kräfte kanalisieren.

Sie reist nun durch die Welt, um mehr über ihre magischen Fähigkeiten zu lernen und den Pakt zu verstehen, den sie unbewusst mit einer mächtigen Feuerentität eingegangen ist.`,
  tags: ['Magie', 'Feuer', 'Halbelf', 'Reisend']
};

// Demo NPCs
const demoNpcs: Omit<Npc, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    heroId: '', // Will be filled after hero creation
    name: 'Magister Orin',
    image: 'https://i.imgur.com/IWLn9kx.jpg',
    relationship: 'mentor',
    location: 'Akademie von Silbermond',
    notes: 'Ein strenger aber gerechter Lehrmeister. Hat Thalia geholfen, ihre arkanen Kräfte zu kontrollieren.'
  },
  {
    heroId: '', // Will be filled after hero creation
    name: 'Kira Mondschimmer',
    image: 'https://i.imgur.com/Z6tYMQU.jpg',
    relationship: 'ally',
    location: 'Wandernde Händlerin',
    notes: 'Eine Elfenrängerin, die Thalia auf ihren Reisen mehrfach begegnet ist. Versorgt sie mit seltenen Zutaten für ihre Magie.'
  },
  {
    heroId: '', // Will be filled after hero creation
    name: 'Lord Dravus',
    image: 'https://i.imgur.com/R6w6nBZ.jpg',
    relationship: 'enemy',
    location: 'Schloss Rabenspitze',
    notes: 'Ein mächtiger Nekromant, der versucht hat, Thalias arkane Essenz zu stehlen. Schwor Rache nach seiner Niederlage.'
  }
];

// Demo Sessions
const demoSessions: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    heroId: '', // Will be filled after hero creation
    title: 'Unheil im Nebeltal',
    date: new Date(2023, 2, 15).toISOString(),
    content: `Unsere Gruppe wurde von Bürgermeister Thalric angeheuert, um den Grund für die seltsamen Nebel im Tal herauszufinden.
    
Wir entdeckten einen alten Turm, in dem ein alter Zauber außer Kontrolle geraten war. Meine Feuerkräfte waren entscheidend, um das Artefakt zu neutralisieren.

Auf dem Rückweg trafen wir Lord Dravus, der sich ebenfalls für das Artefakt interessierte. Es kam zum Kampf, den wir knapp gewinnen konnten.`,
    tags: ['Kampf', 'Artefakt', 'Nebel', 'Dravus']
  },
  {
    heroId: '', // Will be filled after hero creation
    title: 'Besuch in der Akademie',
    date: new Date(2023, 3, 5).toISOString(),
    content: `Heute habe ich die Akademie von Silbermond besucht, um Magister Orin um Rat zu fragen. Er wirkte besorgt über die Begegnung mit Lord Dravus.

Orin half mir dabei, meine Verbindung zur Feuerentität zu stärken. In einer Meditation konnte ich kurz mit dem Wesen kommunizieren - sein Name scheint "Pyropharis" zu sein.

In der Bibliothek fanden wir Hinweise auf ein altes Ritual, das mir helfen könnte, mehr Kontrolle über meine Kräfte zu erlangen. Dafür benötige ich jedoch das "Prisma der Elemente", das in einer vergessenen Tempelruine im Drachengebirge liegen soll.`,
    tags: ['Akademie', 'Silbermond', 'Ritual', 'Orin']
  }
];

// Demo Quests
const demoQuests: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    heroId: '', // Will be filled after hero creation
    title: 'Das Prisma der Elemente',
    description: 'Finde das legendäre Prisma der Elemente in den Ruinen des Tempels von Kal\'dorei im Drachengebirge.',
    type: 'main',
    completed: false
  },
  {
    heroId: '', // Will be filled after hero creation
    title: 'Die Schulden des Barden',
    description: 'Tilwen der Barde schuldet mir noch 50 Goldmünzen für die Rettung seiner wertvollen Laute. Finde ihn in der Taverne zum Goldenen Drachen in Westhafen.',
    type: 'side',
    completed: true
  },
  {
    heroId: '', // Will be filled after hero creation
    title: 'Die Wahrheit über meine Herkunft',
    description: 'Meine Mutter erwähnte einen Amulett, das Hinweise auf meine wahre Herkunft enthalten soll. Es wurde in einem Kloster in den östlichen Ländern aufbewahrt.',
    type: 'personal',
    completed: false
  }
];

// Populate demo data
export const populateDemoData = () => {
  // Clear existing data
  localStorage.removeItem('oakstone-heroes');
  localStorage.removeItem('oakstone-npcs');
  localStorage.removeItem('oakstone-sessions');
  localStorage.removeItem('oakstone-quests');
  localStorage.removeItem('oakstone-activities');
  
  // Create arrays for storing data
  const heroes: Hero[] = [];
  const npcs: Npc[] = [];
  const sessions: Session[] = [];
  const quests: Quest[] = [];
  const activities: Activity[] = [];
  
  // Create hero with ID
  const heroId = crypto.randomUUID();
  const createdAt = new Date(2023, 0, 10).toISOString(); // January 10, 2023
  const updatedAt = new Date().toISOString();
  
  const hero: Hero = {
    ...demoHero,
    id: heroId,
    createdAt,
    updatedAt
  };
  
  heroes.push(hero);
  
  // Add hero creation activity
  activities.push({
    id: crypto.randomUUID(),
    heroId,
    type: 'hero_created',
    message: `Neuer Held: ${hero.name}`,
    date: createdAt
  });
  
  // Add NPCs with heroId
  demoNpcs.forEach((npcData, index) => {
    const npc: Npc = {
      ...npcData,
      heroId,
      id: crypto.randomUUID(),
      createdAt: new Date(2023, 0, 15 + index * 5).toISOString(),
      updatedAt: new Date(2023, 0, 15 + index * 5).toISOString()
    };
    
    npcs.push(npc);
    
    // Add NPC creation activity
    activities.push({
      id: crypto.randomUUID(),
      heroId,
      type: 'npc_created',
      message: `Neuer NPC: ${npc.name}`,
      date: npc.createdAt
    });
  });
  
  // Add Sessions with heroId
  demoSessions.forEach((sessionData) => {
    const session: Session = {
      ...sessionData,
      heroId,
      id: crypto.randomUUID(),
      createdAt: sessionData.date,
      updatedAt: sessionData.date
    };
    
    sessions.push(session);
    
    // Add session creation activity
    activities.push({
      id: crypto.randomUUID(),
      heroId,
      type: 'session_created',
      message: `Neue Session: ${session.title}`,
      date: session.createdAt
    });
  });
  
  // Add Quests with heroId
  demoQuests.forEach((questData, index) => {
    const quest: Quest = {
      ...questData,
      heroId,
      id: crypto.randomUUID(),
      createdAt: new Date(2023, 2, 1 + index * 7).toISOString(),
      updatedAt: new Date(2023, 2, 1 + index * 7).toISOString()
    };
    
    quests.push(quest);
    
    // Add quest creation activity
    activities.push({
      id: crypto.randomUUID(),
      heroId,
      type: 'quest_created',
      message: `Neuer Auftrag: ${quest.title}`,
      date: quest.createdAt
    });
  });
  
  // Sort activities by date (newest first)
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Save all data to localStorage
  localStorage.setItem('oakstone-heroes', JSON.stringify(heroes));
  localStorage.setItem('oakstone-npcs', JSON.stringify(npcs));
  localStorage.setItem('oakstone-sessions', JSON.stringify(sessions));
  localStorage.setItem('oakstone-quests', JSON.stringify(quests));
  localStorage.setItem('oakstone-activities', JSON.stringify(activities));
  
  return {
    hero,
    npcsCount: npcs.length,
    sessionsCount: sessions.length,
    questsCount: quests.length,
    activitiesCount: activities.length
  };
};