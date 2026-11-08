// Note names
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Key signatures (major and minor)
export interface KeySignature {
  name: string;
  notes: number[]; // semitone indices (0-11)
  type: 'major' | 'minor';
}

export const MAJOR_KEYS: KeySignature[] = [
  { name: 'C Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'G Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' }, // transposed
  { name: 'D Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'A Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'E Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'B Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'F# Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'Db Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'Ab Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'Eb Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'Bb Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
  { name: 'F Major', notes: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
];

export const KEY_OPTIONS = [
  'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major',
  'F# Major', 'Db Major', 'Ab Major', 'Eb Major', 'Bb Major', 'F Major',
  'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor',
  'D Minor', 'G Minor', 'C Minor', 'F Minor', 'Bb Minor', 'Eb Minor',
];

export const SCALE_SIZES = [
  { name: '1/4 (Шестнадцатые)', value: 0.25 },
  { name: '1/2 (Восьмые)', value: 0.5 },
  { name: '1 (Четверти)', value: 1 },
  { name: '2 (Половинные)', value: 2 },
  { name: '4 (Целые)', value: 4 },
];

// Get scale notes for a given key
export function getScaleNotes(keyName: string): number[] {
  const parts = keyName.split(' ');
  const root = parts[0];
  const type = parts[1];

  const rootIndex = NOTE_NAMES.indexOf(root);
  if (rootIndex === -1) return [0, 2, 4, 5, 7, 9, 11];

  let intervals: number[];
  if (type === 'Major') {
    intervals = [0, 2, 4, 5, 7, 9, 11]; // Ionian
  } else {
    intervals = [0, 2, 3, 5, 7, 8, 10]; // Aeolian (natural minor)
  }

  return intervals.map(i => (i + rootIndex) % 12);
}

// Convert frequency to MIDI note number
export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

// Convert MIDI note to note name
export function midiToNoteName(midi: number): string {
  const noteIndex = Math.round(midi) % 12;
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

// Convert MIDI to note name without octave
export function midiToNoteLetter(midi: number): string {
  const noteIndex = Math.round(midi) % 12;
  return NOTE_NAMES[noteIndex];
}

// Get octave from MIDI
export function midiToOctave(midi: number): number {
  return Math.floor(Math.round(midi) / 12) - 1;
}

// Get note color based on pitch class
export function getNoteColor(noteIndex: number): string {
  const colors = [
    '#FF6B6B', // C
    '#FF8E53', // C#
    '#FFC107', // D
    '#FFEB3B', // D#
    '#8BC34A', // E
    '#4CAF50', // F
    '#00BCD4', // F#
    '#2196F3', // G
    '#3F51B5', // G#
    '#9C27B0', // A
    '#E91E63', // A#
    '#FF5722', // B
  ];
  return colors[noteIndex % 12];
}

// Check if a note belongs to the current scale
export function isNoteInScale(midi: number, scaleNotes: number[]): boolean {
  const noteIndex = Math.round(midi) % 12;
  return scaleNotes.includes(noteIndex);
}

// Quantize note to nearest scale note
export function quantizeToScale(midi: number, scaleNotes: number[]): number {
  const noteIndex = Math.round(midi) % 12;
  const octave = Math.floor(Math.round(midi) / 12) * 12;

  let closest = scaleNotes[0];
  let minDist = 12;

  for (const scaleNote of scaleNotes) {
    const dist = Math.min(
      Math.abs(noteIndex - scaleNote),
      12 - Math.abs(noteIndex - scaleNote)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = scaleNote;
    }
  }

  return octave + closest;
}
