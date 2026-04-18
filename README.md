# WESEKAI

> **Real-time Preference Vector Field Simulator with Closed-Loop Behavioral Feedback.**

WESEKAI is an advanced recommendation engine designed to model the evolution of human taste. While specialized in Isekai anime and manhwa, the core architecture functions as a living preference ecosystem that actively learns, adapts, and visualizes user taste vectors through real-time behavioral feedback.

## ✨ Key Features

- **Behavioral Learning Engine:** Implements a damped learning algorithm to map user preferences without hitting "taste prison" local minima.
- **Dual-Source Aggregation:** Real-time data fetching from MyAnimeList (Jikan API) and AniList (GraphQL).
- **World-Building Analysis:** Proprietary scoring system that evaluates narrative depth based on thematic tag density.
- **Hybrid Media Discovery:** Integrated YouTube API for trailer fetching with automated search fallbacks for series recaps.
- **Explainable AI (XAI):** Integrated "Wesley Intelligence" provides natural language reasoning for every recommendation.
- **Dynamic UI/UX:** Motion-driven interface where animation physics correspond to recommendation confidence levels.

## 🧠 The Architecture

The system operates on a sophisticated five-layer cognitive model:

### 1. Intelligence Layer

- **Vector Management:** Encapsulated in `useRecommendationEngine`, managing complex state transitions and feedback loops.
- **Drift Suppression:** Identifies "frozen branches" (disliked genres) to hierarchically suppress irrelevant content using multi-stage multipliers.
- **Semantic Extraction:** Utilizes pre-compiled, length-sorted regex patterns to normalize disparate metadata into a unified tag system.
- **Damped Learning:** Employs saturation curves (`1 / (1 + |weight|)`) to ensure long-term profile stability.

### 2. Data Layer

- **API Integration:** Parallel fetching from Jikan (REST) and AniList (GraphQL).
- **Resiliency Layer:** Implements automated fallbacks to a curated `ELITE` dataset in the event of upstream API rate-limiting or downtime.
- **Schema Normalization:** Transforms heterogeneous API responses into a strictly typed `UnifiedContent` interface.

### 3. Dynamics Layer

- **Scoring Heuristics:** Calculates a composite score based on World-Building depth, community rating, recency, and tag synergy.
- **Multi-Timescale Memory:** Distinguishes between session-specific skips and long-term "dropped" status to maintain content freshness.

### 4. Perception Layer

- **Confidence-Driven Motion:** Animation parameters (blur, scale, spring stiffness) are dynamically adjusted based on the engine's recommendation confidence.
- **Behavioral Semantics:**
  - **Watch/Read:** Reinforces the current preference orbit with a localized glow effect.
  - **Skip:** Applies accelerated decay to tags without hard suppression.
  - **Drop:** Executes a "hard freeze" on the content's specific vector, preventing future occurrences.

### 5. Telemetry Layer

- **Live Vector HUD:** A glassmorphic dashboard (TelemetryModal) visualizing internal preference weights and session memory in real-time.
- **Persistence Engine:** Synchronizes state to `localStorage` with a robust `migrateData` utility to reconcile legacy `malData` schemas with the current `UnifiedContent` standard.

## 🛠️ Tech Stack

- **Core:** React 19, Vite 6, TypeScript
- **State:** Custom Reducer-based Engine with Behavioral Hooks
- **Styling:** Tailwind CSS 4 (Atomic CSS)
- **Motion:** Motion (`motion/react`)
- **Data:** Jikan API v4, AniList GraphQL

## 🚀 Installation & Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

To enable dynamic trailer fetching, create a `.env` file in the root directory:

```env
VITE_YOUTUBE_API_KEY=your_api_key_here
```

## 🧪 Quality Assurance

```bash
# Run comprehensive quality checks
npm run check
```

Includes:

- **Formatting:** Prettier
- **Linting:** ESLint with TypeScript strict rules
- **Type-Checking:** TypeScript Compiler (tsc)

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

_Built with discipline. Observe. Instrument. Learn._
