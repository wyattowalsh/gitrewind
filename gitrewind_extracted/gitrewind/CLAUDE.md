# CLAUDE.md — Git Rewind Project Instructions

> **Read this file first.** It contains everything you need to build Git Rewind correctly.

---

## Project Summary

**Git Rewind** transforms a developer's GitHub activity into a multi-sensory experience: 3D network visualization, generative music, and shader-powered art—all synchronized via a unified parameter engine.

**Domain:** gitrewind.com  
**PRD:** `docs/PRD.md` (read this for full specifications)

---

## 🚨 Critical Rules (Never Violate)

### 1. PRIVACY: Tokens in Memory Only

```typescript
// ✅ CORRECT — Token in Zustand store (memory)
const useAuthStore = create((set) => ({
  token: null, // This is fine
}));

// ❌ FORBIDDEN — Never persist tokens
localStorage.setItem('token', token);    // NEVER
sessionStorage.setItem('token', token);  // NEVER
document.cookie = `token=${token}`;      // NEVER
```

**Why:** Users trust us with OAuth access. Tokens must only exist in memory and clear on page close.

### 2. TYPE SAFETY: No `any`

```typescript
// ✅ CORRECT
function processData(data: unknown): ActivityModel {
  return ActivityModelSchema.parse(data);
}

// ❌ FORBIDDEN
function processData(data: any) { }  // Never use 'any'
```

**Configure:** `tsconfig.json` must have `"strict": true` and `"noUncheckedIndexedAccess": true`

### 3. EVENT-DRIVEN: Loose Coupling

```typescript
// ✅ CORRECT — Modules communicate via events
eventBus.emit('params:ready', { params });
eventBus.on('music:beat', handleBeat);

// ❌ FORBIDDEN — Direct cross-module state imports
import { musicState } from '../music/store';  // Don't do this
```

**Why:** Event-driven architecture allows modules to be independent and testable.

### 4. FREE TIER: No Paid Services

- GitHub API: 5,000 req/hr (OAuth) ✅
- Cloudflare Pages: Unlimited bandwidth ✅
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

---

## Project Structure

```
gitrewind/
├── docs/
│   └── PRD.md              # Full product requirements (READ THIS)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx        # Landing page
│   │   ├── wrapped/        # Main experience
│   │   │   └── page.tsx
│   │   ├── r/[id]/         # Shared view (URL params)
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── auth/github/
│   │           ├── route.ts           # Initiate OAuth
│   │           └── callback/route.ts  # Handle callback
│   │
│   ├── components/
│   │   ├── ui/             # Button, Dialog, Progress, etc.
│   │   ├── landing/        # Hero, Features, CTA
│   │   ├── experience/     # Main experience wrapper
│   │   ├── network/        # NetworkVisualization component
│   │   ├── music/          # MusicPlayer component
│   │   ├── art/            # ArtCanvas component
│   │   └── export/         # ExportDialog, ShareDialog
│   │
│   ├── lib/
│   │   ├── core/
│   │   │   ├── events.ts       # Typed event bus
│   │   │   └── parameters.ts   # Unified param computation
│   │   ├── data/
│   │   │   ├── github.ts       # GraphQL client
│   │   │   ├── schemas.ts      # Zod schemas
│   │   │   └── transform.ts    # Raw → ActivityModel
│   │   ├── network/
│   │   │   ├── simulation.ts   # Force-directed layout
│   │   │   └── renderer.ts     # Three.js rendering
│   │   ├── music/
│   │   │   ├── theory.ts       # Scales, chords
│   │   │   ├── composer.ts     # Section generation
│   │   │   ├── instruments.ts  # Synth presets
│   │   │   └── player.ts       # Playback control
│   │   ├── art/
│   │   │   ├── shaders/        # .frag files
│   │   │   └── engine.ts       # WebGL rendering
│   │   ├── export/
│   │   │   ├── video.ts        # MediaRecorder
│   │   │   ├── audio.ts        # WAV export
│   │   │   └── share.ts        # URL encoding
│   │   └── utils/
│   │       ├── random.ts       # Seeded random
│   │       ├── color.ts        # HSL utilities
│   │       └── math.ts         # clamp, lerp, etc.
│   │
│   ├── stores/             # Zustand stores
│   │   ├── auth.ts
│   │   ├── data.ts
│   │   ├── params.ts
│   │   └── ui.ts
│   │
│   ├── hooks/              # React hooks
│   │   ├── useEventBus.ts
│   │   └── useParameters.ts
│   │
│   └── types/              # TypeScript definitions
│       ├── activity.ts
│       ├── parameters.ts
│       ├── music.ts
│       └── events.ts
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

### Event Bus

```typescript
// src/lib/core/events.ts
import mitt from 'mitt';
import type { EventMap } from '@/types/events';

const emitter = mitt<EventMap>();

export const eventBus = {
  on: <K extends keyof EventMap>(
    event: K, 
    handler: (data: EventMap[K]) => void
  ) => {
    emitter.on(event, handler);
    return () => emitter.off(event, handler); // Return unsubscribe
  },
  emit: emitter.emit.bind(emitter),
  off: emitter.off.bind(emitter),
};
```

### Zustand Store

```typescript
// src/stores/auth.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  token: string | null;  // MEMORY ONLY
  user: User | null;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    status: 'idle',
    token: null,
    user: null,
    
    setAuthenticated: (token: string, user: User) => 
      set({ status: 'authenticated', token, user }),
    
    logout: () => 
      set({ status: 'idle', token: null, user: null }),
  }))
);
```

### Component with Event Subscription

```typescript
// src/components/network/NetworkVisualization.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useEventBus } from '@/hooks/useEventBus';
import { NetworkRenderer } from '@/lib/network/renderer';

