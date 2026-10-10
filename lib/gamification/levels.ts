export const XP_PER_LEVEL = 100;

export function getLevelProgress(xp: number) {
  const totalXp = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;

  return {
    level,
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    xpRemaining: XP_PER_LEVEL - xpIntoLevel,
    progressPercent: xpIntoLevel,
  };
}
