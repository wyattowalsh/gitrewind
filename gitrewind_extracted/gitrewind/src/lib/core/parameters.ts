// Unified Parameter Computation Engine
import type { ActivityModel } from '@/types/activity';
import type {
  UnifiedParameters,
  ColorPalette,
  MusicParameters,
  ArtParameters,
  Chord,
  InstrumentAssignment,
  MusicalNote,
  MusicalMode,
  HSL,
} from '@/types/parameters';
import { clamp } from '@/lib/utils/math';
import { hexToHSL, rotateHue, getLanguageColor } from '@/lib/utils/color';
import { createSeedFromUserYear, createSeededRandom } from '@/lib/utils/random';

// Musical scales
const SCALES: Record<MusicalMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
};

// Language to instrument mapping
const LANGUAGE_INSTRUMENTS: Record<string, InstrumentAssignment['instrument']> = {
  TypeScript: 'synth',
  JavaScript: 'electricPiano',
  Python: 'piano',
  Rust: 'strings',
  Go: 'bass',
  Java: 'pad',
  'C++': 'synth',
  C: 'synth',
  'C#': 'pad',
  Ruby: 'guitar',
  Swift: 'bells',
  Kotlin: 'bells',
  PHP: 'electricPiano',
  Shell: 'bass',
};

function computeTempo(model: ActivityModel): { bpm: number; swing: number; signature: [number, number] } {
  const avgCommitsPerDay = model.totals.commits / 365;
  // Logarithmic mapping: 0.1/day=70bpm, 1/day=90bpm, 5/day=120bpm, 20/day=160bpm
  const bpm = 70 + 90 * Math.log10(1 + avgCommitsPerDay * 2) / Math.log10(50);

  // Swing based on consistency (more consistent = more swing)
  const swing = model.patterns.consistencyScore * 0.2;

  return {
    bpm: clamp(Math.round(bpm), 60, 180),
    swing: clamp(swing, 0, 0.3),
    signature: [4, 4],
  };
}

function computeKey(model: ActivityModel): { root: MusicalNote; mode: MusicalMode } {
  // Use consistency and activity level to determine mood
  const activity = model.totals.commits;
  const consistency = model.patterns.consistencyScore;

  // More active and consistent = major/uplifting
  // Less active or sporadic = minor/contemplative
  if (activity > 500 && consistency > 0.5) {
    return { root: 'C', mode: 'major' };
  } else if (activity > 300 && consistency > 0.3) {
    return { root: 'G', mode: 'mixolydian' };
  } else if (activity > 100) {
    return { root: 'D', mode: 'dorian' };
  } else {
    return { root: 'A', mode: 'minor' };
  }
}

function computeColors(model: ActivityModel): ColorPalette {
  const topLanguage = model.languages[0];
  const secondLanguage = model.languages[1];

  const primaryHex = topLanguage ? getLanguageColor(topLanguage.name) : '#3178c6';
  const primary = hexToHSL(primaryHex);

  const secondary = secondLanguage
    ? hexToHSL(getLanguageColor(secondLanguage.name))
    : rotateHue(primary, 60);

  const accent = rotateHue(primary, 180);
  const background: HSL = { h: primary.h, s: 15, l: 8 };

  const gradient = model.languages.slice(0, 5).map(l => hexToHSL(getLanguageColor(l.name)));
  if (gradient.length === 0) {
    gradient.push(primary);
  }

  return { primary, secondary, accent, background, gradient };
}

function computeIntensity(model: ActivityModel): number {
  // Percentile-based: 500 commits = 0.5, 2000 commits = 0.9
  const commits = model.totals.commits;
  return clamp(Math.log10(commits + 1) / Math.log10(5000), 0, 1);
}

function computeComplexity(model: ActivityModel): number {
  // Shannon entropy of language distribution
  if (model.languages.length === 0) return 0;

  const total = model.languages.reduce((sum, l) => sum + l.percentage, 0);
  if (total === 0) return 0;

  const entropy = -model.languages.reduce((sum, l) => {
    const p = l.percentage / total;
    return p > 0 ? sum + p * Math.log2(p) : sum;
  }, 0);

  const maxEntropy = Math.log2(model.languages.length);
  return maxEntropy > 0 ? clamp(entropy / maxEntropy, 0, 1) : 0;
}

function computeDensity(model: ActivityModel): number {
  // Commits per active day
  if (model.totals.activeDays === 0) return 0;
  const avgPerDay = model.totals.commits / model.totals.activeDays;
  // Normalize: 1 commit/day = 0.2, 5 commits/day = 0.6, 10+ commits/day = 1.0
  return clamp(avgPerDay / 10, 0, 1);
}

function computeMomentum(model: ActivityModel): number {
  // Compare first half vs second half of year
  const monthlyActivity = model.monthlyActivity;
  if (monthlyActivity.length < 12) return 0.5;

  const firstHalf = monthlyActivity.slice(0, 6).reduce((sum, m) => sum + m.commits, 0);
  const secondHalf = monthlyActivity.slice(6, 12).reduce((sum, m) => sum + m.commits, 0);

  if (firstHalf + secondHalf === 0) return 0.5;

  // Positive momentum if second half is busier
  const ratio = secondHalf / (firstHalf + secondHalf);
  return clamp(ratio, 0, 1);
}

