import { WESEKAI_CONSTANTS } from '../wesekai.constants';
import { UnifiedContent } from '../types';
import { extractTagsFromText, finalizeTags, mergeTagWeights } from './tag-utils';

const animeCache = new Map<string, UnifiedContent[]>();

// Priority MAL Genre IDs:
// 62: Isekai, 73: Reincarnation, 38: Military, 11: Strategy Game, 10: Fantasy
const priorityQueries = [
  { genres: '62' }, // Isekai
  { genres: '73' }, // Reincarnation
  { genres: '10,38' }, // Fantasy + Military
  { genres: '62,38' }, // Isekai + Military
  { genres: '11' }, // Strategy Game
  { genres: '62', q: 'kingdom' }, // Isekai + kingdom
  { genres: '10', q: 'economy' }, // Fantasy + economy
  { genres: '62', q: 'rebuild' }, // Isekai + rebuild
  { genres: '62', q: 'politics' }, // Isekai + politics
  { genres: '10', q: 'trade' }, // Fantasy + trade
  { genres: '73', q: 'village' }, // Reincarnation + village
  { genres: '10,11' }, // Fantasy + Strategy Game
  { genres: '62', q: 'management' }, // Isekai + management
  { genres: '62', q: 'crafting' }, // Isekai + crafting
  { genres: '10', q: 'civilization' }, // Fantasy + civilization
  { genres: '62', q: 'diplomacy' }, // Isekai + diplomacy
  { genres: '73', q: 'empire' }, // Reincarnation + empire
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithBackoff(url: string, maxRetries = 3, baseDelay = 2000): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      // If successful or not a rate limit/server error, return the response immediately
      if (response.status !== 429 && response.status < 500) {
        return response;
      }

      // If it's the last attempt, return the response to be handled by the caller
      if (attempt === maxRetries - 1) {
        return response;
      }
    } catch (err) {
      // Catch network errors (e.g. offline, DNS failure)
      if (attempt === maxRetries - 1) {
        throw err;
      }
      console.warn(`Network error. Retrying... (Attempt ${attempt + 1} of ${maxRetries})`, err);
    }

    // Calculate exponential backoff delay: baseDelay * 2^attempt
    const waitTime = baseDelay * Math.pow(2, attempt);
    console.warn(
      `API rate limited or server error. Retrying in ${waitTime}ms... (Attempt ${attempt + 1} of ${maxRetries})`
    );
    await delay(waitTime);
  }
  throw new Error('Max retries reached');
}

interface MalAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string | null;
  score: number | null;
  images: {
    webp?: { large_image_url: string | null };
    jpg?: { large_image_url: string | null };
  };
  year: number | null;
  aired: { from: string | null };
  trailer: { youtube_id: string | null };
  genres: { name: string }[];
  themes: { name: string }[];
  url: string;
}

export async function fetchTopAnimeList(filter: string = 'All'): Promise<UnifiedContent[]> {
  const cacheKey = `mal-${filter}`;
  if (animeCache.has(cacheKey)) {
    return animeCache.get(cacheKey)!;
  }

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

    // Randomize and pick top 2 queries (reduced from 3 to avoid rate limit)
    const shuffledQueries = [...validQueries].sort(() => 0.5 - Math.random());
    const selectedQueries = shuffledQueries.slice(0, 2);

    const allAnime: MalAnime[] = [];
    const seenMalIds = new Set<number>();

    // Fetch sequentially to respect Jikan's strict rate limits
    for (const query of selectedQueries) {
      let url = `https://api.jikan.moe/v4/anime?sfw=true&order_by=start_date&sort=desc&page=1`;
      if (query.genres) url += `&genres=${query.genres}`;
      if (query.q) url += `&q=${query.q}`;

      // Apply banned genres at the API level
      if (WESEKAI_CONSTANTS.BANNED_GENRE_IDS.length > 0) {
        url += `&genres_exclude=${WESEKAI_CONSTANTS.BANNED_GENRE_IDS.join(',')}`;
      }

      try {
        const response = await fetchWithBackoff(url);
        if (response.status === 429) continue;
        if (!response.ok) continue;

        const data = await response.json();
        if (data.data) {
          for (const anime of data.data as MalAnime[]) {
            if (!seenMalIds.has(anime.mal_id)) {
              seenMalIds.add(anime.mal_id);
              allAnime.push(anime);
            }
          }
        }
      } catch (e) {
        console.warn('Query failed:', e);
      }

      // Be nice to Jikan API (max 3 req/sec) - Increased delay for safety
      await delay(500);
    }

    if (allAnime.length === 0) {
      throw new Error(
        'Intelligence Layer is cooling down. Please wait a few seconds before requesting again.'
      );
    }

    if (allAnime.length > 0) {
      // Client-side fallback filtering
      const filteredData = allAnime.filter(anime => {
        const hasBannedGenre = anime.genres?.some(g =>
          WESEKAI_CONSTANTS.BANNED_GENRES.includes(g.name)
        );
        const hasBannedTheme = anime.themes?.some(t =>
          WESEKAI_CONSTANTS.BANNED_GENRES.includes(t.name)
        );

        const titleLower = (anime.title_english || anime.title || '').toLowerCase();
        const hasBannedTitle = WESEKAI_CONSTANTS.BANNED_TITLE_KEYWORDS.some(kw =>
          titleLower.includes(kw)
        );

        return !hasBannedGenre && !hasBannedTheme && !hasBannedTitle;
      });

      const result = filteredData.map(anime => {
        const tagWeights = new Map<string, number>();

        const addTag = (tag: string, weight: number) => {
          tagWeights.set(tag, (tagWeights.get(tag) || 0) + weight);
        };

        // 1. Map MAL Genres/Themes (High Weight)
        anime.genres?.forEach(g => {
          if (g.name === 'Military') addTag('military', 5);
          if (g.name === 'Strategy Game') addTag('strategy', 5);
          if (g.name === 'Fantasy') addTag('fantasy', 5);
        });

        anime.themes?.forEach(t => {
          if (t.name === 'Isekai') addTag('isekai', 5);
          if (t.name === 'Reincarnation') addTag('reincarnation', 5);
          if (t.name === 'Video Game') addTag('games', 5);
        });

        // 2. Keyword Extraction from Synopsis
        const synopsisTags = extractTagsFromText(anime.synopsis || '');
        mergeTagWeights(tagWeights, synopsisTags);

        // Fallback tags if none found
        const sortedTags = finalizeTags(tagWeights, 6, 'adventure');

        return {
          type: 'anime' as const,
          title: anime.title_english || anime.title,
          imageUrl: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '',
          score: anime.score || 0,
          synopsis: anime.synopsis || 'No synopsis available.',
          url: anime.url,
          tags: sortedTags,
          year:
            anime.year ||
            (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined),
          trailerYoutubeId: anime.trailer?.youtube_id || undefined,
        };
      });

      animeCache.set(cacheKey, result);
      return result;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch dynamic anime list:', error);
    if (error instanceof Error) throw error;
    return [];
  }
}
