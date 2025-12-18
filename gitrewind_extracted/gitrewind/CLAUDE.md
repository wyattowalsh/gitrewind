# CLAUDE.md — Git Rewind Project Instructions

> **Read this file first.** It contains everything you need to understand and extend Git Rewind.

---

## Project Summary

**Git Rewind** transforms a developer's GitHub activity into a multi-sensory experience: 3D network visualization, generative music, and shader-powered art—all synchronized via a unified parameter engine.

**Domain:** gitrewind.com
**PRD:** `docs/PRD.md` (read this for full specifications)

---

## Current Project Status

| Phase | Status | Completion |
|-------|--------|------------|
| 1. Foundation | Complete | 100% |
| 2. Network | Complete | 100% |
| 3. Music | Complete | 100% |
| 4. Art | Complete | 100% |
| 5. Export | Partial | 70% |
| 6. Polish | Complete | 90% |

**Total Lines of Code:** ~5,500+ TypeScript

### What's Working
- OAuth authentication with GitHub
- GitHub data fetching and transformation
- Parameter computation from activity data
- 3D network visualization with Three.js (hover, click, tooltips)
- Force-directed graph simulation
- Generative music with Tone.js (5 sections, beat-reactive)
- 4 shader styles (constellation, flowField, circuit, nebula)
- Beat synchronization across all visual components
- Share functionality (URL encoding with LZ-string compression)
- Toast notification system
- Mobile-responsive UI
- Keyboard shortcuts

### What Needs Work
- Video export (MediaRecorder present but not connected to UI)
- Audio export (not implemented)
- Settings modal (button exists, no dialog)
- Collaborator data in network graph (currently shows only user node)

---

## Critical Rules (Never Violate)

### 1. PRIVACY: Tokens in Memory Only

```typescript
// CORRECT — Token in Zustand store (memory)
const useAuthStore = create((set) => ({
  token: null, // This is fine
}));

// FORBIDDEN — Never persist tokens
localStorage.setItem('token', token);    // NEVER
sessionStorage.setItem('token', token);  // NEVER
document.cookie = `token=${token}`;      // NEVER
```

**Why:** Users trust us with OAuth access. Tokens must only exist in memory and clear on page close.

### 2. TYPE SAFETY: No `any`

```typescript
// CORRECT
function processData(data: unknown): ActivityModel {
  return ActivityModelSchema.parse(data);
}

// FORBIDDEN
function processData(data: any) { }  // Never use 'any'
```

**Configure:** `tsconfig.json` must have `"strict": true` and `"noUncheckedIndexedAccess": true`

### 3. EVENT-DRIVEN: Loose Coupling

```typescript
// CORRECT — Modules communicate via events
eventBus.emit('params:ready', { params });
eventBus.on('music:beat', handleBeat);

// FORBIDDEN — Direct cross-module state imports
import { musicState } from '../music/store';  // Don't do this
```

**Why:** Event-driven architecture allows modules to be independent and testable.

### 4. FREE TIER: No Paid Services

- GitHub API: 5,000 req/hr (OAuth)
- Cloudflare Pages: Unlimited bandwidth
- No paid APIs, no backend database, no server costs

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15.x (App Router) |
| Language | TypeScript | 5.3+ (strict mode) |
| State | Zustand + Immer | 5.x |
| Events | mitt | 3.x (with typed wrapper) |
| 3D | Three.js | r168+ |
| Audio | Tone.js | 15.x |
| Shaders | GLSL | WebGL2 / ES 3.0 |
| Validation | Zod | 3.x |
| Styling | Tailwind CSS | 3.4+ |
| Icons | Lucide React | Latest |

---

## Project Structure

