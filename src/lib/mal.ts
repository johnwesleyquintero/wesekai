export interface AnimeData {
  title: string;
  imageUrl: string;
  score: number;
  synopsis: string;
  url: string;
  tags: string[];
}

// Priority MAL Genre IDs:
// 62: Isekai, 73: Reincarnation, 38: Military, 11: Strategy Game, 10: Fantasy, 24: Sci-Fi
const priorityQueries = [
  { genres: "62" }, // Isekai
  { genres: "73" }, // Reincarnation
  { genres: "10,38" }, // Fantasy + Military
  { genres: "62,38" }, // Isekai + Military
  { genres: "11" }, // Strategy Game
  { genres: "62", q: "kingdom" }, // Isekai + kingdom
  { genres: "10", q: "economy" }, // Fantasy + economy
  { genres: "62", q: "rebuild" }, // Isekai + rebuild
  { genres: "62", q: "politics" }, // Isekai + politics
  { genres: "10", q: "trade" }, // Fantasy + trade
  { genres: "73", q: "village" }, // Reincarnation + village
  { genres: "10,11" }, // Fantasy + Strategy Game
  { genres: "62", q: "management" }, // Isekai + management
  { genres: "62", q: "crafting" }, // Isekai + crafting
  { genres: "10", q: "civilization" }, // Fantasy + civilization
  { genres: "24,38" }, // Sci-Fi + Military
  { genres: "62", q: "diplomacy" }, // Isekai + diplomacy
  { genres: "73", q: "empire" } // Reincarnation + empire
];

export async function fetchDynamicRecommendation(): Promise<AnimeData | null> {
  try {
    // Randomize the selection of the priority query
    const query = priorityQueries[Math.floor(Math.random() * priorityQueries.length)];
    
    // Pick a random page from top 10 pages (up to 250 results) to ensure high diversity
    // rather than always relying on the top 100
    const page = Math.floor(Math.random() * 10) + 1;
    
    // Randomize the sorting method to get different slices of data
    const sortMethods = ['score', 'popularity', 'favorites'];
    const orderBy = sortMethods[Math.floor(Math.random() * sortMethods.length)];
    
    let url = `https://api.jikan.moe/v4/anime?sfw=true&order_by=${orderBy}&sort=desc&page=${page}`;
    if (query.genres) url += `&genres=${query.genres}`;
    if (query.q) url += `&q=${query.q}`;

    const response = await fetch(url);
    
    if (response.status === 429) {
      throw new Error("Intelligence Layer is cooling down. Please wait a few seconds before requesting again.");
    }
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Pick a random anime from the page results
      const anime = data.data[Math.floor(Math.random() * data.data.length)];
      
      // --- WESLEY INTELLIGENCE LAYER (Dynamic Tagging) ---
      const tags = new Set<string>();
      const synopsisLower = (anime.synopsis || "").toLowerCase();
      
      // 1. Map MAL Genres/Themes
      anime.genres?.forEach((g: any) => {
        if (g.name === 'Military') tags.add('military');
        if (g.name === 'Strategy Game') tags.add('strategy');
        if (g.name === 'Fantasy') tags.add('fantasy');
        if (g.name === 'Sci-Fi') tags.add('science');
      });
      
      anime.themes?.forEach((t: any) => {
        if (t.name === 'Isekai') tags.add('isekai');
        if (t.name === 'Reincarnation') tags.add('reincarnation');
        if (t.name === 'Video Game') tags.add('games');
      });

      // 2. Keyword Extraction from Synopsis
      const keywords = [
        'kingdom', 'economy', 'politics', 'nation', 'strategy', 
        'diplomacy', 'rebuild', 'science', 'technology', 'trade', 
        'agriculture', 'society', 'npc', 'guild', 'systems', 
        'conquest', 'invention', 'community', 'village', 'merchants', 
        'civilization', 'empire', 'magic', 'demon lord', 'management', 'crafting'
      ];

      keywords.forEach(kw => {
        // Use regex for word boundary to avoid partial matches
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(synopsisLower)) {
          tags.add(kw);
        }
      });

      // Fallback tags if none found
      if (tags.size === 0) {
        tags.add('adventure');
      }

      return {
        title: anime.title_english || anime.title,
        imageUrl: anime.images.webp.large_image_url || anime.images.jpg.large_image_url,
        score: anime.score || 0,
        synopsis: anime.synopsis || "No synopsis available.",
        url: anime.url,
        // Return up to 6 tags for the UI
        tags: Array.from(tags).slice(0, 6)
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch dynamic anime data:", error);
    return null;
  }
}
