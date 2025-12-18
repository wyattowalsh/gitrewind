# Git Rewind — Type Definitions Reference

> Quick reference for the core TypeScript types. Implement these in `src/types/`.

---

## Event Types (`src/types/events.ts`)

```typescript
export interface EventMap {
  // Authentication
  'auth:initiated': { provider: 'github' };
  'auth:success': { token: string; user: UserProfile };
  'auth:error': { error: Error };
  'auth:logout': undefined;

  // Data Pipeline
  'data:fetch:start': { source: string };
  'data:fetch:progress': { source: string; progress: number; stage: string };
  'data:fetch:complete': { source: string; data: RawActivityData };
  'data:fetch:error': { source: string; error: Error };
  'data:transform:complete': { model: ActivityModel };

  // Parameters
  'params:computing': undefined;
  'params:ready': { params: UnifiedParameters };
  'params:updated': { params: Partial<UnifiedParameters>; source: string };

  // Music
  'music:loading': undefined;
  'music:ready': undefined;
  'music:play': undefined;
  'music:pause': undefined;
  'music:stop': undefined;
  'music:seek': { position: number };
  'music:beat': BeatEvent;
  'music:section': { section: MusicSection; index: number };
  'music:complete': undefined;

  // Art
  'art:ready': undefined;
  'art:style:change': { style: ArtStyle };

  // Network
  'network:ready': undefined;
  'network:node:hover': { node: GraphNode | null };
  'network:node:click': { node: GraphNode };

  // Export
  'export:start': { format: ExportFormat };
  'export:progress': { format: ExportFormat; progress: number };
  'export:complete': { format: ExportFormat; blob: Blob; url: string };
  'export:error': { format: ExportFormat; error: Error };
}

export interface BeatEvent {
  beat: number;
  measure: number;
  subdivision: number;
  time: number;
}

export interface MusicSection {
  name: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  startTime: number;
  duration: number;
  energy: number;
}

export type ArtStyle = 'constellation' | 'flowField' | 'circuit' | 'nebula';
export type ExportFormat = 'video-webm' | 'video-mp4' | 'audio-wav' | 'image-png';
```

---

## Activity Types (`src/types/activity.ts`)

```typescript
export interface RawActivityData {
  user: RawUser;
  contributionCalendar: RawContributionCalendar;
  repositoriesContributedTo: RawRepository[];
  year: number;
  fetchedAt: string;
}

export interface RawUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  createdAt: string;
  bio: string | null;
}

export interface RawContributionCalendar {
  totalContributions: number;
  weeks: Array<{
    contributionDays: Array<{
      date: string;
      contributionCount: number;
      contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
    }>;
  }>;
}

export interface RawRepository {
  nameWithOwner: string;
  primaryLanguage: { name: string; color: string } | null;
  stargazerCount: number;
}

// Processed model
export interface ActivityModel {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    memberSince: Date;
  };

  year: number;

  totals: {
    commits: number;
    pullRequests: number;
    reviews: number;
    additions: number;
    deletions: number;
    activeDays: number;
    longestStreak: number;
    repositories: number;
  };

  patterns: {
    busiestDayOfWeek: number;
    busiestHour: number;
    busiestMonth: number;
    consistencyScore: number;
    weekdayVsWeekend: number;
  };

  languages: LanguageStats[];
  collaborators: CollaboratorStats[];
  dailyActivity: Map<string, DayActivity>;
  monthlyActivity: MonthlyActivity[];
}

export interface LanguageStats {
  name: string;
  color: string;
  percentage: number;
  commits: number;
}

export interface CollaboratorStats {
  login: string;
  avatarUrl: string;
  interactions: number;
  sharedRepos: string[];
}

export interface DayActivity {
  date: string;
  commits: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface MonthlyActivity {
  month: number;
  commits: number;
  normalizedActivity: number;
}
```

---

## Parameter Types (`src/types/parameters.ts`)

```typescript
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

export interface MusicParameters {
  key: { root: MusicalNote; mode: MusicalMode };
  scale: number[];
  chordProgression: Chord[];
  instruments: InstrumentAssignment[];
  mood: 'uplifting' | 'contemplative' | 'dramatic' | 'dreamy';
}

export type MusicalNote = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type MusicalMode = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'pentatonic';

export interface Chord {
  root: MusicalNote;
  type: 'maj' | 'min' | 'dim' | 'maj7' | 'min7' | 'dom7';
  duration: number;
}

export interface InstrumentAssignment {
  language: string;
  instrument: InstrumentType;
  volume: number;
  pan: number;
}

export type InstrumentType = 
  | 'synth' | 'piano' | 'electricPiano' | 'pad' 
  | 'bass' | 'strings' | 'bells' | 'guitar';

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
```

---

## Graph Types (`src/types/graph.ts`)

```typescript
export interface GraphNode {
  id: string;
  type: 'user' | 'collaborator';
  label: string;
  size: number;
  color: string;
  avatarUrl?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}
```

---

## Store Types

```typescript
// Auth Store
interface AuthState {
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  token: string | null;  // MEMORY ONLY!
  user: UserProfile | null;
  error: Error | null;
}

// Data Store
interface DataState {
  status: 'idle' | 'fetching' | 'transforming' | 'ready' | 'error';
  progress: number;
  stage: string;
  model: ActivityModel | null;
  error: Error | null;
}

// Params Store
interface ParamsState {
  status: 'idle' | 'computing' | 'ready';
  values: UnifiedParameters | null;
  overrides: Partial<UnifiedParameters>;
}

// UI Store
interface UIState {
  theme: 'dark' | 'light' | 'system';
  activePanel: 'network' | 'music' | 'art' | null;
  modals: {
    share: boolean;
    export: boolean;
    settings: boolean;
  };
}
```

---

*Use these types as your source of truth. Implement them first in `src/types/`.*
