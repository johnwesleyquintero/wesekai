export interface UnifiedContent {
  type: 'anime' | 'manhwa';
  title: string;
  imageUrl: string;
  placeholderColor?: string; // New field for progressive image loading
  score: number;
  synopsis: string;
  url: string;
  tags: string[];
  year?: number;
  trailerYoutubeId?: string;
}

export interface Recommendation {
  title: string;
  tags: string[];
  contentData: UnifiedContent;
  wbScore: number;
  wbReasons: string[];
  isElite?: boolean;
  confidenceScore?: number;
  driftMultiplier?: number;
}
