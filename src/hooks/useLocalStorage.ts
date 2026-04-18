import { useState, useEffect, useCallback } from 'react';
import { Recommendation } from '../types';

type LegacyRecommendation = Partial<Recommendation> & {
  malData?: {
    title?: string;
    tags?: string[];
    [key: string]: unknown;
  } & Record<string, unknown>;
  url?: string;
  title?: string;
  isElite?: boolean;
  tags?: string[];
};

/**
 * Migration helper for old localStorage data formats.
 * Normalizes different versions of recommendation objects to the current standard.
 * @param data An array of unknown type, expected to be a list of recommendations from localStorage.
 * @returns An array of `Recommendation` objects, normalized to the current schema.
 *          Returns an empty array if the input is not an array or if an error occurs during migration.
 */
export const migrateData = (data: unknown[]): Recommendation[] => {
  if (!Array.isArray(data)) return [];

  return data.filter(Boolean).map(item => {
    const raw = item as LegacyRecommendation;

    // 1. Current schema check
    if (raw.contentData) {
      return item as Recommendation;
    }

    // 2. Deep migration for legacy objects containing 'malData'
    if (raw.malData) {
      const normalizedTags = Array.from(
        new Set([...(raw.malData.tags || []), ...(raw.tags || [])])
      );
      return {
        title: raw.title || raw.malData.title || 'Unknown',
        tags: normalizedTags,
        contentData: {
          ...raw.malData,
          type: 'anime',
          tags: normalizedTags,
        },
        wbScore: raw.wbScore || 0,
        wbReasons: raw.wbReasons || [],
        isElite: Boolean(raw.isElite),
      } as Recommendation;
    }

    // 3. Last-resort fallback for partial matches
    return {
      title: raw.title || 'Unknown',
      tags: raw.tags || [],
      contentData: {
        url: raw.url || Math.random().toString(),
        title: raw.title || 'Unknown',
        type: 'anime',
        imageUrl: '',
        score: 0,
        synopsis: '',
        tags: raw.tags || [],
      },
      wbScore: raw.wbScore || 0,
      wbReasons: raw.wbReasons || [],
      isElite: !!raw.isElite,
    } as Recommendation;
  });
};

export function useLocalStorage<T>(key: string, initialValue: T, migrate = false) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return initialValue;

      const parsed = JSON.parse(saved);
      // Only attempt migration if we are in migrate mode and dealing with an array
      if (migrate && Array.isArray(parsed) && parsed.length > 0) {
        return migrateData(parsed) as unknown as T;
      }
      return parsed;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error('LocalStorage quota exceeded. Consider clearing the Dropped list.');
          return;
        }
        console.error(`Error saving localStorage key "${key}":`, error);
      }
    }, 500); // 500ms debounce to prevent I/O jank

    return () => clearTimeout(handler);
  }, [key, value]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  }, []);

  return [value, updateValue] as const;
}
