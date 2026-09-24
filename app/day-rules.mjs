// Day-cycle rules for Ramen Time: shifts, scoring, hearts, and records.
// Pure functions only; the React shell in page.tsx owns rendering and timers.

export const CUSTOMERS_PER_DAY = 5;
export const FINAL_DAY = 5;
export const MAX_HEARTS = 3;
export const BASE_PAY = 50;
export const TIP_PER_TOPPING = 10;
export const DUEL_WIN_BONUS = 30;
export const GOAT_BONUS = 100;

// The nuke: a rage button for boss fights. Costs real coins, ends the run.
export const NUKE_COST = 300;
export function spendCoins(run, amount) {
  if (run.totalCoins < amount) return { run, ok: false };
  return {
    run: {
      ...run,
      totalCoins: run.totalCoins - amount,
      coins: Math.max(0, run.coins - amount),
    },
    ok: true,
  };
}

// Customer types. Patience is seconds of real time while the bowl is built
// and dueled; an empty meter means a walkout. Quirks make types matter.
export const CUSTOMER_TYPES = {
  regular: { name: "Regular", patience: 60, blurb: "Knows the menu. Knows the wait." },
  rusher: { name: "Rusher", patience: 35, blurb: "Double-parked outside. The meter is running.", bonus: 25 },
  critic: { name: "Critic", patience: 90, blurb: "Writes reviews. A loaded bowl (4+ toppings) or half pay.", minToppings: 4 },
  sleeper: { name: "Sleeper", patience: 50, blurb: "Jet-lagged. Patience drains half as fast.", drain: 0.5 },
  boss: { name: "Dario", patience: Infinity, blurb: "He came in person this time." },
};
export function patienceFor(typeId) {
  return CUSTOMER_TYPES[typeId]?.patience ?? CUSTOMER_TYPES.regular.patience;
}

// Five customers a day. Later days get spicier; day 5 ends with the boss.
const DAY_LINEUPS = {
  1: ["regular", "regular", "regular", "regular", "regular"],
  2: ["regular", "regular", "regular", "regular", "rusher"],
  3: ["regular", "regular", "regular", "rusher", "sleeper"],
  4: ["regular", "regular", "rusher", "critic", "sleeper"],
  5: ["regular", "rusher", "critic", "sleeper", "boss"],
};
export function customersForDay(day, rand = Math.random) {
  const key = Math.min(Math.max(day || 1, 1), FINAL_DAY);
  const lineup = [...(DAY_LINEUPS[key] ?? DAY_LINEUPS[1])];
  const boss = lineup[lineup.length - 1] === "boss" ? lineup.pop() : null;
  for (let i = lineup.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [lineup[i], lineup[j]] = [lineup[j], lineup[i]];
  }
  if (boss) lineup.push(boss);
  return lineup;
}

// Difficulty select (settings UI): how forgiving a day is.
export const HEARTS_BY_DIFFICULTY = { easy: 4, normal: 3, hard: 2 };
export function heartsForDifficulty(difficulty) {
  return HEARTS_BY_DIFFICULTY[difficulty] ?? MAX_HEARTS;
}

const BEST_KEY = "kuru-kuru-best";

// A run tracks the whole shift arc. `result` is null while the day is live,
// then "day-end" | "gameover" | "victory" once the day resolves.
export function initialRun(maxHearts = MAX_HEARTS) {
  return {
    day: 1,
    customer: 1,
    customers: customersForDay(1),
    hearts: maxHearts,
    coins: 0,       // coins earned today
    totalCoins: 0,  // coins earned across the whole run
    served: 0,      // happy customers today
    perfect: 0,     // duel/goat wins today
    totalServed: 0, // happy customers across the whole run
    totalPerfect: 0,// duel/goat wins across the whole run
    lostHearts: 0,  // hearts lost today (drives the star rating)
    result: null,
  };
}

// Open the next day: per-day counters reset, day number and totals carry over.
export function startDay(run, maxHearts = MAX_HEARTS) {
  return {
    ...run,
    customer: 1,
    customers: customersForDay(run.day),
    hearts: maxHearts,
    coins: 0,
    served: 0,
    perfect: 0,
    lostHearts: 0,
    result: null,
  };
}

// Coins for one bowl. `selected` is the topping id list ("ajitama" counts once).
// `bonus` adds a flat tip (rushers served fast); `halve` is the critic's
// punishment for a lazy bowl.
export function bowlPayout(selected, { duelWon = false, goatWon = false, bonus = 0, halve = false } = {}) {
  let pay = BASE_PAY + TIP_PER_TOPPING * selected.length;
  if (duelWon) pay += DUEL_WIN_BONUS;
  if (goatWon) pay += GOAT_BONUS;
  pay += bonus;
  if (halve) pay = Math.floor(pay / 2);
  return pay;
}

function advance(run) {
  if (run.customer >= CUSTOMERS_PER_DAY) {
    return { ...run, result: run.day >= FINAL_DAY ? "victory" : "day-end" };
  }
  return { ...run, customer: run.customer + 1, result: null };
}

// A happy customer pays up and the line moves on.
export function serveBowl(run, selected, opts = {}) {
  const earned = bowlPayout(selected, opts);
  const perfect = opts.duelWon || opts.goatWon ? 1 : 0;
  const next = {
    ...run,
    coins: run.coins + earned,
    totalCoins: run.totalCoins + earned,
    served: run.served + 1,
    perfect: run.perfect + perfect,
    totalServed: run.totalServed + 1,
    totalPerfect: run.totalPerfect + perfect,
  };
  return { run: advance(next), earned };
}

// An unhappy customer costs a heart. Zero hearts closes the shop early.
export function loseCustomer(run) {
  const hearts = run.hearts - 1;
  const next = { ...run, hearts: Math.max(0, hearts), lostHearts: run.lostHearts + 1 };
  if (hearts <= 0) return { run: { ...next, result: "gameover" } };
  return { run: advance(next) };
}

// 3 stars for a flawless day, 2 for one walkout, 1 for a rough shift.
export function starsForDay(lostHearts) {
  if (lostHearts <= 0) return 3;
  if (lostHearts === 1) return 2;
  return 1;
}

// Persisted records: best day reached, best single-day coins, total bowls ever.
export function loadBest() {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    if (!raw) return { day: 0, coins: 0, bowls: 0 };
    const parsed = JSON.parse(raw);
    return {
      day: Number(parsed.day) || 0,
      coins: Number(parsed.coins) || 0,
      bowls: Number(parsed.bowls) || 0,
    };
  } catch {
    return { day: 0, coins: 0, bowls: 0 };
  }
}

export function saveBest(best) {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(best));
  } catch { /* records are optional */ }
}

// Fold a finished day (or failed run) into the records.
export function recordRun(best, run) {
  return {
    day: Math.max(best.day, run.day),
    coins: Math.max(best.coins, run.coins),
    bowls: best.bowls + run.served,
  };
}
