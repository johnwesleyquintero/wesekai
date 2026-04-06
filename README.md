# WESEKAI ⚔️

**Real-time Preference Vector Field Simulator with Closed-Loop Behavioral Feedback.**

WESEKAI is not a standard recommendation app. It is a **living preference ecosystem** designed to model how human taste drifts over time. Disguised as an elite Isekai anime and manhwa recommender, it actively learns, adapts, and visualizes your taste vectors in real-time.

## 🧠 The Architecture

WESEKAI operates on a 5-layer cognitive architecture:

### 1. Intelligence Layer (The Engine)

- **Omakase Selection Loop:** Eliminates decision fatigue by serving exactly one highly-calculated recommendation at a time.
- **Drift Engine:** Detects when you wander into "frozen branches" (genres you dislike) and hierarchically suppresses them.
- **Synonym-Aware Semantic Extraction:** Parses synopses and descriptions using a robust synonym dictionary (e.g., mapping "realm" to "kingdom", "regressor" to "regression") to deeply understand thematic elements beyond surface-level tags.
- **Damped Learning:** Uses saturation curves (`effect = baseWeight * (1 / (1 + currentAbsoluteWeight))`) to prevent overfitting and "taste prison" collapse.

### 2. Data Layer (The Pipeline)

- **Dual-Core Sourcing:** Seamlessly aggregates data from both the **Jikan API (MyAnimeList)** for Anime and the **AniList GraphQL API** for trending Manhwa.
- **Graceful Fallback System:** If external APIs fail due to rate limits or downtime, the system seamlessly falls back to an internal, curated `ELITE_ANIME` dataset, ensuring zero downtime.
- **Media Type Filtering:** Instantly pivot the engine's focus between Anime, Manhwa, or a unified feed.

### 3. Dynamics Layer (The Flow)

- **Exploration Pressure:** Injects bounded randomness based on system confidence. If the system is unsure, it explores adjacent semantic spaces.
- **Multi-Timescale Memory:** Tracks volatile session moods, seasonal trends, and stable core identity.

### 4. Perception Layer (The Feel)

- **Confidence-Based Motion:** Animations are not decorative; they are data-driven. A high-confidence recommendation snaps in instantly. A low-confidence edge-case glides in slowly with a heavy blur.
- **Action Semantics:**
  - 🔵 **WATCH/READ:** Lock-in and glow (Core Orbit Reinforcement)
  - ⚪ **SKIP:** Smooth frictionless slide (Accelerated Decay)
  - 🔴 **DROP:** Heavy downward dissolve with sepia filter (Instant Freeze)

### 5. Telemetry Layer (The Mirror)

- **Live Vector HUD:** A glassmorphic dashboard that visualizes the engine's brain in real-time.
- Watch your **Core Orbit (Pull)** and **Frozen Branches (Push)** shift as you interact with the system.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the intelligence layer
npm run dev
```

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Motion Physics:** Framer Motion (`motion/react`)
- **Icons:** Lucide React
- **Data Sources:** Jikan API (MyAnimeList), AniList GraphQL API
- **External Integrations:** MangaDex, Aniwatch, YouTube

---

_Built with discipline. Observe. Instrument. Learn._
