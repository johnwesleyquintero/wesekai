export function getWatchUrl(type: 'anime' | 'manhwa', title: string): string {
  if (type === 'manhwa') {
    return `https://mangadex.org/titles?q=${encodeURIComponent(title)}`;
  }
  return `https://aniwatchtv.to/search?keyword=${encodeURIComponent(title)}`;
}
