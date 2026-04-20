/**
 * Base class for API-related exceptions.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class JikanRateLimitError extends ApiError {
  constructor() {
    super(429, 'Jikan API rate limit exceeded. Reverting to Elite dataset.');
    this.name = 'JikanRateLimitError';
  }
}
