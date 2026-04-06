export interface UnifiedContent {
  type: 'anime' | 'manhwa';
  title: string;
  imageUrl: string;
  score: number;
  synopsis: string;
  url: string;
  tags: string[];
  year?: number;
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
