# Git Rewind — Implementation Tasks

> Checklist for building Git Rewind. Complete in order.

---

## Overview

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| 1. Foundation | 22 | 2 weeks |
| 2. Network | 12 | 1 week |
| 3. Music | 16 | 2 weeks |
| 4. Art | 10 | 1 week |
| 5. Export | 10 | 1 week |
| 6. Polish | 12 | 1 week |
| **Total** | **82** | **8 weeks** |

---

## Phase 1: Foundation

### 1.1 Project Setup

- [x] **F1** Initialize Next.js 15 with App Router
  ```bash
  npx create-next-app@latest gitrewind --typescript --tailwind --app --src-dir
  ```

- [x] **F2** Configure TypeScript strict mode
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitAny": true
    }
  }
  ```

- [x] **F3** Install core dependencies
  ```bash
  npm install zustand immer mitt zod three tone.js framer-motion
  npm install -D @types/three vitest playwright
  ```

- [x] **F4** Setup Tailwind with custom theme (CSS variables for dynamic colors)

- [x] **F5** Setup ESLint + Prettier

- [x] **F6** Create folder structure per CLAUDE.md

### 1.2 Core Infrastructure

- [x] **F7** Implement typed event bus (`src/lib/core/events.ts`)
  - Export `eventBus.on`, `eventBus.emit`, `eventBus.off`
  - Return unsubscribe function from `on()`
  - Type-safe with `EventMap` generic

- [x] **F8** Define all event types (`src/types/events.ts`)
  - Auth events: `auth:success`, `auth:error`, `auth:logout`
  - Data events: `data:fetch:start`, `data:fetch:progress`, `data:ready`
  - Param events: `params:computing`, `params:ready`
  - Music events: `music:play`, `music:pause`, `music:beat`, `music:complete`
  - Art events: `art:ready`, `art:style:change`
  - Export events: `export:start`, `export:progress`, `export:complete`

- [x] **F9** Create `useEventBus` hook with auto-cleanup

- [x] **F10** Implement Zustand stores
  - `auth.ts` — status, token (memory!), user
  - `data.ts` — status, progress, raw, model
  - `params.ts` — status, values, overrides
  - `ui.ts` — theme, modals, activePanel
  - `toast.ts` — toast notification system

### 1.3 Authentication

- [x] **F11** Create GitHub OAuth App (see README instructions)

- [x] **F12** Implement OAuth initiation (`/api/auth/github/route.ts`)
  - Generate state parameter
  - Redirect to GitHub authorize URL
  - Store state in cookie for CSRF protection

- [x] **F13** Implement OAuth callback (`/api/auth/github/callback/route.ts`)
  - Verify state parameter
  - Exchange code for access token
  - Fetch user profile
  - Return token + user to client (via redirect with params or POST)

- [x] **F14** Update auth store on successful login
  - Store token in memory (Zustand)
  - Never persist to localStorage!

- [x] **F15** Implement logout (clear store, emit event)

### 1.4 Data Pipeline

- [x] **F16** Create GitHub GraphQL client (`src/lib/data/github.ts`)
  - Typed queries with generics
  - Automatic pagination handling
  - Error handling with retries

- [x] **F17** Define Zod schemas for validation (`src/lib/data/schemas.ts`)
  - `UserSchema`
  - `ContributionCalendarSchema`
  - `RepositoryContributionSchema`
  - `RawActivityDataSchema`

- [x] **F18** Implement data fetcher with progress
  ```typescript
  async function* fetchGitHubData(token: string): AsyncGenerator<Progress, RawData>
  ```
  - Emit `data:fetch:progress` events
  - Stages: profile → contributions → repositories → done

- [x] **F19** Create ActivityModel transformer (`src/lib/data/transform.ts`)
  - Raw → ActivityModel
  - Compute totals, patterns, language stats
  - Build collaboration graph

- [ ] **F20** Write unit tests for transformer

### 1.5 Parameter Engine

- [x] **F21** Define UnifiedParameters type (`src/types/parameters.ts`)
  - All fields documented
  - HSL color type
  - Music parameters (key, scale, instruments)
  - Art parameters (style, particles, etc.)

- [x] **F22** Implement parameter computation (`src/lib/core/parameters.ts`)
  - `computeParameters(model: ActivityModel): UnifiedParameters`
  - Tempo from commit frequency
  - Key from additions/deletions ratio
  - Colors from language palette
  - Intensity from activity volume
  - Complexity from language diversity

- [x] **F23** Implement utility functions
  - `src/lib/utils/random.ts` — seeded random
  - `src/lib/utils/color.ts` — HSL conversion, palette generation
  - `src/lib/utils/math.ts` — clamp, lerp, normalize

- [ ] **F24** Write unit tests for parameter computations

### 1.6 UI Foundation

- [x] **F25** Create landing page (`src/app/page.tsx`)
  - Hero section with tagline
  - "Connect GitHub" button
  - Privacy messaging
  - Sample gallery (optional)

- [x] **F26** Create loading screen (`src/components/experience/LoadingScreen.tsx`)
  - Animated progress bar
  - Stage indicator ("Analyzing commits...")
  - Estimated time remaining
  - Progress ring animation
  - Floating code characters
  - Rotating tips

---

## Phase 2: Network Visualization

### 2.1 Force Simulation

- [x] **N1** Implement ForceSimulation class (`src/lib/network/simulation.ts`)
  - Node and edge data structures
  - Link force (spring)
  - Charge force (repulsion) with Barnes-Hut optimization
  - Center force
  - Collision force
  - `tick()` method returns positions

- [x] **N2** Create graph data transformer
  - ActivityModel.collaborationGraph → simulation-ready format
  - User node at center
  - Size nodes by interaction count

### 2.2 Three.js Rendering

- [x] **N3** Setup Three.js scene (`src/lib/network/renderer.ts`)
  - Scene, camera, renderer
  - Orbit controls
  - Resize handler

- [x] **N4** Implement node rendering
  - Use InstancedMesh for performance
  - Sphere geometry
  - Color from parameters
  - Size from interaction count

- [x] **N5** Implement edge rendering
  - LineSegments with BufferGeometry
  - Opacity based on weight
  - Optional: particles along edges

- [x] **N6** Add post-processing
  - EffectComposer
  - UnrealBloomPass for glow
  - Subtle vignette

- [x] **N7** Implement orbit controls
  - Drag to rotate
  - Scroll to zoom
  - Auto-rotate when idle (stop on interaction)

### 2.3 Interactions

- [x] **N8** Implement hover detection
  - Raycasting
  - Highlight hovered node
  - Show tooltip (username, interactions)

- [x] **N9** Implement beat synchronization
  - Listen to `music:beat` events
  - Pulse node scale (1.0 → 1.1 → 1.0)
  - Increase edge particle speed

### 2.4 Component Integration

- [x] **N10** Create NetworkVisualization component
  - Initialize renderer on mount
  - Cleanup on unmount (dispose all resources!)
  - Handle resize

- [x] **N11** Add network controls UI
  - Reset view button
  - Auto-rotate toggle
  - Info panel

- [x] **N12** Performance optimization
  - Limit to 100 nodes (prioritize by interaction count)
  - LOD for distant nodes
  - Throttle simulation when offscreen

---

## Phase 3: Music Engine

### 3.1 Music Theory

- [x] **M1** Implement music theory module (`src/lib/music/theory.ts`)
  - Scale definitions (major, minor, dorian, mixolydian, pentatonic)
  - Chord types (maj, min, dim, maj7, min7, dom7)
  - Chord progressions by mood
  - Note/MIDI conversion utilities

- [x] **M2** Implement melody generation
  - Contour-based (ascending, descending, wave)
  - Quantize to scale
  - Rhythm patterns

### 3.2 Instruments

- [x] **M3** Setup Tone.js (`src/lib/music/instruments.ts`)
  - Master effects chain (limiter, reverb)
  - Volume control

- [x] **M4** Create instrument factory
  - Synth (TypeScript) — PolySynth, sine, delay+reverb
  - Piano (Python) — Triangle, short decay
  - Pad — Slow attack, chorus
  - Bass (Go) — MonoSynth, filter envelope
  - Strings (Rust) — Sawtooth, slow attack
  - Bells (Swift) — FM synthesis

- [x] **M5** Implement language → instrument mapping
  - From UnifiedParameters
  - Volume/pan based on language percentage

### 3.3 Composition

- [x] **M6** Implement Composer class (`src/lib/music/composer.ts`)
  - Takes UnifiedParameters
  - Returns schedulable sections

- [x] **M7** Implement INTRO section (0-15s)
  - Ambient pad chord
  - Sparse high bells
  - Tempo builds from 50% to 100%

- [x] **M8** Implement VERSE section (15-45s)
  - 12 phrases (one per month)
  - Activity level → note density
  - Primary instrument carries melody

- [x] **M9** Implement CHORUS section (45-65s)
  - All instruments playing
  - Collaborator count → polyphony
  - Full chord progression

- [x] **M10** Implement BRIDGE section (65-80s)
  - Feature peak activity period
  - Build to climax
  - Arpeggios, increasing intensity

- [x] **M11** Implement OUTRO section (80-90s)
  - Return to pad
  - Resolve to tonic
  - Fade out

### 3.4 Playback

- [x] **M12** Implement Player class (`src/lib/music/player.ts`)
  - Schedule all sections to Transport
  - Play/pause/stop/seek
  - Time tracking

- [x] **M13** Implement beat event emission
  - `music:beat` on every quarter note
  - Include beat number, measure, time

- [x] **M14** Create MusicPlayer component
  - Play/pause button
  - Progress bar (seekable)
  - Time display
  - Volume control
  - Section indicators
  - Skip to section buttons

- [ ] **M15** Create waveform visualization (optional)
  - Tone.js Analyser
  - Canvas drawing

- [ ] **M16** Implement audio export
  - Tone.js Recorder
  - Export to WAV blob

---

## Phase 4: Generative Art

### 4.1 Shader Framework

- [x] **A1** Setup WebGL2 renderer (`src/lib/art/engine.ts`)
  - Full-screen quad
  - ShaderMaterial with uniforms
  - Animation loop

- [x] **A2** Create uniform management
  - `u_time` — elapsed seconds
  - `u_beat` — 0-1 pulse on beat
  - `u_resolution` — canvas size
  - `u_intensity` — from parameters
  - `u_complexity` — from parameters
  - `u_primaryColor` — RGB vec3
  - `u_secondaryColor` — RGB vec3
  - `u_seed` — for deterministic randomness

### 4.2 Art Styles

- [x] **A3** Implement Constellation shader (`src/lib/art/shaders/constellation.frag`)
  - Star field with random positions (seeded)
  - Connections between nearby stars
  - Glow effect
  - Beat pulse (size + brightness)

- [x] **A4** Implement Flow Field shader (`src/lib/art/shaders/flowField.frag`)
  - Perlin noise-based flow
  - Particles following field
  - Color gradient along flow

- [x] **A4b** Implement Circuit shader (`src/lib/art/shaders/circuit.frag`)
  - Grid-based digital circuit aesthetic
  - Flowing data along circuit paths
  - Beat-reactive pulses

- [x] **A4c** Implement Nebula shader (`src/lib/art/shaders/nebula.frag`)
  - Cosmic gas cloud effect
  - Volumetric noise
  - Swirling color gradients

- [x] **A5** Implement style switcher
  - Hot-swap shaders
  - Transition animation

### 4.3 Integration

- [x] **A6** Create ArtCanvas component
  - Initialize engine
  - Update uniforms from parameters
  - Handle resize

- [x] **A7** Implement beat synchronization
  - Listen to `music:beat`
  - Update `u_beat` uniform
  - Decay over ~200ms

- [ ] **A8** Implement image export
  - Canvas.toBlob('image/png')
  - Multiple resolutions (1080x1080, 1080x1920, 4K)

### 4.4 Polish

- [x] **A9** Add style selector UI
  - Style cycle button in header
  - Current style indicator

- [ ] **A10** Performance optimization
  - Limit particle count on mobile
  - Fallback for no WebGL2

---

## Phase 5: Export & Sharing

### 5.1 Video Export

- [ ] **E1** Implement MediaRecorder export (`src/lib/export/video.ts`)
  - Capture canvas stream
  - Add audio track from Tone.js
  - Output WebM
  - **Note:** MediaRecorder present but not connected to UI

- [ ] **E2** Implement canvas compositing
  - Combine network + art canvases
  - Add UI overlay (username, stats, branding)

- [ ] **E3** Create export progress UI
  - Progress bar
  - "Recording..." state
  - Cancel button

### 5.2 Shareable URLs

- [x] **E4** Implement URL encoding (`src/lib/export/share.ts`)
  - Compress parameters with lz-string
  - Minimal data (seed, tempo, colors, stats)
  - Target: ~100 character URLs

- [x] **E5** Create shared view page (`src/app/r/[id]/page.tsx`)
  - Decode parameters from URL
  - Reconstruct UnifiedParameters
  - Display experience (read-only)

- [x] **E6** Generate Open Graph meta tags
  - Dynamic based on parameters
  - Stats in description
  - Custom OG image (optional: render server-side)

### 5.3 Social Sharing

- [x] **E7** Create ShareDialog component
  - Copy URL button
  - Twitter share (pre-filled text)
  - LinkedIn share
  - Download buttons

- [x] **E8** Implement share text generation
  ```
  🎵 My 2025 in code: 847 commits, 23 collaborators, powered by TypeScript

  Check out my Git Rewind: https://gitrewind.com/r/...

  #GitRewind2025 #GitHub
  ```

### 5.4 Export Options

- [ ] **E9** Create ExportDialog component
  - Format selector (video, audio, image)
  - Quality options
  - Progress feedback
  - **Note:** Button exists but shows placeholder alert

- [ ] **E10** Implement audio-only export
  - WAV from Tone.js Recorder
  - Download button

---

## Phase 6: Polish & Launch

### 6.1 Performance

- [x] **P1** Bundle analysis and code splitting
  - Dynamic imports for Three.js, Tone.js
  - Route-based code splitting

- [x] **P2** Optimize Three.js
  - Dispose all geometries/materials/textures
  - Object pooling for particles

- [x] **P3** Optimize Tone.js
  - Lazy load instruments
  - Dispose on unmount

### 6.2 Accessibility

- [x] **P4** Keyboard navigation
  - Tab through controls
  - Space to play/pause
  - M to mute/unmute
  - Tab to toggle view
  - S to share
  - E to export

- [ ] **P5** Screen reader support
  - ARIA labels
  - Live regions for state changes
  - Alt text for visualizations

- [ ] **P6** Reduced motion support
  - Respect `prefers-reduced-motion`
  - Static alternatives for animations

### 6.3 Mobile & Responsive

- [x] **P7** Responsive layout
  - Stack panels on mobile
  - Touch-friendly controls
  - Appropriate tap targets
  - Collapsible stats panel on mobile

- [x] **P8** Touch controls for 3D
  - Pinch to zoom
  - Two-finger rotate
  - Tap for info

### 6.4 Error Handling

- [x] **P9** Error boundaries
  - Catch rendering errors
  - Fallback UI
  - Retry button

- [ ] **P10** Graceful degradation
  - No WebGL → 2D fallback (NOT IMPLEMENTED)
  - No audio → continue without
  - API errors → clear messaging

### 6.5 Launch

- [ ] **P11** CI/CD setup
  - GitHub Actions
  - Lint + typecheck + test on PR
  - Auto-deploy to Cloudflare on merge

- [ ] **P12** Deployment
  - Cloudflare Pages setup
  - Environment variables
  - Domain configuration (gitrewind.com)
  - Final QA testing
  - **LAUNCH! 🚀**

---

## Progress Tracker

| Phase | Completed | Total | Progress |
|-------|-----------|-------|----------|
| 1. Foundation | 24 | 26 | ████████░░ 92% |
| 2. Network | 12 | 12 | ██████████ 100% |
| 3. Music | 14 | 16 | ████████░░ 88% |
| 4. Art | 9 | 11 | ████████░░ 82% |
| 5. Export | 5 | 10 | █████░░░░░ 50% |
| 6. Polish | 7 | 12 | ██████░░░░ 58% |
| **Total** | **71** | **87** | ████████░░ **82%** |

---

## Remaining Work Summary

### Critical (Functionality Missing)
- [ ] **E1-E3** Video export - MediaRecorder exists but not connected to UI
- [ ] **E9** ExportDialog - Shows placeholder alert, needs real implementation
- [ ] **E10/M16** Audio export - No audio.ts file exists
- [ ] **A10** WebGL fallback for unsupported browsers

### High Priority (Quality/Polish)
- [ ] **A8** Image export at multiple resolutions
- [ ] **P10** Graceful degradation
- [ ] Settings modal (button exists, no dialog)

### Medium Priority (Nice to Have)
- [ ] **F20, F24** Unit tests
- [ ] **M15** Waveform visualization
- [ ] **P5, P6** Advanced accessibility
- [ ] **P11, P12** CI/CD and deployment

### Low Priority (Enhancement)
- [ ] Collaborator data in network graph (currently shows only user node)

---

*Check off tasks as you complete them. Update the progress tracker regularly.*
