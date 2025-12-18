// Music Composer - Generates sections based on parameters
import type { UnifiedParameters, Chord } from '@/types/parameters';
import { getScaleNotes, getChordNotes, generateMelody, midiToNoteName } from './theory';
import { createSeededRandom } from '@/lib/utils/random';

export interface ScheduledNote {
  time: number;      // In seconds
  note: string;      // Note name (e.g., "C4")
  duration: number;  // In seconds
  velocity: number;  // 0-1
  instrument: string;
}

export interface MusicSection {
  name: string;
  startTime: number;
  duration: number;
  notes: ScheduledNote[];
}

export interface Composition {
  sections: MusicSection[];
  totalDuration: number;
  bpm: number;
}

const SECTION_DURATIONS = {
  intro: 15,
  verse: 30,
  chorus: 20,
  bridge: 15,
  outro: 10,
};

export function composeMusic(params: UnifiedParameters): Composition {
  const rng = createSeededRandom(params.seed);
  const { bpm } = params.tempo;
  const beatDuration = 60 / bpm;

  const scaleNotes = getScaleNotes(params.music.key.root, params.music.key.mode, 4);
  const bassScaleNotes = getScaleNotes(params.music.key.root, params.music.key.mode, 2);

  const sections: MusicSection[] = [];
  let currentTime = 0;

  // INTRO (0-15s)
  const intro = composeIntro(currentTime, SECTION_DURATIONS.intro, params, scaleNotes, rng, beatDuration);
  sections.push(intro);
  currentTime += intro.duration;

  // VERSE (15-45s)
  const verse = composeVerse(currentTime, SECTION_DURATIONS.verse, params, scaleNotes, bassScaleNotes, rng, beatDuration);
  sections.push(verse);
  currentTime += verse.duration;

  // CHORUS (45-65s)
  const chorus = composeChorus(currentTime, SECTION_DURATIONS.chorus, params, scaleNotes, bassScaleNotes, rng, beatDuration);
  sections.push(chorus);
  currentTime += chorus.duration;

  // BRIDGE (65-80s)
  const bridge = composeBridge(currentTime, SECTION_DURATIONS.bridge, params, scaleNotes, rng, beatDuration);
  sections.push(bridge);
  currentTime += bridge.duration;

  // OUTRO (80-90s)
  const outro = composeOutro(currentTime, SECTION_DURATIONS.outro, params, scaleNotes, rng, beatDuration);
  sections.push(outro);
  currentTime += outro.duration;

  return {
    sections,
    totalDuration: currentTime,
    bpm,
  };
}

function composeIntro(
  startTime: number,
  duration: number,
  params: UnifiedParameters,
  scaleNotes: number[],
  rng: () => number,
  beatDuration: number
): MusicSection {
  const notes: ScheduledNote[] = [];

  // Ambient pad chord
  const chordNotes = getChordNotes(params.music.key.root, 'maj7', 3);
  for (const note of chordNotes) {
    notes.push({
      time: startTime,
      note: midiToNoteName(note),
      duration: duration * 0.8,
      velocity: 0.3,
      instrument: 'pad',
    });
  }

  // Sparse high bells
  const numBells = Math.floor(duration / 2);
  for (let i = 0; i < numBells; i++) {
    const time = startTime + i * 2 + rng() * 0.5;
    const noteIdx = Math.floor(rng() * scaleNotes.length);
    const note = scaleNotes[noteIdx]! + 12; // One octave up

    notes.push({
      time,
      note: midiToNoteName(note),
      duration: 1.5,
      velocity: 0.2 + rng() * 0.2,
      instrument: 'bells',
    });
  }

  return {
    name: 'intro',
    startTime,
    duration,
    notes,
  };
}

function composeVerse(
  startTime: number,
  duration: number,
  params: UnifiedParameters,
  scaleNotes: number[],
  bassScaleNotes: number[],
  rng: () => number,
  beatDuration: number
): MusicSection {
  const notes: ScheduledNote[] = [];
  const monthlyData = params.timeSeries.monthly;

  // Each month = 2.5 seconds
  const monthDuration = duration / 12;

  for (let month = 0; month < 12; month++) {
    const monthActivity = monthlyData[month]?.normalizedActivity ?? 0;
    const monthStart = startTime + month * monthDuration;

    // Melody density based on activity
    const noteCount = Math.floor(2 + monthActivity * 6);
    const melody = generateMelody(scaleNotes, noteCount, rng, 'wave');

    for (let i = 0; i < melody.length; i++) {
      const time = monthStart + (i / melody.length) * monthDuration;
      notes.push({
        time,
        note: midiToNoteName(melody[i]!),
        duration: beatDuration * 0.8,
        velocity: 0.4 + monthActivity * 0.3,
        instrument: params.music.instruments[0]?.instrument ?? 'synth',
      });
    }

    // Bass on every beat
    const bassNote = bassScaleNotes[month % bassScaleNotes.length]!;
    notes.push({
      time: monthStart,
      note: midiToNoteName(bassNote),
      duration: monthDuration * 0.9,
      velocity: 0.5,
      instrument: 'bass',
    });
  }

  return {
    name: 'verse',
    startTime,
    duration,
    notes,
  };
}

