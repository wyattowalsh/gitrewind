# Git Rewind 2025 — Product Requirements Document

**Domain:** gitrewind.com  
**Tagline:** "Your code. Your story. Your symphony."  
**Version:** 2.0 | December 2025

---

## Executive Summary

Git Rewind transforms a developer's year of GitHub activity into an immersive, multi-sensory experience. Three synchronized outputs—a 3D collaboration constellation, generative music composition, and shader-powered art—are all driven by a single unified parameter engine. The result is a deeply personal, highly shareable "year in review" that feels like magic.

**Key Differentiators:**
- 🎵 **Generative Music** — Your commits become a 90-second original composition
- 🌌 **3D Network Graph** — Your collaborators rendered as an explorable constellation  
- 🎨 **Shader Art** — GPU-powered generative visuals synced to the music
- 🔒 **100% Client-Side** — All processing in-browser, zero data stored
- 💸 **Completely Free** — No backend costs, no premium tiers

---

## Table of Contents

1. [Problem & Opportunity](#1-problem--opportunity)
2. [Solution Overview](#2-solution-overview)
3. [User Journey](#3-user-journey)
4. [System Architecture](#4-system-architecture)
5. [Data Model](#5-data-model)
6. [Unified Parameter Engine](#6-unified-parameter-engine)
7. [Feature Specifications](#7-feature-specifications)
8. [Technical Requirements](#8-technical-requirements)
9. [Privacy & Security](#9-privacy--security)
10. [Implementation Phases](#10-implementation-phases)
11. [Success Metrics](#11-success-metrics)
12. [Appendices](#12-appendices)

---

## 1. Problem & Opportunity

### The Problem
Existing "year in review" tools for developers are underwhelming:
- **GitHub's native stats** — Basic contribution graphs, no narrative
- **GitHub Unwrapped** — Static cards, limited personalization
- **WakaTime** — Time tracking focus, not identity/story

None of these create an *experience*. None make you *feel* something about your year.

### The Opportunity
Developers spend thousands of hours coding. That effort deserves more than a bar chart. Git Rewind turns raw activity data into:
- A **story** (the journey through your year)
- An **identity** (your unique coding fingerprint)
- An **artifact** (something beautiful to share)

### Target Users
- Primary: Active GitHub users (100+ commits/year)
- Secondary: Dev advocates, team leads, content creators
- Tertiary: Anyone curious about their GitHub activity

---

## 2. Solution Overview

### The Three Pillars

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GIT REWIND                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│   │     3D      │    │   MUSIC     │    │    ART      │            │
│   │  NETWORK    │    │   ENGINE    │    │   ENGINE    │            │
│   │             │    │             │    │             │            │
│   │ Force-graph │    │ Tone.js     │    │ WebGL       │            │
│   │ Three.js    │    │ Composition │    │ Shaders     │            │
│   │ Interactive │    │ 90 seconds  │    │ Beat-synced │            │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘            │
│          │                  │                  │                    │
│          └──────────────────┼──────────────────┘                    │
│                             │                                        │
│                    ┌────────▼────────┐                              │
│                    │    UNIFIED      │                              │
│                    │   PARAMETERS    │                              │
│                    │                 │                              │
│                    │ tempo, colors,  │                              │
│                    │ intensity, key, │                              │
│                    │ complexity...   │                              │
│                    └────────┬────────┘                              │
│                             │                                        │
│                    ┌────────▼────────┐                              │
│                    │   ACTIVITY      │                              │
│                    │    MODEL        │                              │
│                    │                 │                              │
│                    │ commits, PRs,   │                              │
│                    │ languages,      │                              │
│                    │ collaborators   │                              │
│                    └────────┬────────┘                              │
│                             │                                        │
│                    ┌────────▼────────┐                              │
│                    │   GITHUB API    │                              │
│                    │   (GraphQL)     │                              │
│                    └─────────────────┘                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### The Magic
One data source → One parameter set → Three synchronized outputs

When your tempo is 120 BPM:
- The music plays at 120 BPM
- The network nodes pulse every 0.5 seconds
- The art particles flow at that rhythm

Everything is connected. Everything is *you*.

---

## 3. User Journey

### Flow Diagram

```
Landing Page          Loading              Experience           Share
    │                    │                     │                  │
    ▼                    ▼                     ▼                  ▼
┌────────┐         ┌──────────┐         ┌───────────┐      ┌─────────┐
│  Hero  │         │ Progress │         │  3-Panel  │      │ Export  │
│        │  ───▶   │          │  ───▶   │   View    │ ───▶ │  Modal  │
│Connect │         │ Fetching │         │           │      │         │
│ GitHub │         │ data...  │         │ Network   │      │ Video   │
│        │         │          │         │ Music     │      │ Audio   │
│        │         │ Building │         │ Art       │      │ Image   │
│        │         │ your     │         │           │      │ Link    │
│        │         │ symphony │         │ Controls  │      │         │
└────────┘         └──────────┘         └───────────┘      └─────────┘
```

### Detailed Steps

1. **Landing Page**
   - Hero with animated preview
   - "Connect GitHub" CTA button
   - Privacy assurance messaging
   - Sample experiences gallery

2. **OAuth Flow**
   - Redirect to GitHub OAuth
   - Minimal scopes: `read:user` only
   - Return with authorization code
   - Exchange for access token (memory only!)

3. **Data Loading**
   - Animated progress indicator
   - Stage-by-stage feedback:
     - "Fetching your profile..."
     - "Analyzing 847 commits..."
     - "Mapping 23 collaborators..."
     - "Composing your symphony..."
   - ~5-10 seconds total

4. **Main Experience**
   - Three-panel layout (responsive)
   - Auto-play music on user interaction
   - Synchronized animations
   - Explore mode after playback

5. **Share & Export**
   - Export video (WebM/MP4)
   - Export audio (WAV)
   - Export image (PNG)
   - Copy shareable URL
   - Social share buttons

---

## 4. System Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 15 (App Router) | RSC, optimal DX, easy deployment |
| Language | TypeScript (strict) | Type safety, better tooling |
| State | Zustand + Immer | Simple, performant, immutable |
| Events | mitt (typed) | Loose coupling between modules |
| 3D | Three.js | Industry standard, huge ecosystem |
| Audio | Tone.js | High-level Web Audio API |
| Shaders | GLSL (WebGL2) | GPU-accelerated art |
| Validation | Zod | Runtime type safety |
| Styling | Tailwind CSS | Rapid UI development |
| Deployment | Cloudflare Pages | Free, fast, global CDN |

### Module Architecture

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Landing page
│   ├── wrapped/page.tsx      # Main experience
│   ├── r/[id]/page.tsx       # Shared view (from URL params)
│   └── api/auth/github/      # OAuth endpoints
│
├── components/
│   ├── ui/                   # Base components (Button, Dialog, etc.)
│   ├── landing/              # Landing page sections
│   ├── experience/           # Main experience wrapper
│   ├── network/              # 3D network visualization
│   ├── music/                # Audio player & visualizer
│   ├── art/                  # Generative art canvas
│   └── export/               # Export dialogs
│
├── lib/
│   ├── core/
│   │   ├── events.ts         # Typed event bus
│   │   ├── parameters.ts     # Unified parameter computation
│   │   └── capabilities.ts   # Feature detection
│   │
│   ├── data/
│   │   ├── github.ts         # GitHub GraphQL client
│   │   ├── schemas.ts        # Zod validation schemas
│   │   └── transform.ts      # Raw → ActivityModel
│   │
│   ├── network/
│   │   ├── simulation.ts     # Force-directed layout
│   │   └── renderer.ts       # Three.js rendering
│   │
│   ├── music/
│   │   ├── theory.ts         # Scales, chords, progressions
│   │   ├── composer.ts       # Section generation
│   │   ├── instruments.ts    # Synth definitions
│   │   └── player.ts         # Playback control
│   │
│   ├── art/
│   │   ├── shaders/          # GLSL fragment shaders
│   │   └── engine.ts         # WebGL rendering
│   │
│   └── export/
│       ├── video.ts          # MediaRecorder / WebCodecs
│       ├── audio.ts          # WAV export
│       └── share.ts          # URL encoding
│
├── stores/                   # Zustand stores
│   ├── auth.ts
│   ├── data.ts
│   ├── params.ts
│   └── ui.ts
│
├── hooks/                    # React hooks
│   ├── useEventBus.ts
│   └── useParameters.ts
│
└── types/                    # TypeScript definitions
    ├── activity.ts
    ├── parameters.ts
    ├── music.ts
    └── events.ts
```

### Event-Driven Communication

All modules communicate via a typed event bus:

```typescript
// Modules emit and listen to events
eventBus.emit('params:ready', { params });
eventBus.on('music:beat', (beat) => {
  networkRenderer.pulse(beat);
  artEngine.pulse(beat);
});
```

Key event flows:
```
auth:success → data:fetch:start → data:fetch:progress → data:ready
data:ready → params:computing → params:ready
params:ready → music:ready + network:ready + art:ready
music:play → music:beat (repeating) → [all renderers pulse]
music:complete → experience:complete
```

---

## 5. Data Model

### GitHub Data Fetching

**GraphQL Queries Required:**

1. **User Profile**
```graphql
query UserProfile($login: String!) {
  user(login: $login) {
    login
    name
    avatarUrl
    createdAt
    bio
    followers { totalCount }
    following { totalCount }
  }
}
```

2. **Contribution Calendar**
```graphql
query ContributionData($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}
```

3. **Repository & Language Data**
```graphql
query RepositoryContributions($login: String!, $first: Int!, $after: String) {
  user(login: $login) {
    repositoriesContributedTo(
      first: $first
      after: $after
      contributionTypes: [COMMIT, PULL_REQUEST]
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        nameWithOwner
        primaryLanguage { name color }
        stargazerCount
      }
    }
  }
}
```

**Rate Limits:**
- With OAuth token: 5,000 requests/hour
- Typical user fetch: ~10-50 requests
- Can serve ~100+ users/hour comfortably

### Activity Model

```typescript
interface ActivityModel {
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
    busiestDayOfWeek: number;     // 0-6
    busiestHour: number;          // 0-23
    busiestMonth: number;         // 0-11
    consistencyScore: number;     // 0-1
    weekdayVsWeekend: number;     // ratio
  };

  languages: Array<{
    name: string;
    color: string;
    percentage: number;
    commits: number;
  }>;

  collaborators: Array<{
    login: string;
    avatarUrl: string;
    interactions: number;
    sharedRepos: string[];
  }>;

  dailyActivity: Map<string, {
    date: string;
    commits: number;
    level: 0 | 1 | 2 | 3 | 4;
  }>;

  monthlyActivity: Array<{
    month: number;
    commits: number;
    normalizedActivity: number;   // 0-1
  }>;
}
```

---

## 6. Unified Parameter Engine

### The Core Innovation

One parameter set drives ALL outputs. This creates deep coherence between what you see, hear, and feel.

```typescript
interface UnifiedParameters {
  // === IDENTITY ===
  seed: number;              // Deterministic from username+year
  username: string;
  year: number;
  avatarUrl: string;

  // === TEMPORAL ===
  tempo: {
    bpm: number;             // 60-180, from commit frequency
    swing: number;           // 0-0.3, from time variance
    signature: [4, 4];       // Time signature
  };

  // === MAGNITUDE ===
  intensity: number;         // 0-1, from total activity volume
  complexity: number;        // 0-1, from language diversity
  density: number;           // 0-1, from commits per active day
  momentum: number;          // 0-1, from growth trend

  // === VISUAL ===
  colors: {
    primary: HSL;            // From top language
    secondary: HSL;          // From second language
    accent: HSL;             // Triadic complement
    background: HSL;         // Dark desaturated primary
    gradient: HSL[];         // All language colors
  };

  // === GRAPH ===
  graph: {
    nodeCount: number;       // Collaborators + self
    edgeCount: number;       // Interactions
    clusterCount: number;    // Communities detected
  };

  // === MUSICAL ===
  music: {
    key: { root: Note, mode: Mode };
    scale: number[];         // Scale degrees
    chordProgression: Chord[];
    instruments: Map<string, Instrument>;  // language → instrument
    mood: 'uplifting' | 'contemplative' | 'dramatic' | 'dreamy';
  };

  // === ARTISTIC ===
  art: {
    style: 'constellation' | 'flowField' | 'circuit' | 'nebula';
    particleCount: number;
    noiseScale: number;
    glowIntensity: number;
  };

  // === TIME SERIES ===
  timeSeries: {
    monthly: MonthlyData[];  // 12 months
    peaks: Peak[];           // Significant spikes
    valleys: Valley[];       // Quiet periods
  };

  // === DISPLAY STATS ===
  stats: {
    totalCommits: number;
    totalPRs: number;
    activeDays: number;
    longestStreak: number;
    topLanguage: string;
    topCollaborator: string | null;
  };
}
```

### Parameter Computation Rules

```typescript
// TEMPO: Commit frequency → BPM
function computeTempo(model: ActivityModel): number {
  const avgCommitsPerDay = model.totals.commits / 365;
  // Logarithmic mapping: 0.1/day=70bpm, 1/day=90bpm, 5/day=120bpm, 20/day=160bpm
  const bpm = 70 + 90 * Math.log10(1 + avgCommitsPerDay * 2) / Math.log10(50);
  return clamp(Math.round(bpm), 60, 180);
}

// MUSICAL KEY: Additions/deletions ratio → Major/minor
function computeKey(model: ActivityModel): MusicalKey {
  const ratio = model.totals.additions / Math.max(model.totals.deletions, 1);
  
  if (ratio > 2.0) return { root: 'C', mode: 'major' };      // Building
  if (ratio > 1.2) return { root: 'G', mode: 'mixolydian' }; // Growing
  if (ratio > 0.8) return { root: 'D', mode: 'dorian' };     // Balanced
  return { root: 'A', mode: 'minor' };                        // Refactoring
}

// COLORS: Language → Color palette
function computeColors(model: ActivityModel): ColorPalette {
  const primary = hexToHSL(model.languages[0]?.color ?? '#3178c6');
  const secondary = model.languages[1] 
    ? hexToHSL(model.languages[1].color)
    : rotateHue(primary, 60);
  
  return {
    primary,
    secondary,
    accent: rotateHue(primary, 180),
    background: { h: primary.h, s: 15, l: 8 },
    gradient: model.languages.map(l => hexToHSL(l.color)),
  };
}

// INTENSITY: Total activity → 0-1 scale
function computeIntensity(model: ActivityModel): number {
  // Percentile-based: 500 commits = 0.5, 2000 commits = 0.9
  const commits = model.totals.commits;
  return clamp(Math.log10(commits + 1) / Math.log10(5000), 0, 1);
}

// COMPLEXITY: Language diversity → 0-1
function computeComplexity(model: ActivityModel): number {
  // Shannon entropy of language distribution
  const total = model.languages.reduce((sum, l) => sum + l.percentage, 0);
  const entropy = -model.languages.reduce((sum, l) => {
    const p = l.percentage / total;
    return p > 0 ? sum + p * Math.log2(p) : sum;
  }, 0);
  const maxEntropy = Math.log2(model.languages.length || 1);
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}
```

### Language → Instrument Mapping

| Language | Instrument | Rationale |
|----------|------------|-----------|
| TypeScript | Synth | Clean, modern, typed |
| JavaScript | Electric Piano | Ubiquitous, versatile |
| Python | Acoustic Piano | Readable, classic |
| Rust | Cello | Deep, powerful, precise |
| Go | Bass | Simple, foundational |
| Java | Organ | Enterprise, established |
| C/C++ | Brass | Low-level, powerful |
| Ruby | Guitar | Expressive, elegant |
| Swift | Bells | Bright, Apple-crisp |
| Kotlin | Marimba | Modern, playful |

---

## 7. Feature Specifications

### 7.1 3D Network Constellation

**Description:** An interactive force-directed graph where nodes represent collaborators and edges represent interactions.

**Technical Implementation:**
- Custom Barnes-Hut force simulation (O(n log n))
- Three.js with InstancedMesh for performance
- Post-processing bloom effect for glow
- Orbit controls with auto-rotate when idle

**Visual Design:**
- User node at center (larger, highlighted)
- Collaborator nodes sized by interaction count
- Edges weighted by collaboration frequency
- Colors from language palette
- Subtle particle effects along edges

**Interactions:**
- Orbit (drag to rotate)
- Zoom (scroll)
- Hover nodes for tooltip (username, interaction count)
- Click node to highlight connections

**Beat Synchronization:**
- Nodes pulse on beat (scale 1.0 → 1.1 → 1.0)
- Edge particles speed up with tempo
- Glow intensity follows music energy

**Acceptance Criteria:**
- [ ] Renders 100+ nodes at 60fps
- [ ] Loads in <2 seconds
- [ ] Responsive from mobile to 4K
- [ ] Accessible (keyboard navigation, screen reader labels)

### 7.2 Generative Music Engine

**Description:** A 90-second original composition generated from your GitHub activity.

**Composition Structure:**

```
0s          15s         45s         65s         80s         90s
│───────────│───────────│───────────│───────────│───────────│
   INTRO       VERSE        CHORUS      BRIDGE      OUTRO
   
   Ambient     Monthly      Collab      Peak        Resolve
   pad         themes       polyphony   climax      to tonic
   builds      12 phrases   intensity   busiest     fade out
```

**Section Details:**

| Section | Duration | Musical Content | Data Mapping |
|---------|----------|-----------------|--------------|
| Intro | 0-15s | Ambient pad, sparse bells | Slow build, half tempo |
| Verse | 15-45s | Melodic phrases | Each month = 2.5s phrase, activity → note density |
| Chorus | 45-65s | Full instrumentation | Collaborator count → polyphony |
| Bridge | 65-80s | Climactic build | Peak activity week featured |
| Outro | 80-90s | Resolution | Return to tonic, fade |

**Technical Implementation:**
- Tone.js for synthesis and scheduling
- Transport for tempo sync
- Custom instruments per language
- Effects chain: EQ → Compressor → Reverb → Limiter

**Music Theory:**
- Key determined by additions/deletions ratio
- Scale: major, minor, dorian, mixolydian, or pentatonic
- Chord progressions:
  - Uplifting: I → V → vi → IV
  - Contemplative: vi → IV → I → V
  - Dramatic: i → iv → V → i

**Playback Controls:**
- Play / Pause
- Seek (progress bar)
- Volume
- Mute

**Acceptance Criteria:**
- [ ] Plays without audio glitches
- [ ] Sounds recognizably musical
- [ ] Same data → same composition (deterministic)
- [ ] Graceful handling of Web Audio restrictions

### 7.3 Generative Art Canvas

**Description:** Real-time GPU-rendered visuals that pulse with the music.

**Art Styles:**

| Style | Description | Best For |
|-------|-------------|----------|
| Constellation | Stars connected by lines | Default, space-themed |
| Flow Field | Particles following Perlin noise | Organic, fluid feel |
| Circuit | PCB-inspired patterns | Technical, precise |
| Nebula | Volumetric clouds | Dreamy, ambient |

**Technical Implementation:**
- WebGL2 with custom GLSL shaders
- Full-screen quad rendering
- Uniforms: time, beat, intensity, colors, seed
- 60fps target

**Beat Synchronization:**
- `u_beat` uniform pulses 0→1→0 on each beat
- Particle brightness increases
- Connection lines thicken
- Subtle camera shake on downbeat

**Shader Uniforms:**
```glsl
uniform float u_time;           // Elapsed time
uniform float u_beat;           // 0-1, peaks on beat
uniform float u_intensity;      // Overall activity level
uniform float u_complexity;     // Language diversity
uniform vec2 u_resolution;      // Canvas size
uniform vec3 u_primaryColor;    // RGB 0-1
uniform vec3 u_secondaryColor;
uniform float u_seed;           // For deterministic randomness
```

**Acceptance Criteria:**
- [ ] 60fps on mid-range hardware
- [ ] Visually distinct per user (seed-based)
- [ ] Smooth transitions between beats
- [ ] Exports cleanly to video

### 7.4 Export & Sharing

**Export Formats:**

| Format | Method | Quality |
|--------|--------|---------|
| Video (WebM) | MediaRecorder | 1080p @ 30fps |
| Video (MP4) | WebCodecs (if available) | 1080p @ 60fps |
| Audio (WAV) | Tone.js Recorder | 44.1kHz stereo |
| Image (PNG) | Canvas.toBlob | Up to 4K |
| Shareable URL | LZ-String compression | ~100 chars |

**Shareable URL Structure:**
```
https://gitrewind.com/r/[compressed-params]

Params encoded:
- u: username
- y: year  
- s: seed
- t: tempo
- i: intensity
- c: complexity
- p: primary color (hex)
- k: musical key
- a: art style
- stats: commits, days, top language
```

**Social Sharing:**
- Twitter: Pre-filled tweet with stats + link
- LinkedIn: Professional summary format
- Copy Link: One-click clipboard
- Open Graph meta tags for rich previews

**Acceptance Criteria:**
- [ ] Video export works in Chrome, Firefox, Safari
- [ ] Shareable URLs reconstruct full experience
- [ ] Social previews show personalized OG image
- [ ] Export progress shows clear feedback

---

## 8. Technical Requirements

### Performance Budgets

| Metric | Target | Priority |
|--------|--------|----------|
| First Contentful Paint | <1.5s | P0 |
| Time to Interactive | <3.5s | P0 |
| Data Fetch Time | <5s | P0 |
| Bundle Size (gzipped) | <400KB | P0 |
| Animation FPS | 60fps | P0 |
| Memory Usage | <256MB | P1 |

### Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 100+ | Full support |
| Firefox | 100+ | Full support |
| Safari | 15.4+ | WebGL2 required |
| Edge | 100+ | Full support |
| Mobile Safari | iOS 15+ | Touch controls |
| Chrome Android | 100+ | Touch controls |

### Accessibility Requirements

- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all controls
- Screen reader announcements for state changes
- Reduced motion support (respect `prefers-reduced-motion`)
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators on all interactive elements

### Error Handling

| Error Type | User Experience |
|------------|-----------------|
| OAuth failure | Clear message, retry button |
| API rate limit | Queue with ETA, or graceful fallback |
| WebGL not supported | Fallback to 2D canvas or static image |
| Audio blocked | Clear prompt to enable, continue without |
| Export failure | Retry option, alternative format suggestion |

---

## 9. Privacy & Security

### Data Access

**What We Access:**
- ✅ Public profile (username, avatar, bio)
- ✅ Contribution counts (commits, PRs, reviews)
- ✅ Repository names and languages
- ✅ Collaborator usernames (from public interactions)

**What We NEVER Access:**
- ❌ Source code or file contents
- ❌ Private repository details
- ❌ Commit messages
- ❌ Email addresses
- ❌ OAuth tokens (beyond session memory)

### Token Handling

```typescript
// CRITICAL: Token lives ONLY in memory
const useAuthStore = create((set) => ({
  token: null,  // Never persisted to localStorage/cookies
}));

// Token is cleared:
// - On page close/refresh
// - On explicit logout
// - After 1 hour (session timeout)
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
];
```

### Privacy Messaging

Prominent display on landing page:
> "Your data never leaves your browser. We don't store anything. Your OAuth token exists only in memory and is cleared when you close the page. This is open source—verify it yourself."

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Core infrastructure, data pipeline working

- [ ] Project setup (Next.js 15, TypeScript strict, Tailwind)
- [ ] Typed event bus implementation
- [ ] Zustand stores (auth, data, params, ui)
- [ ] GitHub OAuth flow (initiate, callback, token handling)
- [ ] GitHub GraphQL client with pagination
- [ ] Data fetching with progress events
- [ ] ActivityModel transformer
- [ ] Unified parameter computation
- [ ] Landing page UI
- [ ] Loading/progress screen

**Deliverable:** Can authenticate, fetch data, compute parameters

### Phase 2: Network Visualization (Week 3)
**Goal:** Interactive 3D collaboration graph

- [ ] Force simulation engine (Barnes-Hut)
- [ ] Three.js scene setup (camera, lights, controls)
- [ ] Instanced node rendering
- [ ] Edge rendering with particles
- [ ] Post-processing (bloom)
- [ ] Hover interactions and tooltips
- [ ] Beat pulse synchronization
- [ ] Performance optimization

**Deliverable:** Beautiful, interactive 3D network

### Phase 3: Music Engine (Week 4-5)
**Goal:** Generative 90-second composition

- [ ] Music theory module (scales, chords, progressions)
- [ ] Instrument factory (synth definitions per language)
- [ ] Composer class with section generators
- [ ] Intro section (ambient build)
- [ ] Verse section (monthly phrases)
- [ ] Chorus section (collaboration polyphony)
- [ ] Bridge section (peak climax)
- [ ] Outro section (resolution)
- [ ] Playback controls UI
- [ ] Beat event emission
- [ ] Audio export

**Deliverable:** Unique, musical composition for each user

### Phase 4: Generative Art (Week 6)
**Goal:** Shader-powered synchronized visuals

- [ ] WebGL2 setup and shader framework
- [ ] Constellation style shader
- [ ] Flow Field style shader
- [ ] Beat synchronization via uniforms
- [ ] Color palette integration
- [ ] Style switcher UI
- [ ] Image export

**Deliverable:** GPU-rendered art synced to music

### Phase 5: Export & Sharing (Week 7)
**Goal:** Video export and shareable links

- [ ] MediaRecorder video export
- [ ] WebCodecs export (progressive enhancement)
- [ ] Canvas compositing for video
- [ ] Shareable URL encoding/decoding
- [ ] Shared view page (reconstructs from URL)
- [ ] Social share buttons
- [ ] Open Graph meta tags
- [ ] Export progress UI

**Deliverable:** Full sharing capabilities

### Phase 6: Polish & Launch (Week 8)
**Goal:** Production-ready quality

- [ ] Performance optimization pass
- [ ] Bundle size optimization
- [ ] Accessibility audit and fixes
- [ ] Mobile responsiveness testing
- [ ] Error boundary implementation
- [ ] Loading state polish
- [ ] Documentation (README, contributing)
- [ ] CI/CD setup (GitHub Actions)
- [ ] Cloudflare Pages deployment
- [ ] Domain setup (gitrewind.com)
- [ ] Final QA testing
- [ ] Launch! 🚀

---

## 11. Success Metrics

### Launch Goals (Week 1 Post-Launch)

| Metric | Target |
|--------|--------|
| Unique visitors | 10,000+ |
| Completed experiences | 5,000+ |
| Shares (any format) | 1,000+ |
| Average session duration | >2 minutes |
| Error rate | <1% |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Performance | >90 |
| Lighthouse Accessibility | >95 |
| Core Web Vitals | All green |
| Crash-free sessions | >99.5% |

### User Satisfaction Signals

- Social media sentiment (positive mentions)
- Return visits (users checking others' Rewinds)
- Organic sharing (non-prompted)
- Feature requests (engagement signal)

---

## 12. Appendices

### A. Language Color Reference

```typescript
const LANGUAGE_COLORS = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};
```

### B. Musical Scale Reference

```typescript
const SCALES = {
  major:       [0, 2, 4, 5, 7, 9, 11],
  minor:       [0, 2, 3, 5, 7, 8, 10],
  dorian:      [0, 2, 3, 5, 7, 9, 10],
  mixolydian:  [0, 2, 4, 5, 7, 9, 10],
  pentatonic:  [0, 2, 4, 7, 9],
};

const CHORD_TYPES = {
  maj:  [0, 4, 7],
  min:  [0, 3, 7],
  dim:  [0, 3, 6],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
};
```

### C. Environment Variables

```env
# Required
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=https://gitrewind.com

# Optional
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=gitrewind.com
```

### D. GitHub OAuth App Setup

1. Go to GitHub Developer Settings
2. Click "New OAuth App"
3. Fill in:
   - **Name:** Git Rewind
   - **Homepage:** https://gitrewind.com
   - **Callback:** https://gitrewind.com/api/auth/github/callback
4. Copy Client ID and Secret to environment variables

---

*Git Rewind: Your code. Your story. Your symphony.*
