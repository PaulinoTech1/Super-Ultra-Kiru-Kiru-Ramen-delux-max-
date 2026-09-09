export const BOSS_HITS = 3;
export const MAX_AJITAMA = 4;
export function addAjitama(eggs) { return Math.min(MAX_AJITAMA, eggs + 1); }
export function ajitamaPositions(eggs) {
  return Array.from({ length: Math.min(MAX_AJITAMA, Math.max(0, eggs)) }, (_, i) => ({
    x: 299 + (i % 2) * 26,
    y: 226 - Math.floor(i / 2) * 23,
  }));
}
export const FLIGHT_SECONDS = 0.42;
export function needsChickenBoss(eggs) { return eggs > 3; }
export function chickenX(seconds) { return 320 + Math.sin(seconds * 1.7) * 225; }
export function eggHitsChicken(x, y, seconds) {
  return Math.abs(x - chickenX(seconds)) <= 36 && Math.abs(y - 145) <= 32;
}
export function scoreEgg(hits, hit) { return Math.min(BOSS_HITS, hits + (hit ? 1 : 0)); }
