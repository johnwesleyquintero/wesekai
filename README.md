# 🧬 WESEKAI

**Wesley Isekai World-Building Recommendation Engine**

---

## ⚔️ Overview

**WESEKAI** is a lightweight, single-page React application designed to deliver **high-quality isekai and fantasy recommendations focused on world-building, strategy, and civilization growth**.

Originally conceived as a static curated list, WESEKAI has evolved into a dynamic engine powered by the **Wesley Intelligence Layer**. It intelligently queries the MyAnimeList database, extracts thematic tags from synopses, and calculates a custom "World-Building Score" for every recommendation.

> "MAL provides data. WESEKAI provides taste."

---

## ✨ Features

* 🧠 **Dynamic Intelligence Layer**: Uses priority queries (e.g., "Isekai + Politics", "Fantasy + Economy") to fetch a highly diverse but targeted pool of anime.
* 📊 **World-Building Score (WB Score)**: A custom algorithm that scores anime out of 10.0 based on the presence and synergy of extracted tags (e.g., `kingdom` + `diplomacy` yields a synergy bonus).
* 🏷️ **Auto-Tagging System**: Scans anime synopses and genres to automatically generate relevant RPG-style tags (`strategy`, `civilization`, `trade`, `rebuild`).
* 🎨 **Premium System/RPG Aesthetic**: Features a dark, glassmorphic UI with glowing ambient effects, smooth animations (via Motion), and dedicated skeleton loading states.
* ⚡ **Instant Action**: One-click recommendation generation with direct links to the MyAnimeList database and AniwatchTV for immediate viewing.

---

## 🏗️ Tech Stack

* **Frontend Framework**: React 19 + Vite
* **Styling**: Tailwind CSS v4
* **Animations**: Motion (Framer Motion)
* **Icons**: Lucide React
* **Data Source**: Jikan API v4 (Unofficial MyAnimeList API)

---

## 🔄 How It Works (Data Flow)

1. **User clicks "Initialize Sequence"**
2. **Query Selection**: The engine selects a random priority query (e.g., Genre: Isekai + Keyword: "management") and a random page depth.
3. **Data Fetching**: Calls the Jikan API to retrieve a list of matching anime and selects one at random.
4. **Intelligence Processing**: 
   - Scans the synopsis and genres.
   - Extracts world-building keywords.
   - Calculates the custom WB Score based on tag weights and synergies.
5. **Render**: Displays the premium result card with the anime's cover, MAL score, WB score, tags, and quick links.

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Clone the repository (if applicable) or download the source
cd wesekai

# Install dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

---

## 🧬 Future Roadmap

### v1.0 — Current Release
* Dynamic fetching, auto-tagging, WB scoring, and premium UI.

### v1.1 — UX Enhancements
* "Save to Arsenal" (Local storage bookmarking)
* Filter toggles (e.g., "Strictly Isekai" vs "General Fantasy")

### v2.0 — Advanced Engine
* AI-assisted synopsis summarization
* Personalized taste learning based on accepted/rejected recommendations

---

## 🛡️ Design Constraints

* **Keep it fast**: No bloated databases.
* **Keep it minimal**: One button, one result. No decision fatigue.
* **Keep it intentional**: Every visual element serves the "System/RPG" aesthetic.

---

## 👑 Final Note

WESEKAI reflects a core belief:

> "Good taste is a system. Not an accident."

---

## 📌 License

MIT — Free to use, modify, and expand.

---

## ✨ Credits

Built with React & Tailwind.
Data provided by [Jikan API](https://jikan.moe/).
Curated and engineered by the **Wesley Intelligence System**.