function computeChordProgression(mood: MusicParameters['mood']): Chord[] {
  const progressions: Record<MusicParameters['mood'], Array<{ root: MusicalNote; type: Chord['type'] }>> = {
    uplifting: [
      { root: 'C', type: 'maj' },
      { root: 'G', type: 'maj' },
      { root: 'A', type: 'min' },
      { root: 'F', type: 'maj' },
    ],
    contemplative: [
      { root: 'A', type: 'min' },
      { root: 'F', type: 'maj' },
      { root: 'C', type: 'maj' },
      { root: 'G', type: 'maj' },
    ],
    dramatic: [
      { root: 'A', type: 'min' },
      { root: 'D', type: 'min' },
      { root: 'E', type: 'maj' },
      { root: 'A', type: 'min' },
    ],
    dreamy: [
      { root: 'C', type: 'maj7' },
      { root: 'A', type: 'min7' },
      { root: 'F', type: 'maj7' },
      { root: 'G', type: 'dom7' },
    ],
  };

  return progressions[mood].map(chord => ({
    ...chord,
    duration: 2, // 2 beats per chord
  }));
}

function computeMood(intensity: number, complexity: number, momentum: number): MusicParameters['mood'] {
  if (intensity > 0.7 && momentum > 0.6) return 'uplifting';
  if (intensity < 0.3 || momentum < 0.3) return 'contemplative';
  if (complexity > 0.7) return 'dramatic';
  return 'dreamy';
}

function computeMusicParameters(
  model: ActivityModel,
  intensity: number,
  complexity: number,
  momentum: number
): MusicParameters {
  const key = computeKey(model);
  const mood = computeMood(intensity, complexity, momentum);

  const instruments: InstrumentAssignment[] = model.languages.slice(0, 4).map((lang, i) => ({
    language: lang.name,
    instrument: LANGUAGE_INSTRUMENTS[lang.name] ?? 'synth',
    volume: Math.max(0.3, 1 - i * 0.2),
    pan: (i % 2 === 0 ? -1 : 1) * (0.2 + i * 0.1),
  }));

  // Ensure at least one instrument
  if (instruments.length === 0) {
    instruments.push({
      language: 'default',
      instrument: 'synth',
      volume: 0.8,
      pan: 0,
    });
  }

  return {
    key,
    scale: SCALES[key.mode],
    chordProgression: computeChordProgression(mood),
    instruments,
    mood,
  };
}

function computeArtParameters(intensity: number, complexity: number, seed: number): ArtParameters {
  const rng = createSeededRandom(seed);

  // Choose style based on complexity
  const styles: ArtParameters['style'][] = ['constellation', 'flowField', 'circuit', 'nebula'];
  const styleIndex = Math.floor(rng() * styles.length);
  const style = styles[styleIndex] ?? 'constellation';

  return {
    style,
    particleCount: Math.round(500 + intensity * 1500),
    noiseScale: 0.5 + complexity * 0.5,
    glowIntensity: 0.3 + intensity * 0.4,
  };
}

export function computeParameters(model: ActivityModel): UnifiedParameters {
  const seed = createSeedFromUserYear(model.user.login, model.year);
  const intensity = computeIntensity(model);
  const complexity = computeComplexity(model);
  const density = computeDensity(model);
  const momentum = computeMomentum(model);

  const tempo = computeTempo(model);
  const colors = computeColors(model);
  const music = computeMusicParameters(model, intensity, complexity, momentum);
  const art = computeArtParameters(intensity, complexity, seed);

  // Find peaks in activity
  const peaks = model.monthlyActivity
    .filter(m => m.normalizedActivity > 0.7)
    .map(m => ({
      date: `${model.year}-${String(m.month + 1).padStart(2, '0')}-15`,
      commits: m.commits,
      significance: m.normalizedActivity,
    }));

  return {
    seed,
    username: model.user.login,
    year: model.year,
    avatarUrl: model.user.avatarUrl,

    tempo,
    intensity,
    complexity,
    density,
    momentum,
    colors,

    graph: {
      nodeCount: Math.min(model.collaborators.length + 1, 100),
      edgeCount: model.collaborators.reduce((sum, c) => sum + c.interactions, 0),
      clusterCount: Math.ceil(model.languages.length / 2),
    },

    music,
    art,

    timeSeries: {
      monthly: model.monthlyActivity.map(m => ({
        month: m.month,
        commits: m.commits,
        normalizedActivity: m.normalizedActivity,
      })),
      peaks,
    },

    stats: {
      totalCommits: model.totals.commits,
      totalPRs: model.totals.pullRequests,
      activeDays: model.totals.activeDays,
      longestStreak: model.totals.longestStreak,
      topLanguage: model.languages[0]?.name ?? 'Unknown',
      topCollaborator: model.collaborators[0]?.login ?? null,
    },
  };
}
