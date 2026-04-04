export interface AnimeData {
  title: string;
  imageUrl: string;
  score: number;
  synopsis: string;
  url: string;
  tags: string[];
}

// Priority MAL Genre IDs:
// 62: Isekai, 73: Reincarnation, 38: Military, 11: Strategy Game, 10: Fantasy
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
  { genres: "62", q: "diplomacy" }, // Isekai + diplomacy
  { genres: "73", q: "empire" } // Reincarnation + empire
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithBackoff(url: string, maxRetries = 3, baseDelay = 1000): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url);
    
    // If successful or not a rate limit error, return the response immediately
    if (response.status !== 429) {
      return response;
    }
    
    // If it's the last attempt, return the 429 response to be handled by the caller
    if (attempt === maxRetries - 1) {
      return response;
    }
    
    // Calculate exponential backoff delay: baseDelay * 2^attempt
    const waitTime = baseDelay * Math.pow(2, attempt);
    console.warn(`Jikan API rate limited (429). Retrying in ${waitTime}ms... (Attempt ${attempt + 1} of ${maxRetries})`);
    await delay(waitTime);
  }
  throw new Error("Max retries reached");
}

export async function fetchTopAnimeList(filter: string = 'All'): Promise<AnimeData[]> {
  try {
    // Filter the priority queries based on the selected filter
    let validQueries = priorityQueries;
    if (filter !== 'All') {
      validQueries = priorityQueries.filter(q => {
        if (filter === 'Isekai') return q.genres?.includes('62');
        if (filter === 'Fantasy') return q.genres?.includes('10');
        if (filter === 'Military') return q.genres?.includes('38');
        if (filter === 'Strategy') return q.genres?.includes('11');
        if (filter === 'Reincarnation') return q.genres?.includes('73');
        return true;
      });
    }
    
    // Fallback to all queries if none match
    if (validQueries.length === 0) validQueries = priorityQueries;

    // Randomize the selection of the priority query to ensure variety on refresh
    const query = validQueries[Math.floor(Math.random() * validQueries.length)];
    
    // Always fetch page 1, sorted by start_date desc to get the newest anime
    let url = `https://api.jikan.moe/v4/anime?sfw=true&order_by=start_date&sort=desc&page=1`;
    if (query.genres) url += `&genres=${query.genres}`;
    if (query.q) url += `&q=${query.q}`;

    const response = await fetchWithBackoff(url);
    
    if (response.status === 429) {
      throw new Error("Intelligence Layer is cooling down. Please wait a few seconds before requesting again.");
    }
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data.map((anime: any) => {
        const tags = new Set<string>();
        const synopsisLower = (anime.synopsis || "").toLowerCase();
        
        // 1. Map MAL Genres/Themes
        anime.genres?.forEach((g: any) => {
          if (g.name === 'Military') tags.add('military');
          if (g.name === 'Strategy Game') tags.add('strategy');
          if (g.name === 'Fantasy') tags.add('fantasy');
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
          tags: Array.from(tags).slice(0, 6)
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch dynamic anime list:", error);
    if (error instanceof Error) throw error;
    return [];
  }
}
