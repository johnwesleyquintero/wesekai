import { useState, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export type ApiErrorCategory = 'RATE_LIMIT' | 'NETWORK' | 'AUTH' | 'SERVER' | 'TIMEOUT' | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    public category: ApiErrorCategory,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const PERSISTENT_CACHE_KEY = 'wesekai_api_cache';
const REQUEST_TIMEOUT_MS = 12000; // 12 seconds
const RATE_LIMIT_COOLDOWN = 1000 * 60; // 1 minute cooldown for rate limiting

type RateLimitListener = (isLimited: boolean) => void;

class ApiManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private lastRequestTimestamp = 0;
  private minDelayBetweenRequests = 400; // ~2.5 requests per second for safety
  private persistTimeout: ReturnType<typeof setTimeout> | null = null;
  private _isRateLimited = false;
  private listeners = new Set<RateLimitListener>();
  private rateLimitResetTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.hydrate();
  }

  public get isRateLimited(): boolean {
    return this._isRateLimited;
  }

  private setRateLimited(value: boolean) {
    this._isRateLimited = value;
    this.notifyListeners();
    if (value) {
      this.rateLimitResetTimeout = setTimeout(() => {
        this.setRateLimited(false);
      }, RATE_LIMIT_COOLDOWN);
    } else if (this.rateLimitResetTimeout) {
      clearTimeout(this.rateLimitResetTimeout);
      this.rateLimitResetTimeout = null;
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this._isRateLimited));
  }

  public subscribe(listener: RateLimitListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStatus() {
    return this._isRateLimited;
  }

  private hydrate() {
    try {
      const saved = localStorage.getItem(PERSISTENT_CACHE_KEY);
      if (saved && saved.startsWith('{')) {
        const data = JSON.parse(saved);
        if (typeof data !== 'object' || data === null) return;

        const now = Date.now();
        Object.entries(data).forEach(([key, value]) => {
          const entry = value as CacheEntry<unknown>;
          // Only keep entries that haven't expired
          if (now - entry.timestamp < DEFAULT_CACHE_TTL) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (e) {
      console.warn('[API: PERSISTENCE] Failed to hydrate cache:', e);
    }
  }

  private async throttle() {
    const now = Date.now();
    const nextAvailableSlot = Math.max(
      now,
      this.lastRequestTimestamp + this.minDelayBetweenRequests
    );
    const waitTime = nextAvailableSlot - now;

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTimestamp = nextAvailableSlot;
  }

  async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      try {
        await this.throttle();
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        if (response.status === 429) {
          if (timeoutId) clearTimeout(timeoutId);
          this.setRateLimited(true);
          const waitTime = baseDelay * Math.pow(2, attempt) + RATE_LIMIT_COOLDOWN;
          console.warn(
            `[SYSTEM: COOLDOWN] Status 429. Initiating temporal delay: ${waitTime}ms...`
          );
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (response.status >= 500 && attempt < maxRetries - 1) {
          if (timeoutId) clearTimeout(timeoutId);
          const waitTime = baseDelay * Math.pow(2, attempt);
          console.warn(
            `[SYSTEM: RECOVERY] Status ${response.status}. Initiating temporal delay: ${waitTime}ms...`
          );
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          if (timeoutId) clearTimeout(timeoutId);
          throw new ApiError(
            response.status >= 500 ? 'SERVER' : 'UNKNOWN',
            `HTTP error! status: ${response.status}`,
            response.status
          );
        }

        if (timeoutId) clearTimeout(timeoutId);
        return await response.json();
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);

        if (err instanceof Error && err.name === 'AbortError') {
          console.error(`[SYSTEM: TIMEOUT] Request to ${url} exceeded temporal threshold.`);
          throw new ApiError('TIMEOUT', 'Request timed out (Temporal Interference)');
        }

        if (attempt === maxRetries - 1) {
          throw err instanceof ApiError ? err : new ApiError('NETWORK', (err as Error).message);
        }
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.warn(
          `[SYSTEM: INTERFERENCE] Network anomaly detected. Retrying in ${waitTime}ms...`,
          err
        );
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    throw new Error('Max retries reached');
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < DEFAULT_CACHE_TTL) {
      return entry.data as T;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.persist();
  }

  private persist() {
    if (this.persistTimeout) clearTimeout(this.persistTimeout);
    this.persistTimeout = setTimeout(() => {
      try {
        const data = Object.fromEntries(this.cache.entries());
        localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('[API: PERSISTENCE] Failed to save cache:', e);
      }
    }, 1000);
  }

  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(PERSISTENT_CACHE_KEY);
  }
}

export const apiManager = new ApiManager();

export function useApiManager() {
  const [isRateLimited, setIsRateLimited] = useState(apiManager.isRateLimited);

  useEffect(() => {
    const unsubscribe = apiManager.subscribe(status => {
      setIsRateLimited(status);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return { isRateLimited };
}
