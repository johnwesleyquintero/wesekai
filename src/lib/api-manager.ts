interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export type ApiErrorCategory = 'RATE_LIMIT' | 'NETWORK' | 'AUTH' | 'SERVER' | 'UNKNOWN';

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

class ApiManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private lastRequestTimestamp = 0;
  private minDelayBetweenRequests = 400; // ~2.5 requests per second for safety
  private persistTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      const saved = localStorage.getItem(PERSISTENT_CACHE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
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
    const timeSinceLastRequest = now - this.lastRequestTimestamp;
    if (timeSinceLastRequest < this.minDelayBetweenRequests) {
      const waitTime = this.minDelayBetweenRequests - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTimestamp = Date.now();
  }

  async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.throttle();
        const response = await fetch(url, options);

        if (response.status === 429 || (response.status >= 500 && attempt < maxRetries - 1)) {
          const waitTime = baseDelay * Math.pow(2, attempt);
          const logPrefix = response.status === 429 ? '[SYSTEM: COOLDOWN]' : '[SYSTEM: RECOVERY]';
          console.warn(
            `${logPrefix} Status ${response.status}. Initiating temporal delay: ${waitTime}ms...`
          );
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          throw new ApiError(
            response.status === 429 ? 'RATE_LIMIT' : response.status >= 500 ? 'SERVER' : 'UNKNOWN',
            `HTTP error! status: ${response.status}`,
            response.status
          );
        }

        return await response.json();
      } catch (err) {
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
