export interface Hero {
  id: string;
  name: string;
  system: string;
  race: string;
  class: string;
  level: number;
  age?: number;
  portrait?: string;
  backstory?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Npc {
  id: string;
  heroId: string;
  name: string;
  image?: string;
  relationship: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  heroId: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Quest {
  id: string;
  heroId: string;
  title: string;
  description: string;
  type: string; // main, side, etc.
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 
  | 'hero_created' 
  | 'hero_updated'
  | 'hero_deleted'
  | 'npc_created'
  | 'npc_updated'
  | 'npc_deleted'
  | 'session_created'
  | 'session_updated'
  | 'session_deleted'
  | 'quest_created'
  | 'quest_updated'
  | 'quest_deleted';

export interface Activity {
  id: string;
  heroId: string;
  type: ActivityType;
  message: string;
  date: string;
}

export interface Tag {
  id: string;
  label: string;
}
