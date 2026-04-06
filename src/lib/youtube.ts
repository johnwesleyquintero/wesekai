export function getYouTubeSearchUrl(title: string, type: 'anime' | 'manhwa') {
  const suffix = type === 'manhwa' ? 'manhwa recap' : 'anime recap';
  const query = encodeURIComponent(`${title} ${suffix}`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

export async function fetchYouTubeTrailerId(
  title: string,
  type: 'anime' | 'manhwa'
): Promise<string | undefined> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('YouTube API Key missing. Dynamic trailer fetching disabled.');
    return undefined;
  }

  try {
    const query = encodeURIComponent(`${title} ${type} official trailer`);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}&maxResults=1&type=video`
    );

    if (response.status === 429) {
      console.warn('YouTube API rate limit exceeded');
      return undefined;
    }

    if (response.status === 403) {
      console.warn('YouTube API quota exhausted');
      return undefined;
    }

    if (!response.ok) {
      throw new Error(`YouTube API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items?.[0]?.id?.videoId;
  } catch (error) {
    console.error('Failed to fetch dynamic trailer:', error);
    return undefined;
  }
}
