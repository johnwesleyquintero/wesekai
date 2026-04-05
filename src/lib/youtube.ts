export function getYouTubeSearchUrl(title: string, type: 'anime' | 'manhwa') {
  const suffix = type === 'manhwa' ? 'manhwa recap' : 'anime recap';
  const query = encodeURIComponent(`${title} ${suffix}`);
  return `https://www.youtube.com/results?search_query=${query}`;
}