export function NetworkVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<NetworkRenderer | null>(null);

  // Initialize renderer
  useEffect(() => {
    if (!containerRef.current) return;
    
    const renderer = new NetworkRenderer(containerRef.current);
    rendererRef.current = renderer;
    
    // Animation loop
    let running = true;
    const animate = () => {
      if (!running) return;
      renderer.update();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      running = false;
      renderer.destroy(); // Clean up Three.js resources!
    };
  }, []);

  // Subscribe to beat events
  useEventBus('music:beat', (beat) => {
    rendererRef.current?.pulse(beat);
  });

  return <div ref={containerRef} className="w-full h-full" />;
}
```

### Seeded Random (Deterministic)

```typescript
// src/lib/utils/random.ts
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Same seed = same sequence, every time
const rng = createSeededRandom(12345);
rng(); // Always 0.4827...
rng(); // Always 0.9134...
```

---

## GitHub API Notes

### Authentication Flow

```
1. User clicks "Connect GitHub"
2. Redirect to: github.com/login/oauth/authorize?client_id=XXX&scope=read:user
3. GitHub redirects to: gitrewind.com/api/auth/github/callback?code=XXX
4. Server exchanges code for token (POST github.com/login/oauth/access_token)
5. Return token to client (store in memory only!)
```

### Rate Limits

- **With OAuth token:** 5,000 requests/hour
- **Typical user fetch:** 10-50 requests
- **Safe capacity:** ~100 users/hour

### Required Scopes

Only `read:user` is needed. We access:
- Public profile info
- Contribution statistics (public)
- Repository metadata (public)

We do NOT access:
- Source code
- Private repos
- Commit messages
- Emails

---

## Audio Implementation Notes

### Web Audio Requires User Gesture

```typescript
// ❌ WRONG — Will fail (no user gesture)
useEffect(() => {
  Tone.start(); // Error: AudioContext not allowed
}, []);

// ✅ CORRECT — Start on user click
const handlePlay = async () => {
  await Tone.start(); // Works inside click handler
  player.play();
};
```

### Tone.js Transport

```typescript
// Set tempo from parameters
Tone.Transport.bpm.value = params.tempo.bpm;

// Schedule events
Tone.Transport.scheduleRepeat((time) => {
  // This fires every beat
  eventBus.emit('music:beat', { beat: currentBeat, time });
}, '4n'); // Quarter note

// Start playback
Tone.Transport.start();
```

---

## Shader Implementation Notes

### Basic Setup

```typescript
// WebGL2 full-screen quad rendering
const material = new THREE.ShaderMaterial({
  uniforms: {
    u_time: { value: 0 },
    u_beat: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_primaryColor: { value: new THREE.Vector3() },
  },
  vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
  fragmentShader: constellationShader,
});
```

### Beat Synchronization

```glsl
// In fragment shader
uniform float u_beat; // 0-1, peaks on beat

void main() {
  // Pulse effect on beat
  float pulse = 1.0 + u_beat * 0.3;
  float brightness = baseBrightness * pulse;
  // ...
}
```

---

## Common Pitfalls

| ❌ Don't | ✅ Do |
|---------|-------|
| Store tokens in localStorage | Keep in Zustand (memory only) |
| Use `any` type | Use `unknown` + Zod validation |
| Import state across modules | Use event bus |
| Forget to dispose Three.js | Always cleanup in useEffect return |
| Start audio without gesture | Require user click first |
| Hardcode colors | Derive from UnifiedParameters |
| Block main thread | Use Web Workers for heavy compute |
| Skip loading states | Show progress for all async ops |

---

## Performance Checklist

- [ ] Bundle size < 400KB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Animation maintains 60fps
- [ ] Memory usage < 256MB
- [ ] All Three.js resources disposed on unmount
- [ ] Heavy computation in Web Workers

---

## Testing Strategy

### Unit Tests (Vitest)
- Parameter computation functions
- Music theory utilities
- Color conversion functions
- Data transformers

### Integration Tests
- Data pipeline (fetch → transform → params)
- Event bus communication
- Store state transitions

### E2E Tests (Playwright)
- Full OAuth flow (mocked)
- Experience playback
- Export functionality
- Shared URL reconstruction

---

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript strict check
npm test           # Unit tests
npm run test:e2e   # E2E tests
```

---

## Implementation Order

Follow `TASKS.md` phases in order:

1. **Foundation** — Event bus, stores, OAuth, data fetching, parameters
2. **Network** — Force simulation, Three.js rendering, interactions
3. **Music** — Theory module, instruments, composer, playback
4. **Art** — Shader framework, styles, beat sync
5. **Export** — Video, audio, shareable URLs
6. **Polish** — Performance, accessibility, mobile, deployment

---

## Quick Reference

### Key Files to Read First
1. `docs/PRD.md` — Full specifications
2. `TASKS.md` — Implementation checklist
3. This file (`CLAUDE.md`)

### Key Types
- `ActivityModel` — Processed GitHub data
- `UnifiedParameters` — Drives all outputs
- `EventMap` — All application events

### Key Functions
- `computeParameters(model)` — ActivityModel → UnifiedParameters
- `eventBus.emit/on` — Inter-module communication
- `createSeededRandom(seed)` — Deterministic randomness

---

## Session Notes

> Update this section at the end of each coding session.

**Current Phase:** Not started  
**Last Completed:** PRD documentation  
**Blockers:** None  
**Next Steps:** Begin Phase 1 — Foundation

---

*When in doubt, refer to `docs/PRD.md` for detailed specifications.*
