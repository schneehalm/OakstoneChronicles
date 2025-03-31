/**
 * Diese Typen werden durch die entsprechenden Typen aus '@shared/schema' ersetzt.
 * Dies stellt sicher, dass wir konsistente Typen im gesamten Projekt verwenden.
 */

export interface HeroStats {
  [key: string]: number | string;
}

// Wir importieren nun alles aus '@shared/schema'
export { 
  type Hero,
  type Npc,
  type Session,
  type Quest
} from '@shared/schema';

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

// Direkt Activity aus Schema importieren
export { type Activity } from '@shared/schema';

export interface Tag {
  id: number;
  label: string;
}
