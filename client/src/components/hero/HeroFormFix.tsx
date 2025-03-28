/* 
 * Diese Datei enthält die Korrekturen für die HeroForm.tsx
 * Zeilen 339-341 sollten wie folgt korrigiert werden:
 */

// FALSCH - LSP Fehler:
min={stat.min}
max={stat.max}
step={stat.step || 1}

// KORREKT:
min={'min' in stat ? stat.min : undefined}
max={'max' in stat ? stat.max : undefined}
step={'step' in stat ? stat.step : 1}