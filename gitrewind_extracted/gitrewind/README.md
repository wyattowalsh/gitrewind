# 🎬 Git Rewind

**Your code. Your story. Your symphony.**

Transform your year of GitHub activity into an immersive, multi-sensory experience.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

---

## ✨ Features

- **🌌 3D Network** — Your collaborators as an interactive constellation
- **🎵 Generative Music** — 90-second composition from your commit patterns
- **🎨 Shader Art** — GPU-powered visuals synced to the beat
- **🔒 100% Private** — All processing in your browser, zero data stored
- **💸 Completely Free** — No backend, no costs, no premium tiers

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- GitHub Account

### Setup

```bash
# Clone
git clone https://github.com/yourusername/gitrewind.git
cd gitrewind

# Install
npm install

# Configure (see below)
cp .env.example .env.local

# Run
npm run dev
```

### GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** Git Rewind
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/github/callback`
4. Copy credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 |
| Language | TypeScript (strict) |
| State | Zustand |
| 3D | Three.js |
| Audio | Tone.js |
| Shaders | GLSL / WebGL2 |
| Styling | Tailwind CSS |

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js pages
├── components/           # React components
├── lib/
│   ├── core/             # Event bus, parameters
│   ├── data/             # GitHub API, transforms
│   ├── network/          # 3D visualization
│   ├── music/            # Audio synthesis
│   ├── art/              # Shader rendering
│   └── export/           # Video/audio export
├── stores/               # Zustand state
├── hooks/                # React hooks
└── types/                # TypeScript definitions
```

---

## 🔒 Privacy

**Your data never leaves your browser.**

- OAuth tokens exist only in memory
- No backend database
- No analytics tracking individuals
- Open source — verify yourself

---

## 📖 Documentation

- **[PRD](docs/PRD.md)** — Full product requirements
- **[CLAUDE.md](CLAUDE.md)** — Development guidelines
- **[TASKS.md](TASKS.md)** — Implementation checklist

---

## 🧪 Development

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Lint code
npm run typecheck  # Type check
npm test           # Run tests
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Git Rewind</strong><br>
  <em>Your code. Your story. Your symphony.</em><br><br>
  <a href="https://gitrewind.com">gitrewind.com</a>
</p>
