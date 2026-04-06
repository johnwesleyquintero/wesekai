import { useState, useEffect, useCallback } from 'react';
import { Recommendation } from '../types';

/**
 * Migration helper for old localStorage data formats.
 * Normalizes different versions of recommendation objects to the current standard.
 */
const migrateData = (data: unknown[]): Recommendation[] => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(Boolean).map(item => {
    const raw = item as any;
    
    // Check if it's already in the new format
    if (raw.contentData) {
      return raw as Recommendation;
    }
    
    // Migration logic for malData (older format)
    if (raw.malData) {
      return {
        title: raw.title || raw.malData.title || 'Unknown',
        tags: raw.malData.tags || raw.tags || [],
        contentData: {
          ...raw.malData,
          type: 'anime',
          tags: raw.malData.tags || raw.tags || [],
        },
        wbScore: raw.wbScore || 0,
        wbReasons: raw.wbReasons || [],
        isElite: !!raw.isElite,
      } as Recommendation;
    }
    
    // Fallback for very basic objects
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
      if (migrate && Array.isArray(parsed)) {
        return migrateData(parsed) as unknown as T;
      }
      return parsed;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  }, []);

  return [value, updateValue] as const;
}
