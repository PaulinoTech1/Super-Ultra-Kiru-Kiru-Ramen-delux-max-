// Pure rules for the Slosh & Sons drink rush boss fight.
// Lenny, the worst beverage distributor in Worcester County, slides Japanese
// sodas and teas (all non-alcoholic) down a conveyor toward you. Grab the
// drinks your tickets call for, serve them before patience runs out, and
// survive Lenny's "help". Never let anyone order the cider.

export const SHIFT_SECONDS = 90;
export const SERVE_GOAL = 8;
export const MAX_WALKOUTS = 3;
export const MAX_TICKETS = 3;
export const TICKET_PATIENCE_TICKS = 450; // 45s at 100ms ticks
export const DRINK_SPAWN_TICKS = 17;
export const BELT_SPEED = 4.5; // percent of belt width per tick
export const REVIEW_COOLDOWN_MS = 25000;
export const REVIEW_CALM_MS = 6000; // Lenny sends only correct drinks
export const LENNY_EVENT_MIN_TICKS = 110;
export const LENNY_EVENT_MAX_TICKS = 150;
export const KEG_HP = 5;
export const KEG_ROLL_SPEED = 3; // percent per tick toward the player
export const CRATE_TAPS = 3;
export const SPILL_TAPS = 2;
export const SPILL_TICKS = 60; // 6s to mop before it spreads
export const SPILL_PATIENCE_HIT = 35;
export const DAZE_MS = 2000;

export const DRINKS = [
  { id: "ramune", name: "Ramune", glyph: "🫧", color: "#7dd3fc" },
  { id: "mugicha", name: "Mugicha", glyph: "🍵", color: "#c9a06a" },
  { id: "calpis", name: "Calpis", glyph: "🥛", color: "#f5f0e6" },
  { id: "yuzu-soda", name: "Yuzu Soda", glyph: "🍋", color: "#fde047" },
  { id: "melon-soda", name: "Melon Soda", glyph: "🍈", color: "#86efac" },
  { id: "pocari", name: "Pocari Sweat", glyph: "🧃", color: "#bae6fd" },
  { id: "ryokucha", name: "Ryokucha", glyph: "🍃", color: "#4ade80" },
  { id: "cider", name: "Mitsuya Cider", glyph: "🍏", color: "#d9f99d" },
];

// Cider rage: if any active ticket wants cider, Lenny loses it and his
// fumbles come twice as fast until the cider ticket is gone.
export const CIDER_ID = "cider";
export const CIDER_RAGE_EVENT_MIN_TICKS = 55;
export const CIDER_RAGE_EVENT_MAX_TICKS = 85;

export function isCiderRage(tickets) {
  return tickets.some((t) => t.drink === CIDER_ID);
}

export function rageEventInTicks(rand = Math.random) {
  return (
    CIDER_RAGE_EVENT_MIN_TICKS +
    Math.floor(rand() * (CIDER_RAGE_EVENT_MAX_TICKS - CIDER_RAGE_EVENT_MIN_TICKS))
  );
}

export function drinkById(id) {
  return DRINKS.find((d) => d.id === id);
}

export function randomDrinkId(rand = Math.random) {
  return DRINKS[Math.floor(rand() * DRINKS.length)].id;
}

// New ticket drink: never duplicate a drink already on an active ticket.
export function randomTicketDrink(activeDrinks, rand = Math.random) {
  const pool = DRINKS.filter((d) => !activeDrinks.includes(d.id));
  const list = pool.length ? pool : DRINKS;
  return list[Math.floor(rand() * list.length)].id;
}

export function makeTicket(key, activeDrinks, rand = Math.random) {
  return { key, drink: randomTicketDrink(activeDrinks, rand), patience: 100 };
}

export function serveMatches(heldId, ticket) {
  return heldId !== null && ticket !== undefined && heldId === ticket.drink;
}

export function lennyEventInTicks(rand = Math.random) {
  return (
    LENNY_EVENT_MIN_TICKS +
    Math.floor(rand() * (LENNY_EVENT_MAX_TICKS - LENNY_EVENT_MIN_TICKS))
  );
}

// The whole shift state. Tick is pure: (game, now, rand) -> next game.
export function initialShift() {
  return {
    ticksLeft: SHIFT_SECONDS * 10,
    served: 0,
    walkouts: 0,
    tickets: [],
    belt: [],
    held: null,
    crate: null, // { tapsLeft }
    spill: null, // { tapsLeft, ticksLeft }
    keg: null, // { x, hp }
    spawnIn: 8,
    eventIn: 80, // first fumble comes early
    calmUntil: 0,
    reviewCooldownUntil: 0,
    dazedUntil: 0,
    result: null, // "win" | "lose"
    nextKey: 1,
  };
}

function patienceDrainPerTick() {
  return 100 / TICKET_PATIENCE_TICKS;
}

