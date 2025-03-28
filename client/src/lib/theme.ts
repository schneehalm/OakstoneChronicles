export const THEME = {
  colors: {
    background: '#1e1e2f', // dark violet-gray
    gold: '#d4af37', // gold accent
    purple: '#7f5af0', // magical purple
    green: '#43ffaf', // mystical green
    textLight: '#f5f5f5',
    textDark: '#121212'
  },
  fonts: {
    heading: '"Cinzel Decorative", cursive',
    body: '"Inter", sans-serif'
  }
};

export const GAME_SYSTEMS = [
  { value: "dnd5e", label: "D&D 5e" },
  { value: "witcher", label: "Witcher TRPG" },
  { value: "pathfinder", label: "Pathfinder" },
  { value: "coc", label: "Call of Cthulhu" },
  { value: "shadowrun", label: "Shadowrun" },
  { value: "homebrew", label: "Homebrew / Eigenes System" },
  { value: "other", label: "Anderes System" }
];

export const RELATIONSHIP_TYPES = [
  { value: "ally", label: "Verbündeter" },
  { value: "enemy", label: "Feind" },
  { value: "neutral", label: "Neutral" },
  { value: "family", label: "Familie" },
  { value: "mentor", label: "Mentor" },
  { value: "student", label: "Schüler" },
  { value: "rival", label: "Rivale" },
  { value: "romance", label: "Romanze" },
  { value: "other", label: "Andere" }
];

export const QUEST_TYPES = [
  { value: "main", label: "Hauptquest" },
  { value: "side", label: "Nebenquest" },
  { value: "personal", label: "Persönlich" },
  { value: "guild", label: "Gilde" },
  { value: "other", label: "Andere" }
];

