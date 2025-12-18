// Parameter Types for Git Rewind

export interface HSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

export interface ColorPalette {
  primary: HSL;
  secondary: HSL;
  accent: HSL;
  background: HSL;
  gradient: HSL[];
}

export type MusicalNote = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type MusicalMode = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'pentatonic';

export interface Chord {
  root: MusicalNote;
  type: 'maj' | 'min' | 'dim' | 'maj7' | 'min7' | 'dom7';
  duration: number;
}

export type InstrumentType =
  | 'synth' | 'piano' | 'electricPiano' | 'pad'
  | 'bass' | 'strings' | 'bells' | 'guitar';

export interface InstrumentAssignment {
  language: string;
  instrument: InstrumentType;
  volume: number;
  pan: number;
}

export interface MusicParameters {
  key: { root: MusicalNote; mode: MusicalMode };
  scale: number[];
  chordProgression: Chord[];
  instruments: InstrumentAssignment[];
  mood: 'uplifting' | 'contemplative' | 'dramatic' | 'dreamy';
}

export interface ArtParameters {
  style: 'constellation' | 'flowField' | 'circuit' | 'nebula';
  particleCount: number;
  noiseScale: number;
  glowIntensity: number;
}

export interface MonthlyData {
  month: number;
  commits: number;
  normalizedActivity: number;
}

export interface Peak {
  date: string;
  commits: number;
  significance: number;
}

export interface DisplayStats {
  totalCommits: number;
  totalPRs: number;
  activeDays: number;
  longestStreak: number;
  topLanguage: string;
  topCollaborator: string | null;
}

export interface UnifiedParameters {
  // Identity
  seed: number;
  username: string;
  year: number;
  avatarUrl: string;

  // Temporal
  tempo: {
    bpm: number;           // 60-180
    swing: number;         // 0-0.3
    signature: [number, number];
  };

  // Magnitude
  intensity: number;       // 0-1
  complexity: number;      // 0-1
  density: number;         // 0-1
  momentum: number;        // 0-1

  // Visual
  colors: ColorPalette;

  // Graph
  graph: {
    nodeCount: number;
    edgeCount: number;
    clusterCount: number;
  };

  // Musical
  music: MusicParameters;

  // Artistic
  art: ArtParameters;

  // Time Series
  timeSeries: {
    monthly: MonthlyData[];
    peaks: Peak[];
  };

  // Display Stats
  stats: DisplayStats;
}
