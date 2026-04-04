import { AnimeData } from './lib/mal';

export interface Recommendation {
  title: string;
  tags: string[];
  malData: AnimeData;
  wbScore: number;
  wbReasons: string[];
  isElite?: boolean;
  confidenceScore?: number;
  driftMultiplier?: number;
}
