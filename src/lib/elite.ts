import { UnifiedContent } from '../types';
import { apiManager } from './api-manager';

// Assuming WESEKAI_CONSTANTS exists and is suitable for this.
// If not, a new `config.ts` file could be created.
export const ELITE_ANIME: UnifiedContent[] = [
  {
    type: 'anime',
    title: 'That Time I Got Reincarnated as a Slime',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1014/114090l.jpg',
    score: 8.15,
    synopsis:
      'Thirty-seven-year-old Satoru Mikami is a typical corporate worker... until he is stabbed and reincarnated as a slime in a fantasy world. Renamed Rimuru Tempest, he uses his unique skills to build a monster nation, focusing on diplomacy, trade, and kingdom-building to create a utopia for all races.',
    url: 'https://myanimelist.net/anime/37430/Tensei_shitara_Slime_Datta_Ken',
    tags: [
      'isekai',
      'reincarnation',
      'fantasy',
      'kingdom',
      'politics',
      'economy',
      'diplomacy',
      'nation',
      'civilization',
    ],
    year: 2018,
  },
  {
    type: 'anime',
    title: 'Log Horizon',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/5/53821l.jpg',
    score: 7.92,
    synopsis:
      'Thirty thousand Japanese gamers are suddenly trapped in the virtual reality game Elder Tale. Shiroe, a socially awkward but brilliant strategist, forms the guild Log Horizon. They must establish a functioning society, negotiate with NPCs (People of the Earth), and build an economy from scratch.',
    url: 'https://myanimelist.net/anime/17265/Log_Horizon',
    tags: [
      'isekai',
      'fantasy',
      'strategy',
      'economy',
      'politics',
      'society',
      'guild',
      'npc',
      'systems',
      'games',
    ],
    year: 2013,
  },
  {
    type: 'anime',
    title: 'Overlord',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/7/73245l.jpg',
    score: 7.92,
    synopsis:
      "When a popular MMORPG is scheduled to be shut down, veteran player Momonga stays logged in until the very end. However, the server doesn't go down, and the NPCs develop personalities. Momonga, now an undead skeletal mage, decides to conquer this new world, utilizing overwhelming military might and strategic manipulation.",
    url: 'https://myanimelist.net/anime/29803/Overlord',
    tags: ['isekai', 'fantasy', 'strategy', 'military', 'magic', 'empire', 'conquest', 'politics'],
    year: 2015,
  },
  {
    type: 'anime',
    title: 'Ascendance of a Bookworm',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1071/103608l.jpg',
    score: 7.99,
    synopsis:
      'Urano Motosu, a book-loving college student, dies in an earthquake and reincarnates as Myne, a frail girl in a medieval world where books are a luxury for the nobles. Using her modern knowledge, she invents paper, printing presses, and establishes trade networks to achieve her dream of reading again.',
    url: 'https://myanimelist.net/anime/39468/Honzuki_no_Gekokujou__Shisho_ni_Naru_Tame_ni_wa_Shudan_wo_Erandeiraremasen',
    tags: [
      'isekai',
      'reincarnation',
      'fantasy',
      'economy',
      'trade',
      'invention',
      'society',
      'merchants',
      'technology',
    ],
    year: 2019,
  },
  {
    type: 'anime',
    title: 'How a Realist Hero Rebuilt the Kingdom',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1855/115946l.jpg',
    score: 7.15,
    synopsis:
      "Summoned to a fantasy world, Kazuya Souma isn't given a sword or a quest to defeat a demon lord. Instead, he is handed the throne of the Elfrieden Kingdom. Using Machiavellian philosophy and modern administrative knowledge, he radically reforms the nation's agriculture, economy, and military.",
    url: 'https://myanimelist.net/anime/41710/Genjitsu_Shugi_Yuusha_no_Oukoku_Saikenki',
    tags: [
      'isekai',
      'fantasy',
      'kingdom',
      'economy',
      'politics',
      'diplomacy',
      'agriculture',
      'rebuild',
      'strategy',
    ],
    year: 2021,
  },
  {
    type: 'anime',
    title: 'Saga of Tanya the Evil',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/5/82890l.jpg',
    score: 7.97,
    synopsis:
      'A ruthless Japanese salaryman is murdered and reincarnated as Tanya Degurechaff, an orphaned girl in an alternate universe equivalent to World War I Europe, but with magic. Utilizing her knowledge of history and cutthroat corporate strategy, Tanya rises through the military ranks to ensure her own survival.',
    url: 'https://myanimelist.net/anime/32615/Youjo_Senki',
    tags: ['isekai', 'reincarnation', 'military', 'strategy', 'magic', 'empire', 'politics'],
    year: 2017,
  },
];

