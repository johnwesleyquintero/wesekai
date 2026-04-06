interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_CACHE_TTL = 1000 * 60 * 30; // 30 minutes

class ApiManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private lastRequestTimestamp = 0;
  private minDelayBetweenRequests = 400; // ~2.5 requests per second for safety

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
          console.warn(`API Error ${response.status}. Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        if (attempt === maxRetries - 1) throw err;
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.warn(`Network error. Retrying in ${waitTime}ms...`, err);
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
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const apiManager = new ApiManager();
