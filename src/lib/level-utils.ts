import { WESEKAI_CONSTANTS } from '../wesekai.constants';

/**
 * Calculates level information based on the number of items in the watchlist.
 */
export const getLevelInfo = (count: number) => {
  const config = [...WESEKAI_CONSTANTS.LEVEL_CONFIG].reverse();
  const level = config.find(l => count >= l.min) || WESEKAI_CONSTANTS.LEVEL_CONFIG[0];
  const levelNumber = WESEKAI_CONSTANTS.LEVEL_CONFIG.indexOf(level) + 1;

  return {
    level: levelNumber,
    title: level.title,
    color: level.color,
  };
};
