// Music Theory Module
import type { MusicalNote, MusicalMode, Chord } from '@/types/parameters';

export const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
  'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
  'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88,
};

export const NOTES: MusicalNote[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<MusicalMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
};

export const CHORD_INTERVALS: Record<Chord['type'], number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
};

export function noteToMidi(note: MusicalNote, octave: number = 4): number {
  const noteIndex = NOTES.indexOf(note);
  return noteIndex + (octave + 1) * 12;
}

export function midiToNote(midi: number): { note: MusicalNote; octave: number } {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return { note: NOTES[noteIndex]!, octave };
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function getScaleNotes(root: MusicalNote, mode: MusicalMode, octave: number = 4): number[] {
  const rootMidi = noteToMidi(root, octave);
  return SCALES[mode].map(interval => rootMidi + interval);
}

export function getChordNotes(root: MusicalNote, type: Chord['type'], octave: number = 4): number[] {
  const rootMidi = noteToMidi(root, octave);
  return CHORD_INTERVALS[type].map(interval => rootMidi + interval);
}

export function quantizeToScale(midi: number, scaleNotes: number[]): number {
  const octave = Math.floor(midi / 12);
  const noteInOctave = midi % 12;
  const baseOctaveScale = scaleNotes.map(n => n % 12);

  // Find closest note in scale
  let closest = baseOctaveScale[0]!;
  let minDist = 12;

  for (const scaleNote of baseOctaveScale) {
    const dist = Math.min(
      Math.abs(noteInOctave - scaleNote),
      Math.abs(noteInOctave - scaleNote + 12),
      Math.abs(noteInOctave - scaleNote - 12)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = scaleNote;
    }
  }

  return octave * 12 + closest;
}

export function midiToNoteName(midi: number): string {
  const { note, octave } = midiToNote(midi);
  return `${note}${octave}`;
}

export function generateMelody(
  scaleNotes: number[],
  length: number,
  rng: () => number,
  contour: 'ascending' | 'descending' | 'wave' = 'wave'
): number[] {
  const melody: number[] = [];
  let currentNote = scaleNotes[Math.floor(scaleNotes.length / 2)]!;

  for (let i = 0; i < length; i++) {
    melody.push(currentNote);

    // Determine direction based on contour
    let direction: number;
    switch (contour) {
      case 'ascending':
        direction = rng() < 0.7 ? 1 : -1;
        break;
      case 'descending':
        direction = rng() < 0.7 ? -1 : 1;
        break;
      case 'wave':
      default:
        const phase = (i / length) * Math.PI * 2;
        direction = Math.sin(phase) > 0 ? 1 : -1;
        if (rng() < 0.3) direction *= -1; // Add randomness
    }

    // Move by step or skip
    const interval = rng() < 0.7 ? 1 : 2;
    const currentIndex = scaleNotes.indexOf(currentNote);

    if (currentIndex === -1) {
      currentNote = scaleNotes[Math.floor(rng() * scaleNotes.length)]!;
    } else {
      let nextIndex = currentIndex + direction * interval;
      nextIndex = Math.max(0, Math.min(scaleNotes.length - 1, nextIndex));
      currentNote = scaleNotes[nextIndex]!;
    }
  }

  return melody;
}