```
gitrewind/
├── docs/
│   └── PRD.md              # Full product requirements
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx        # Landing page
│   │   ├── wrapped/        # Main experience
│   │   │   └── page.tsx
│   │   ├── r/[id]/         # Shared view (URL params)
│   │   │   └── page.tsx
│   │   ├── globals.css     # Tailwind + custom styles
│   │   └── api/
│   │       └── auth/github/
│   │           ├── route.ts           # Initiate OAuth
│   │           └── callback/route.ts  # Handle callback
│   │
│   ├── components/
│   │   ├── ui/             # Button, Progress, ErrorBoundary, Toast
│   │   ├── landing/        # Hero, Features, CTA
│   │   ├── experience/     # ExperienceView, StatsPanel, Controls, LoadingScreen
│   │   ├── network/        # NetworkVisualization (with tooltips)
│   │   ├── music/          # MusicPlayer (with sections)
│   │   ├── art/            # ArtCanvas
│   │   └── export/         # ExportDialog, ShareDialog
│   │
│   ├── lib/
│   │   ├── core/
│   │   │   ├── events.ts       # Typed event bus (mitt wrapper)
│   │   │   └── parameters.ts   # UnifiedParameters computation
│   │   ├── data/
│   │   │   ├── github.ts       # GraphQL client
│   │   │   ├── schemas.ts      # Zod schemas
│   │   │   └── transform.ts    # Raw → ActivityModel
│   │   ├── network/
│   │   │   ├── simulation.ts   # Force-directed layout
│   │   │   └── renderer.ts     # Three.js rendering + raycasting
│   │   ├── music/
│   │   │   ├── theory.ts       # Scales, chords, melody
│   │   │   ├── composer.ts     # Section generation
│   │   │   ├── instruments.ts  # Synth presets
│   │   │   └── player.ts       # Playback control
│   │   ├── art/
│   │   │   ├── shaders/        # .frag files (4 styles)
│   │   │   │   ├── constellation.frag
│   │   │   │   ├── flowField.frag
│   │   │   │   ├── circuit.frag
│   │   │   │   └── nebula.frag
│   │   │   └── engine.ts       # WebGL rendering
│   │   ├── export/
│   │   │   ├── video.ts        # MediaRecorder
│   │   │   ├── image.ts        # PNG export
│   │   │   └── share.ts        # URL encoding (LZ-string)
│   │   └── utils/
│   │       ├── random.ts       # Seeded random (mulberry32)
│   │       ├── color.ts        # HSL utilities
│   │       └── math.ts         # clamp, lerp, etc.
│   │
│   ├── stores/             # Zustand stores
│   │   ├── auth.ts         # Token (memory only!), user
│   │   ├── data.ts         # Progress, status, model
│   │   ├── params.ts       # UnifiedParameters cache
│   │   ├── ui.ts           # Modals, theme, playback state
│   │   └── toast.ts        # Toast notifications
│   │
│   ├── hooks/              # React hooks
│   │   ├── index.ts
│   │   ├── useEventBus.ts
│   │   ├── useParameters.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   └── types/              # TypeScript definitions
│       ├── activity.ts     # ActivityModel
│       ├── parameters.ts   # UnifiedParameters
│       ├── graph.ts        # GraphNode, GraphEdge
│       └── events.ts       # EventMap
│
├── public/
│   └── og/                 # Open Graph images
│
├── CLAUDE.md               # This file
├── TASKS.md                # Implementation checklist
├── README.md               # Project overview
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Key Implementation Patterns

### Event Bus Usage

```typescript
// src/lib/core/events.ts - Already implemented
import { eventBus } from '@/lib/core/events';

// Emitting events
eventBus.emit('music:beat', { beat: 1, measure: 0, subdivision: 0, time: 0 });
eventBus.emit('network:node:hover', { node: graphNode });

// Subscribing (returns unsubscribe function)
const unsubscribe = eventBus.on('music:beat', (data) => {
  setBeatPulse(1);
  setTimeout(() => setBeatPulse(0), 100);
});

// Cleanup in useEffect
useEffect(() => {
  const unsub = eventBus.on('music:beat', handleBeat);
  return unsub;
}, []);
```

### Toast Notifications

```typescript
import { toast } from '@/stores';

// Show notifications
toast.success('Copied!', 'Share link copied to clipboard');
toast.error('Export failed', 'Could not generate video');
toast.info('Tip', 'Use keyboard shortcuts for quick controls');
toast.warning('Heads up', 'Large file export may take a while');
```

### Keyboard Shortcuts

Already implemented in `useKeyboardShortcuts.ts`:
- `Space` - Play/Pause
- `Tab` - Toggle view (Network/Art)
- `M` - Mute/Unmute
- `S` - Share
- `E` - Export

### Beat-Reactive Components

```typescript
// Subscribe to beats and create pulse effect
const [beatPulse, setBeatPulse] = useState(0);

useEffect(() => {
  const unsubscribe = eventBus.on('music:beat', () => {
    setBeatPulse(1);
    setTimeout(() => setBeatPulse(0), 100);
  });
  return unsubscribe;
}, []);