export function tickShift(g, now, rand = Math.random) {
  if (g.result) return g;
  const next = { ...g, tickets: [...g.tickets], belt: [...g.belt] };
  next.ticksLeft -= 1;
  if (next.ticksLeft <= 0) {
    next.result = "lose"; // serving the goal ends the shift early with a win
    return next;
  }

  // Patience drains; expired tickets walk out and are replaced.
  const drain = patienceDrainPerTick();
  next.tickets = next.tickets.map((t) => ({ ...t, patience: t.patience - drain }));
  const expired = next.tickets.filter((t) => t.patience <= 0);
  if (expired.length) {
    next.walkouts += expired.length;
    const kept = next.tickets.filter((t) => t.patience > 0);
    for (let i = 0; i < expired.length; i++) {
      kept.push(makeTicket(next.nextKey, kept.map((t) => t.drink), rand));
      next.nextKey += 1;
    }
    next.tickets = kept;
    if (next.walkouts >= MAX_WALKOUTS) {
      next.result = "lose";
      return next;
    }
  }
  while (next.tickets.length < MAX_TICKETS) {
    next.tickets.push(
      makeTicket(next.nextKey++, next.tickets.map((t) => t.drink), rand),
    );
  }

  // Belt slides; drinks that fall off are gone.
  next.belt = next.belt
    .map((b) => ({ ...b, x: b.x + BELT_SPEED }))
    .filter((b) => b.x <= 108);

  // Drink spawner. While Lenny is calmed by the review threat he only
  // sends drinks the tickets actually need.
  next.spawnIn -= 1;
  if (next.spawnIn <= 0) {
    next.spawnIn = DRINK_SPAWN_TICKS;
    let drink;
    if (now < next.calmUntil && next.tickets.length) {
      const need = next.tickets.map((t) => t.drink);
      drink = need[Math.floor(rand() * need.length)];
    } else {
      drink = randomDrinkId(rand);
    }
    next.belt.push({ key: next.nextKey++, drink, x: -8 });
  }

  // Lenny's fumbles: one at a time. Twice as fast while he's raging about cider.
  next.eventIn -= 1;
  if (next.eventIn <= 0) {
    next.eventIn = isCiderRage(next.tickets)
      ? rageEventInTicks(rand)
      : lennyEventInTicks(rand);
    if (!next.crate && !next.spill && !next.keg) {
      const roll = rand();
      if (roll < 0.34) next.crate = { tapsLeft: CRATE_TAPS };
      else if (roll < 0.67) next.spill = { tapsLeft: SPILL_TAPS, ticksLeft: SPILL_TICKS };
      else next.keg = { x: 100, hp: KEG_HP };
    }
  }

  // An unmopped spill spreads: every ticket loses patience.
  if (next.spill) {
    next.spill = { ...next.spill, ticksLeft: next.spill.ticksLeft - 1 };
    if (next.spill.ticksLeft <= 0) {
      next.spill = null;
      next.tickets = next.tickets.map((t) => ({
        ...t,
        patience: Math.max(0, t.patience - SPILL_PATIENCE_HIT),
      }));
    }
  }

  // The mystery keg rolls toward the player.
  if (next.keg) {
    const x = next.keg.x - KEG_ROLL_SPEED;
    if (x <= 8) {
      next.keg = null;
      next.held = null;
      next.dazedUntil = now + DAZE_MS;
    } else {
      next.keg = { ...next.keg, x };
    }
  }

  return next;
}

// Player actions. Each is pure: (game, now, rand) -> next game.
export function grabDrink(g, key, now) {
  if (g.result || g.crate || now < g.dazedUntil) return g;
  const drink = g.belt.find((b) => b.key === key);
  if (!drink) return g;
  return {
    ...g,
    held: drink.drink,
    belt: g.belt.filter((b) => b.key !== key),
  };
}

export function serveTicket(g, key) {
  if (g.result || !g.held) return { game: g, served: false };
  const ticket = g.tickets.find((t) => t.key === key);
  if (!ticket || !serveMatches(g.held, ticket)) return { game: g, served: false };
  const served = g.served + 1;
  const tickets = g.tickets.map((t) =>
    t.key === key
      ? makeTicket(g.nextKey, g.tickets.filter((x) => x.key !== key).map((x) => x.drink))
      : t,
  );
  const next = {
    ...g,
    served,
    held: null,
    tickets,
    nextKey: g.nextKey + 1,
    result: served >= SERVE_GOAL ? "win" : g.result,
  };
  return { game: next, served: true };
}

export function tapCrate(g) {
  if (!g.crate) return g;
  const tapsLeft = g.crate.tapsLeft - 1;
  return { ...g, crate: tapsLeft <= 0 ? null : { tapsLeft } };
}

export function tapSpill(g) {
  if (!g.spill) return g;
  const tapsLeft = g.spill.tapsLeft - 1;
  return { ...g, spill: tapsLeft <= 0 ? null : { ...g.spill, tapsLeft } };
}

export function tapKeg(g, rand = Math.random) {
  if (!g.keg) return { game: g, burst: false };
  const hp = g.keg.hp - 1;
  if (hp > 0) {
    return { game: { ...g, keg: { x: g.keg.x + 12, hp } }, burst: false };
  }
  // Busted! The keg bursts into a drink a ticket actually needs.
  let held = g.held;
  if (!held && g.tickets.length) {
    const need = g.tickets.map((t) => t.drink);
    held = need[Math.floor(rand() * need.length)];
  }
  return { game: { ...g, keg: null, held }, burst: true };
}

export function threatenReview(g, now) {
  if (g.result || now < g.reviewCooldownUntil) return g;
  return {
    ...g,
    reviewCooldownUntil: now + REVIEW_COOLDOWN_MS,
    calmUntil: now + REVIEW_CALM_MS,
  };
}
