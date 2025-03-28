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
