import { WESEKAI_CONSTANTS } from '../wesekai.constants';
import { UnifiedContent } from '../types';
import { extractTagsFromText, finalizeTags, mergeTagWeights } from './tag-utils';
import { apiManager } from './api-manager';

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
  const cached = apiManager.getCache<UnifiedContent[]>(cacheKey);
  if (cached) return cached;

  try {
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

    const allManhwa: AniListMedia[] = [];
    for (let page = 1; page <= 2; page++) {
      const data = await apiManager.fetchWithRetry<{ data: { Page: { media: AniListMedia[] } } }>(
        'https://graphql.anilist.co',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { page } }),
        }
      );

      if (data.data?.Page?.media) {
        allManhwa.push(...data.data.Page.media);
      }
    }

    if (allManhwa.length === 0) return [];

    const filteredData = allManhwa.filter(manhwa => {
      const hasBannedGenre = manhwa.genres?.some(g => WESEKAI_CONSTANTS.BANNED_GENRES.includes(g));
      const hasBannedTag = manhwa.tags?.some(t => WESEKAI_CONSTANTS.BANNED_GENRES.includes(t.name));

      const titleLower = (manhwa.title?.english || manhwa.title?.romaji || '').toLowerCase();
      const hasBannedTitle = WESEKAI_CONSTANTS.BANNED_TITLE_KEYWORDS.some(kw =>
        titleLower.includes(kw)
      );

      if (hasBannedGenre || hasBannedTag || hasBannedTitle) return false;

      if (filter !== 'All') {
        const filterLower = filter.toLowerCase();
        const matchesFilter =
          manhwa.genres?.some(g => g.toLowerCase() === filterLower) ||
          manhwa.tags?.some(t => t.name.toLowerCase() === filterLower);
        if (!matchesFilter) return false;
      }

      return true;
    });

    const result: UnifiedContent[] = filteredData.map(manhwa => {
      const tagWeights = new Map<string, number>();
      const addTag = (tag: string, weight: number) => {
        tagWeights.set(tag, (tagWeights.get(tag) || 0) + weight);
      };

      addTag('manhwa', 10);
      manhwa.genres?.forEach(g => addTag(g.toLowerCase(), 5));
      manhwa.tags?.forEach(t => addTag(t.name.toLowerCase(), 3));

      const descriptionTags = extractTagsFromText(manhwa.description || '');
      mergeTagWeights(tagWeights, descriptionTags);

      const sortedTags = finalizeTags(tagWeights, 6);
      const normalizedScore = manhwa.averageScore ? manhwa.averageScore / 10 : 0;
      const cleanSynopsis = (manhwa.description || 'No synopsis available.').replace(
        /<[^>]*>?/gm,
        ''
      );

      return {
        type: 'manhwa',
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

    apiManager.setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Failed to fetch manhwa list:', error);
    return [];
  }
}
