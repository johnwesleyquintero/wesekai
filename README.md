# WESEKAI ⚔️

**Real-time Preference Vector Field Simulator with Closed-Loop Behavioral Feedback.**

WESEKAI is a **living preference ecosystem** designed to model how human taste drifts over time. Disguised as an elite Isekai anime and manhwa recommender, it actively learns, adapts, and visualizes your taste vectors in real-time.

## 🧠 The Architecture

WESEKAI operates on a 5-layer cognitive architecture:

### 1. Intelligence Layer (The Engine)

- **Omakase Selection Hook:** The core logic is encapsulated in `useRecommendationEngine`, managing complex state and behavioral feedback loops.
- **Drift Engine:** Detects when you wander into "frozen branches" (genres you dislike) and hierarchically suppresses them using multi-stage multipliers.
- **Optimized Semantic Extraction:** Uses pre-compiled regex in `tag-utils.ts` to parse synopses and descriptions across a robust synonym dictionary (e.g., mapping "realm" to "kingdom", "regressor" to "regression").
- **Damped Learning:** Uses saturation curves (`1 / (1 + |weight|)`) to prevent "taste prison" collapse while maintaining long-term stability.

### 2. Data Layer (The Pipeline)

- **Dual-Core Sourcing:** Seamlessly aggregates data from **Jikan API (MyAnimeList)** for Anime and **AniList GraphQL API** for trending Manhwa.
- **Aggressive Caching:** Implements in-memory caching for API responses to ensure instant filter switching and respect external rate limits.
- **Graceful Fallback System:** If external APIs fail, the system seamlessly falls back to an internal, curated `ELITE_ANIME` and `ELITE_MANHWA` dataset.
- **Unified Schema:** Normalizes disparate data sources into a consistent `UnifiedContent` format for seamless processing.

### 3. Dynamics Layer (The Flow)

- **Confidence-Driven Scoring:** Recommendations are weighted by World-Building (WB) scores, recency bonuses, and tag synergy.
- **Multi-Timescale Memory:** Tracks session-specific "shown" counts and "skipped" history to avoid repetition while maintaining a long-term preference profile.

### 4. Perception Layer (The Feel)

- **Data-Driven Motion:** Animations are driven by system confidence. High-confidence hits snap in; low-confidence edges glide in with heavy blur.
- **Action Semantics:**
  - 🔵 **WATCH/READ:** Lock-in and glow (Core Orbit Reinforcement)
  - ⚪ **SKIP:** Smooth frictionless slide (Accelerated Decay)
  - 🔴 **DROP:** Heavy downward dissolve (Instant Freeze)

### 5. Telemetry Layer (The Mirror)

- **Live Vector HUD:** A glassmorphic dashboard that visualizes the engine's internal weights in real-time.
- **Resilient Persistence:** State is synchronized to `localStorage` with built-in error handling and automated data migration for schema updates.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the intelligence layer
npm run dev

# Run quality checks (Format, Lint, Typecheck)
npm run check
```

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite 6
- **Styling:** Tailwind CSS 4
- **Motion Physics:** Motion (`motion/react`)
- **Icons:** Lucide React
- **Data Sources:** Jikan API (V4), AniList GraphQL API
- **External Integrations:** YouTube Data API (for dynamic trailers)

---

_Built with discipline. Observe. Instrument. Learn._
