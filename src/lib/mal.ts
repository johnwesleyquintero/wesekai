import { WESEKAI_CONSTANTS } from '../wesekai.constants';
import { UnifiedContent } from '../types';
import { extractTagsFromText, finalizeTags, mergeTagWeights } from './tag-utils';
import { apiManager } from './api-manager';

const priorityQueries = [
  { genres: '62' }, // Isekai
  { genres: '73' }, // Reincarnation
  { genres: '10,38' }, // Fantasy + Military
  { genres: '62,38' }, // Isekai + Military
  { genres: '11' }, // Strategy Game
  { genres: '62', q: 'kingdom' },
  { genres: '10', q: 'economy' },
  { genres: '62', q: 'rebuild' },
  { genres: '62', q: 'politics' },
  { genres: '10', q: 'trade' },
  { genres: '73', q: 'village' },
  { genres: '10,11' },
  { genres: '62', q: 'management' },
  { genres: '62', q: 'crafting' },
  { genres: '10', q: 'civilization' },
  { genres: '62', q: 'diplomacy' },
  { genres: '73', q: 'empire' },
];

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
  const cached = apiManager.getCache<UnifiedContent[]>(cacheKey);
  if (cached) return cached;

  try {
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

    if (validQueries.length === 0) validQueries = priorityQueries;

    const shuffledQueries = [...validQueries].sort(() => 0.5 - Math.random());
    const selectedQueries = shuffledQueries.slice(0, 2);

    const allAnime: MalAnime[] = [];
    const seenMalIds = new Set<number>();

    for (const query of selectedQueries) {
      let url = `https://api.jikan.moe/v4/anime?sfw=true&order_by=start_date&sort=desc&page=1`;
      if (query.genres) url += `&genres=${query.genres}`;
      if (query.q) url += `&q=${query.q}`;
      if (WESEKAI_CONSTANTS.BANNED_GENRE_IDS.length > 0) {
        url += `&genres_exclude=${WESEKAI_CONSTANTS.BANNED_GENRE_IDS.join(',')}`;
      }

      try {
        const data = await apiManager.fetchWithRetry<{ data: MalAnime[] }>(url);
        if (data.data) {
          for (const anime of data.data) {
            if (!seenMalIds.has(anime.mal_id)) {
              seenMalIds.add(anime.mal_id);
              allAnime.push(anime);
            }
          }
        }
      } catch (e) {
        console.warn('Query failed:', e);
      }
    }

    if (allAnime.length === 0) {
      throw new Error('Intelligence Layer is cooling down. Please try again in a few seconds.');
    }

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

    const result: UnifiedContent[] = filteredData.map(anime => {
      const tagWeights = new Map<string, number>();
      const addTag = (tag: string, weight: number) => {
        tagWeights.set(tag, (tagWeights.get(tag) || 0) + weight);
      };

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

      const synopsisTags = extractTagsFromText(anime.synopsis || '');
      mergeTagWeights(tagWeights, synopsisTags);

      const sortedTags = finalizeTags(tagWeights, 6, 'adventure');

      return {
        type: 'anime',
        title: anime.title_english || anime.title,
        imageUrl: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '',
        score: anime.score || 0,
        synopsis: anime.synopsis || 'No synopsis available.',
        url: anime.url,
        tags: sortedTags,
        year:
          anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined),
        trailerYoutubeId: anime.trailer?.youtube_id || undefined,
      };
    });

    apiManager.setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Failed to fetch dynamic anime list:', error);
    if (error instanceof Error) throw error;
    return [];
  }
}