function composeChorus(
  startTime: number,
  duration: number,
  params: UnifiedParameters,
  scaleNotes: number[],
  bassScaleNotes: number[],
  rng: () => number,
  beatDuration: number
): MusicSection {
  const notes: ScheduledNote[] = [];
  const chordProgression = params.music.chordProgression;

  // Full chord progression
  const chordDuration = duration / chordProgression.length;

  for (let i = 0; i < chordProgression.length; i++) {
    const chord = chordProgression[i]!;
    const chordStart = startTime + i * chordDuration;
    const chordNotes = getChordNotes(chord.root, chord.type, 4);

    // Pad chord
    for (const note of chordNotes) {
      notes.push({
        time: chordStart,
        note: midiToNoteName(note),
        duration: chordDuration * 0.95,
        velocity: 0.5,
        instrument: 'pad',
      });
    }

    // Arpeggio
    for (let j = 0; j < 4; j++) {
      const noteIdx = j % chordNotes.length;
      const time = chordStart + j * (chordDuration / 4);
      notes.push({
        time,
        note: midiToNoteName(chordNotes[noteIdx]! + 12),
        duration: beatDuration * 0.5,
        velocity: 0.4,
        instrument: 'bells',
      });
    }

    // Bass
    const bassNote = bassScaleNotes[i % bassScaleNotes.length]!;
    notes.push({
      time: chordStart,
      note: midiToNoteName(bassNote),
      duration: chordDuration * 0.9,
      velocity: 0.6,
      instrument: 'bass',
    });
  }

  // Add melody line
  const melody = generateMelody(scaleNotes, Math.floor(duration / beatDuration), rng, 'wave');
  for (let i = 0; i < melody.length; i++) {
    notes.push({
      time: startTime + i * beatDuration,
      note: midiToNoteName(melody[i]!),
      duration: beatDuration * 0.6,
      velocity: 0.5,
      instrument: params.music.instruments[0]?.instrument ?? 'synth',
    });
  }

  return {
    name: 'chorus',
    startTime,
    duration,
    notes,
  };
}

function composeBridge(
  startTime: number,
  duration: number,
  params: UnifiedParameters,
  scaleNotes: number[],
  rng: () => number,
  beatDuration: number
): MusicSection {
  const notes: ScheduledNote[] = [];

  // Building intensity with arpeggios
  const arpeggioPattern = [0, 2, 4, 2];
  const numArpeggios = Math.floor(duration / (beatDuration * 4));

  for (let i = 0; i < numArpeggios; i++) {
    const baseNoteIdx = i % scaleNotes.length;
    const intensity = i / numArpeggios; // Building

    for (let j = 0; j < 4; j++) {
      const noteIdx = (baseNoteIdx + arpeggioPattern[j]!) % scaleNotes.length;
      const time = startTime + i * beatDuration * 4 + j * beatDuration;

      notes.push({
        time,
        note: midiToNoteName(scaleNotes[noteIdx]!),
        duration: beatDuration * 0.7,
        velocity: 0.3 + intensity * 0.4,
        instrument: 'synth',
      });

      // Add octave on climax
      if (intensity > 0.7) {
        notes.push({
          time,
          note: midiToNoteName(scaleNotes[noteIdx]! + 12),
          duration: beatDuration * 0.5,
          velocity: 0.2 + intensity * 0.3,
          instrument: 'bells',
        });
      }
    }
  }

  return {
    name: 'bridge',
    startTime,
    duration,
    notes,
  };
}

function composeOutro(
  startTime: number,
  duration: number,
  params: UnifiedParameters,
  scaleNotes: number[],
  rng: () => number,
  beatDuration: number
): MusicSection {
  const notes: ScheduledNote[] = [];

  // Return to tonic pad
  const tonicChord = getChordNotes(params.music.key.root, 'maj', 3);
  for (const note of tonicChord) {
    notes.push({
      time: startTime,
      note: midiToNoteName(note),
      duration: duration * 0.9,
      velocity: 0.4,
      instrument: 'pad',
    });
  }

  // Fading bells
  const numBells = Math.floor(duration / 1.5);
  for (let i = 0; i < numBells; i++) {
    const fadeout = 1 - i / numBells;
    const time = startTime + i * 1.5;
    const noteIdx = Math.floor(rng() * scaleNotes.length);

    notes.push({
      time,
      note: midiToNoteName(scaleNotes[noteIdx]! + 12),
      duration: 2,
      velocity: 0.3 * fadeout,
      instrument: 'bells',
    });
  }

  return {
    name: 'outro',
    startTime,
    duration,
    notes,
  };
}