// Apply to styles
style={{
  transform: `scale(${1 + beatPulse * 0.05})`,
  boxShadow: beatPulse > 0 ? `0 0 20px ${primaryColor}` : 'none',
}}
```

### Three.js Resource Cleanup

```typescript
// ALWAYS dispose resources in destroy/cleanup
destroy(): void {
  // Remove event listeners
  window.removeEventListener('resize', this.handleResize);
  this.renderer.domElement.removeEventListener('mousemove', this.handleMouseMove);

  // Dispose Three.js resources
  if (this.nodesMesh) {
    this.nodesMesh.geometry.dispose();
    (this.nodesMesh.material as THREE.Material).dispose();
  }

  // Dispose controls and renderer
  this.controls.dispose();
  this.renderer.dispose();

  // Remove DOM element
  if (this.renderer.domElement.parentElement) {
    this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
  }
}
```

---

## Music Sections

The composition is divided into 5 sections (90 seconds total):

| Section | Duration | Start | Character |
|---------|----------|-------|-----------|
| Intro | 15s | 0:00 | Ambient pad, sparse bells |
| Verse | 30s | 0:15 | Monthly activity translated to melody |
| Chorus | 20s | 0:45 | Full instrumentation, collaborator-driven polyphony |
| Bridge | 15s | 1:05 | Peak activity highlight, building intensity |
| Outro | 10s | 1:20 | Return to pad, fade out |

Each section emits `music:section` events that can be used for UI transitions.

---

## Shader Uniforms

All 4 shaders use consistent uniforms:

```glsl
uniform float u_time;          // Elapsed seconds
uniform float u_beat;          // 0-1 pulse on beat
uniform float u_intensity;     // Activity intensity (0-1)
uniform float u_complexity;    // Language diversity (0-1)
uniform float u_momentum;      // Activity momentum
uniform vec2 u_resolution;     // Canvas size
uniform vec3 u_primaryColor;   // HSL converted to RGB
uniform vec3 u_secondaryColor; // HSL converted to RGB
uniform float u_seed;          // For deterministic randomness
```

---

## Common Pitfalls

| Don't | Do |
|-------|-----|
| Store tokens in localStorage | Keep in Zustand (memory only) |
| Use `any` type | Use `unknown` + Zod validation |
| Import state across modules | Use event bus |
| Forget to dispose Three.js | Always cleanup in useEffect return |
| Start audio without gesture | Require user click first |
| Hardcode colors | Derive from UnifiedParameters |
| Block main thread | Use requestAnimationFrame, throttle |
| Skip loading states | Show progress for all async ops |
| Use alert() for errors | Use toast notification system |

---

## Environment Variables

Required in `.env.local`:

```bash
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Or production URL
```

---

## Commands

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint check
npm run typecheck  # TypeScript strict check
```

---

## Performance Guidelines

- Bundle size target: < 400KB gzipped
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Animation: Maintain 60fps
- Memory: < 256MB
- All Three.js resources disposed on unmount
- Shader uniforms updated efficiently (not every frame)

---

## Adding New Features

### New Shader Style

1. Create `src/lib/art/shaders/newStyle.frag`
2. Import in `src/lib/art/engine.ts` and add to `SHADERS` object
3. Add to `ArtStyle` type in `src/types/events.ts`
4. Add to `ART_STYLES` array in `ExperienceView.tsx`

### New Instrument

1. Add instrument config in `src/lib/music/instruments.ts`
2. Map to a language in `src/lib/core/parameters.ts`
3. Use in composition sections in `src/lib/music/composer.ts`

### New Event Type

1. Add to `EventMap` in `src/types/events.ts`
2. Emit with `eventBus.emit('new:event', data)`
3. Subscribe with `eventBus.on('new:event', handler)`

---

## Session Notes

> Update this section at the end of each coding session.

**Current State:** Application fully functional
**Last Updated:** Phase 6 polish complete
**Remaining Work:**
- Connect video export to canvas streams
- Implement audio export (Tone.js Recorder)
- Create settings modal
- Add collaborator data to network graph

**Recent Additions:**
- Network node hover interactions with raycasting
- Animated stats panel with counting animations
- Music section indicators with visual timeline
- Toast notification system
- Mobile responsiveness improvements
- Enhanced loading screen animations

---

*When in doubt, refer to `docs/PRD.md` for detailed specifications.*
