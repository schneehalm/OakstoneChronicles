import { populateDemoData } from './lib/demoData';

// Sofort Demo-Daten laden
try {
  const result = populateDemoData();
  console.log('Demo-Daten erfolgreich geladen:', result);
} catch (error) {
  console.error('Fehler beim Laden der Demo-Daten:', error);
}