export const ELITE_MANHWA: UnifiedContent[] = [
  {
    type: 'manhwa',
    title: 'Solo Leveling',
    imageUrl:
      'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673VNtzbRw5.jpg',
    score: 8.9,
    synopsis:
      'In a world where hunters with magical powers must battle deadly monsters to protect the human race from certain annihilation, a notoriously weak hunter named Sung Jinwoo finds himself in a seemingly endless struggle for survival. One day, after narrowly surviving an overwhelmingly powerful double dungeon that nearly wipes out his entire party, a mysterious program called the System chooses him as its sole player and in turn, gives him the extremely rare ability to level up in strength.',
    url: 'https://anilist.co/manga/105398/Na-Honjaman-Level-Up',
    tags: ['action', 'fantasy', 'system', 'hunter', 'dungeon', 'player'],
    year: 2018,
  },
  {
    type: 'manhwa',
    title: "Omniscient Reader's Viewpoint",
    imageUrl:
      'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-2bK1B3b91A4E.jpg',
    score: 8.8,
    synopsis:
      "Dokja was an average office worker whose sole interest was reading his favorite web novel 'Three Ways to Survive the Apocalypse.' But when the novel suddenly becomes reality, he is the only person who knows how the world will end. Armed with this realization, Dokja uses his understanding to change the course of the story, and the world, as he knows it.",
    url: 'https://anilist.co/manga/119257/Jeonjijeok-Dokja-Sijeom',
    tags: ['action', 'fantasy', 'system', 'survival', 'player', 'constellation'],
    year: 2020,
  },
  {
    type: 'manhwa',
    title: 'Return of the Mount Hua Sect',
    imageUrl:
      'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx129750-yR4SjI5z1mXk.jpg',
    score: 8.6,
    synopsis:
      "Chung Myung, the 13th generation disciple of the Mount Hua Sect, is one of the three great swordsmen, Plum Blossom Sword Saint. After defeating the Heavenly Demon, he breathes his last on the summit of the Hundred Thousand Great Mountains. Jumping 100 years into the future, he is reborn in the body of a child. But what? The Mount Hua Sect has fallen? It's ruined?!",
    url: 'https://anilist.co/manga/129750/Hwasanguihwan',
    tags: ['action', 'martial arts', 'reincarnation', 'comedy', 'sect', 'rebuild'],
    year: 2021,
  },
  {
    type: 'manhwa',
    title: 'The Greatest Estate Developer',
    imageUrl:
      'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx139741-1j1X0v2Q2X1J.jpg',
    score: 8.5,
    synopsis:
      'When civil engineering student Suho Kim falls asleep reading a fantasy novel, he wakes up as a character in the book! Suho is now in the body of Lloyd Frontera, a lazy noble who loves to drink, and whose family is in a mountain of debt. Using his engineering knowledge, Suho designs inventions to avert the terrible future that lies in wait for him.',
    url: 'https://anilist.co/manga/139741/Yeokdaegeup-Yeongji-Seolgyesa',
    tags: ['comedy', 'fantasy', 'isekai', 'kingdom', 'economy', 'rebuild', 'engineering'],
    year: 2021,
  },
];

let lastRefreshTime = 0; // This state should probably be managed by a hook or a more persistent store if the app is long-lived
const REFRESH_COOLDOWN = 1000 * 60 * 60; // TODO: Move to WESEKAI_CONSTANTS or environment variable

/**
 * Safely extracts the numeric ID from MyAnimeList or AniList URLs.
 * Matches the first numeric segment following /anime/ or /manga/.
 */
const extractIdFromUrl = (url: string) =>
  url.trim().match(/\/(?:anime|manga)\/(\d+)(?:\/|\?|#|$)/i)?.[1] || null;

export async function refreshEliteImages(): Promise<void> {
  const now = Date.now();
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    console.log('Elite images refresh skipped (rate limit)');
    return;
  }
  lastRefreshTime = now;

  const malTasks = ELITE_ANIME.map(async anime => {
    if (anime.imageUrl.includes('webp')) return; // Already optimized
    const id = extractIdFromUrl(anime.url);
    if (!id) return;
    const data = await apiManager.fetchWithRetry<{
      data: { images: { webp?: { large_image_url: string } } };
    }>(`https://api.jikan.moe/v4/anime/${id}`);
    const newUrl = data.data?.images?.webp?.large_image_url;
    if (newUrl) {
      anime.imageUrl = newUrl;
    }
  });

  const manhwaTasks = ELITE_MANHWA.map(async manhwa => {
    const id = extractIdFromUrl(manhwa.url);
    if (!id) return;

    const query = `
      query ($id: Int) {
        Media(id: $id, type: MANGA) {
          coverImage {
            large
          }
        }
      }
    `;

    const data = await apiManager.fetchWithRetry<{
      data: { Media: { coverImage: { large: string } } };
    }>('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id: Number(id) } }),
    });

    const newUrl = data.data?.Media?.coverImage?.large;
    if (newUrl) {
      manhwa.imageUrl = newUrl;
    }
  });

  // Execute both Anime and Manhwa refreshes concurrently
  const [malResults, manhwaResults] = await Promise.all([
    Promise.allSettled(malTasks),
    Promise.allSettled(manhwaTasks),
  ]);

  const malErrors = malResults.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  if (malErrors.length) {
    console.warn(
      `[DATA: SYNC] Failed to refresh ${malErrors.length} elite anime images.`,
      malErrors.map(e => e.reason)
    );
  }

  const manhwaErrors = manhwaResults.filter(
    (r): r is PromiseRejectedResult => r.status === 'rejected'
  );

  if (manhwaErrors.length) {
    console.warn(
      `[DATA: SYNC] Failed to refresh ${manhwaErrors.length} elite manhwa images.`,
      manhwaErrors.map(e => e.reason)
    );
  }
}
