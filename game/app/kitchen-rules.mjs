export const BOWLS = [
  { name: 'Wormtown Ember', note: 'Brick red. Diner stripes.', body: '#bd593e', shade: '#8c3f30', rim: '#f1deb0', accent: '#f1deb0', pattern: 'stripes' },
  { name: 'Polar Blue', note: 'Ice blue. Snowy dots.', body: '#558ba4', shade: '#315567', rim: '#d6e6db', accent: '#d6e6db', pattern: 'dots' },
  { name: 'Elm Park Jade', note: 'Leaf green. Garden checks.', body: '#6e8b57', shade: '#435c3b', rim: '#d2ce98', accent: '#b8c78a', pattern: 'checks' },
  { name: 'Seven Hills Clay', note: 'Warm clay. Seven little hills.', body: '#b88961', shade: '#80593e', rim: '#e6c998', accent: '#efe0b7', pattern: 'hills' },
  { name: 'Union Midnight', note: 'Deep indigo. Starlit glaze.', body: '#5c607f', shade: '#373b59', rim: '#bdb4c4', accent: '#e7ca83', pattern: 'stars' },
  { name: 'Heart of Gold', note: 'Golden glaze. A big heart.', body: '#c49d46', shade: '#876931', rim: '#f0dd9d', accent: '#a14d3b', pattern: 'heart' },
];
export function rollBowl(random = Math.random) { return Math.floor(random() * BOWLS.length); }
export function thirdStep(stage) {
  if (stage === 'duel' || stage === 'over') return 'DUEL THE CHEF';
  if (stage === 'boss' || stage === 'boss-intro') return 'SECRET MINIBOSS';
  if (stage === 'goat') return 'ABSOLUTE GOAT';
  return '??';
}
export const CHEF_IDLE_MS = 30_000;
export function watchChefIdle(onChange) {
  let asleep = false;
  let timer;
  function activity() {
    clearTimeout(timer);
    if (asleep) { asleep = false; onChange(false); }
    timer = setTimeout(() => { asleep = true; onChange(true); }, CHEF_IDLE_MS);
  }
  activity();
  return { activity, dispose: () => clearTimeout(timer) };
}
