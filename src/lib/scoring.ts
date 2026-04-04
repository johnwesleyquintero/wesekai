export function calculateWorldBuildingScore(tags: string[]): number {
  // Base score is lower now because we are fetching dynamically.
  // Anime with strong world-building tags will score much higher.
  let score = 1.0; 

  const tagWeights: Record<string, number> = {
    civilization: 3.0,
    kingdom: 2.5,
    empire: 2.5,
    economy: 2.5,
    politics: 2.5,
    nation: 2.5,
    strategy: 2.5,
    diplomacy: 2.0,
    rebuild: 2.0,
    science: 2.0,
    technology: 2.0,
    trade: 1.5,
    agriculture: 1.5,
    society: 1.5,
    military: 1.5,
    npc: 1.0,
    guild: 1.5,
    systems: 1.5,
    games: 1.0,
    conquest: 1.5,
    invention: 1.5,
    community: 1.0,
    village: 1.0,
    merchants: 1.5,
    isekai: 1.0,
    reincarnation: 1.0,
    fantasy: 0.5,
    magic: 0.5,
    'demon lord': 0.5,
    adventure: 0.5
  };

  // Add individual tag weights
  tags.forEach(tag => {
    score += tagWeights[tag.toLowerCase()] || 0.5; // Default weight for unknown tags
  });

  // Synergy bonuses for specific combinations
  const has = (t: string) => tags.includes(t);

  if (has('kingdom') && has('diplomacy')) score += 1.0;
  if (has('economy') && has('trade')) score += 1.0;
  if (has('politics') && has('economy')) score += 1.5;
  if (has('civilization') && has('science')) score += 1.5;
  if (has('agriculture') && has('economy')) score += 1.0;
  if (has('rebuild') && has('society')) score += 1.0;
  if (has('kingdom') && has('nation')) score += 0.5;
  if (has('strategy') && has('military')) score += 1.0;
  if (has('invention') && has('economy')) score += 1.0;
  if (has('isekai') && has('kingdom')) score += 0.5;

  // Ensure score doesn't exceed 10.0 and round to 1 decimal place
  return Math.min(10.0, Math.round(score * 10) / 10);
}
