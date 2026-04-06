import { WESEKAI_CONSTANTS } from '../wesekai.constants';
import { UnifiedContent } from '../types';
import { extractTagsFromText, finalizeTags, mergeTagWeights } from './tag-utils';

const manhwaCache = new Map<string, UnifiedContent[]>();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithBackoff(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status !== 429 && response.status < 500) {
        return response;
      }

      if (attempt === maxRetries - 1) {
        return response;
      }
    } catch (err) {
      if (attempt === maxRetries - 1) {
        throw err;
      }
      console.warn(`Network error. Retrying... (Attempt ${attempt + 1} of ${maxRetries})`, err);
    }

    const waitTime = baseDelay * Math.pow(2, attempt);
    console.warn(
      `AniList API rate limited or server error. Retrying in ${waitTime}ms... (Attempt ${attempt + 1} of ${maxRetries})`
    );
    await delay(waitTime);
  }
  throw new Error('Max retries reached');
}

interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
  };
  description: string | null;
  averageScore: number | null;
  coverImage: {
    large: string | null;
  };
  startDate: {
    year: number | null;
  };
  trailer: {
    id: string;
    site: string;
  } | null;
  tags: {
    name: string;
  }[];
  genres: string[];
  siteUrl: string;
}

export async function fetchTopManhwa(filter: string = 'All'): Promise<UnifiedContent[]> {
  const cacheKey = `anilist-${filter}`;
  if (manhwaCache.has(cacheKey)) {
    return manhwaCache.get(cacheKey)!;
  }

  try {
    // AniList GraphQL Query
    // We fetch trending manhwa (countryOfOrigin: "KR")
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 50) {
          media(type: MANGA, countryOfOrigin: "KR", sort: TRENDING_DESC) {
            id
            title {
              romaji
              english
            }
            description
            averageScore
            coverImage {
              large
            }
            startDate {
              year
            }
            trailer {
              id
              site
            }
            tags {
              name
            }
            genres
            siteUrl
          }
        }
      }
    `;

    // Fetch pages 1 and 2 to get a good pool
    const allManhwa: AniListMedia[] = [];
    for (let page = 1; page <= 2; page++) {
      const response = await fetchWithBackoff('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { page } }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      if (data.data?.Page?.media) {
        allManhwa.push(...data.data.Page.media);
      }
      await delay(500); // Be nice to AniList
    }

    if (allManhwa.length === 0) {
      return [];
    }

    // Filter and Map
    const filteredData = allManhwa.filter(manhwa => {
      // Filter out banned genres
      const hasBannedGenre = manhwa.genres?.some(g => WESEKAI_CONSTANTS.BANNED_GENRES.includes(g));
      const hasBannedTag = manhwa.tags?.some(t => WESEKAI_CONSTANTS.BANNED_GENRES.includes(t.name));

      const titleLower = (manhwa.title?.english || manhwa.title?.romaji || '').toLowerCase();
      const hasBannedTitle = WESEKAI_CONSTANTS.BANNED_TITLE_KEYWORDS.some(kw =>
        titleLower.includes(kw)
      );

      if (hasBannedGenre || hasBannedTag || hasBannedTitle) return false;

      // Apply active filter if not 'All'
      if (filter !== 'All') {
        const filterLower = filter.toLowerCase();
        const matchesFilter =
          manhwa.genres?.some(g => g.toLowerCase() === filterLower) ||
          manhwa.tags?.some(t => t.name.toLowerCase() === filterLower);
        if (!matchesFilter) return false;
      }

      return true;
    });

    const result = filteredData.map(manhwa => {
      const tagWeights = new Map<string, number>();

      const addTag = (tag: string, weight: number) => {
        tagWeights.set(tag, (tagWeights.get(tag) || 0) + weight);
      };

      // Base tag to identify format
      addTag('manhwa', 10);

      // 1. Map AniList Genres/Tags (High Weight)
      manhwa.genres?.forEach(g => {
        addTag(g.toLowerCase(), 5);
      });

      manhwa.tags?.forEach(t => {
        addTag(t.name.toLowerCase(), 3);
      });

      // 2. Keyword Extraction from Description
      const descriptionTags = extractTagsFromText(manhwa.description || '');
      mergeTagWeights(tagWeights, descriptionTags);

      // Sort tags by weight descending and take top 6
      const sortedTags = finalizeTags(tagWeights, 6);

      // Normalize AniList score (0-100) to MAL score (0-10)
      const normalizedScore = manhwa.averageScore ? manhwa.averageScore / 10 : 0;

      // Clean HTML tags from AniList description
      const cleanSynopsis = (manhwa.description || 'No synopsis available.').replace(
        /<[^>]*>?/gm,
        ''
      );

      return {
        type: 'manhwa' as const,
        title: manhwa.title?.english || manhwa.title?.romaji || 'Unknown Title',
        imageUrl: manhwa.coverImage?.large || '',
        score: normalizedScore,
        synopsis: cleanSynopsis,
        url: manhwa.siteUrl,
        tags: sortedTags,
        year: manhwa.startDate?.year || undefined,
        trailerYoutubeId: manhwa.trailer?.site === 'youtube' ? manhwa.trailer.id : undefined,
      };
    });

    manhwaCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Failed to fetch manhwa list:', error);
    return [];
  }
}