// Statistik-Definitionen für verschiedene Regelwerke
export const STATS_DEFINITIONS = {
  // D&D 5e
  dnd5e: [
    { id: 'strength', label: 'Stärke', type: 'number', min: 1, max: 30, default: 10 },
    { id: 'dexterity', label: 'Geschicklichkeit', type: 'number', min: 1, max: 30, default: 10 },
    { id: 'constitution', label: 'Konstitution', type: 'number', min: 1, max: 30, default: 10 },
    { id: 'intelligence', label: 'Intelligenz', type: 'number', min: 1, max: 30, default: 10 },
    { id: 'wisdom', label: 'Weisheit', type: 'number', min: 1, max: 30, default: 10 },
    { id: 'charisma', label: 'Charisma', type: 'number', min: 1, max: 30, default: 10 },
    { id: 'maxHp', label: 'Max. Trefferpunkte', type: 'number', min: 1, default: 10 },
    { id: 'currentHp', label: 'Aktuelle Trefferpunkte', type: 'number', min: 0, default: 10 },
    { id: 'armorClass', label: 'Rüstungsklasse', type: 'number', min: 1, default: 10 }
  ],
  
  // Witcher TRPG
  witcher: [
    { id: 'intelligence', label: 'Intelligenz', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'reflex', label: 'Reflex', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'dexterity', label: 'Geschicklichkeit', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'body', label: 'Körper', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'speed', label: 'Geschwindigkeit', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'empathy', label: 'Empathie', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'crafting', label: 'Handwerk', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'will', label: 'Willenskraft', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'luck', label: 'Glück', type: 'number', min: 1, max: 13, default: 5 },
    { id: 'stamina', label: 'Ausdauer', type: 'number', min: 0, default: 20 },
    { id: 'hp', label: 'Trefferpunkte', type: 'number', min: 0, default: 25 }
  ],
  
  // Pathfinder
  pathfinder: [
    { id: 'strength', label: 'Stärke', type: 'number', min: -5, max: 30, default: 10 },
    { id: 'dexterity', label: 'Geschicklichkeit', type: 'number', min: -5, max: 30, default: 10 },
    { id: 'constitution', label: 'Konstitution', type: 'number', min: -5, max: 30, default: 10 },
    { id: 'intelligence', label: 'Intelligenz', type: 'number', min: -5, max: 30, default: 10 },
    { id: 'wisdom', label: 'Weisheit', type: 'number', min: -5, max: 30, default: 10 },
    { id: 'charisma', label: 'Charisma', type: 'number', min: -5, max: 30, default: 10 },
    { id: 'maxHp', label: 'Max. Lebenspunkte', type: 'number', min: 1, default: 10 },
    { id: 'currentHp', label: 'Aktuelle Lebenspunkte', type: 'number', min: 0, default: 10 },
    { id: 'armorClass', label: 'Rüstungsklasse', type: 'number', min: 1, default: 10 },
    { id: 'perception', label: 'Wahrnehmung', type: 'number', default: 0 }
  ],
  
  // Call of Cthulhu
  coc: [
    { id: 'strength', label: 'STR (Stärke)', type: 'number', min: 1, max: 100, default: 50 },
    { id: 'constitution', label: 'CON (Konstitution)', type: 'number', min: 1, max: 100, default: 50 },
    { id: 'size', label: 'SIZ (Größe)', type: 'number', min: 1, max: 100, default: 50 },
    { id: 'dexterity', label: 'DEX (Geschicklichkeit)', type: 'number', min: 1, max: 100, default: 50 },
    { id: 'appearance', label: 'APP (Erscheinung)', type: 'number', min: 1, max: 100, default: 50 },
    { id: 'intelligence', label: 'INT (Intelligenz)', type: 'number', min: 1, max: 100, default: 50 },
    { id: 'power', label: 'POW (Willenskraft)', type: 'number', min: 1, max: 100, default: 50 },
    { id: 'education', label: 'EDU (Bildung)', type: 'number', min: 1, max: 100, default: 50 },
    { id: 'sanity', label: 'SAN (Geisteszustand)', type: 'number', min: 0, max: 100, default: 50 },
    { id: 'luck', label: 'Glück', type: 'number', min: 0, max: 100, default: 50 },
    { id: 'hp', label: 'Trefferpunkte', type: 'number', min: 0, default: 10 }
  ],
  
  // Shadowrun
  shadowrun: [
    { id: 'body', label: 'Körper', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'agility', label: 'Geschicklichkeit', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'reaction', label: 'Reaktion', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'strength', label: 'Stärke', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'willpower', label: 'Willenskraft', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'logic', label: 'Logik', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'intuition', label: 'Intuition', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'charisma', label: 'Charisma', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'edge', label: 'Edge', type: 'number', min: 1, max: 10, default: 3 },
    { id: 'essence', label: 'Essenz', type: 'number', min: 0, max: 6, default: 6, step: 0.1 },
    { id: 'magic', label: 'Magie', type: 'number', min: 0, max: 12, default: 0 },
    { id: 'resonance', label: 'Resonanz', type: 'number', min: 0, max: 12, default: 0 }
  ],
  
  // Homebrew / Eigenes System
  homebrew: [
    { id: 'strength', label: 'Stärke', type: 'number', default: 10 },
    { id: 'dexterity', label: 'Geschicklichkeit', type: 'number', default: 10 },
    { id: 'constitution', label: 'Konstitution', type: 'number', default: 10 },
    { id: 'intelligence', label: 'Intelligenz', type: 'number', default: 10 },
    { id: 'wisdom', label: 'Weisheit', type: 'number', default: 10 },
    { id: 'charisma', label: 'Charisma', type: 'number', default: 10 },
    { id: 'hp', label: 'Trefferpunkte', type: 'number', default: 10 }
  ],
  
  // Anderes System (einfache Standardwerte)
  other: [
    { id: 'strength', label: 'Stärke', type: 'number', default: 10 },
    { id: 'dexterity', label: 'Geschicklichkeit', type: 'number', default: 10 },
    { id: 'constitution', label: 'Konstitution', type: 'number', default: 10 },
    { id: 'intelligence', label: 'Intelligenz', type: 'number', default: 10 },
    { id: 'wisdom', label: 'Weisheit', type: 'number', default: 10 },
    { id: 'charisma', label: 'Charisma', type: 'number', default: 10 },
    { id: 'hp', label: 'Trefferpunkte', type: 'number', default: 10 }
  ]
};
