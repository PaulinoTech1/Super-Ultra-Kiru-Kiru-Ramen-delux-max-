// Pure rules for the Chef Dario cookoff duel.
// Both chefs race to build the same ticket order. The player can throw
// fire-coated eggs to stun Dario and knock his latest topping off.

export const COOKOFF_WINS_NEEDED = 2; // best of 3
export const DARIO_STUN_MS = 3000;
export const FIRE_EGG_COOLDOWN_MS = 4000;
export const FIRE_EGG_FLIGHT_MS = 650; // purely visual egg flight; the stun and knockoff land at throw time
export const ROUND_END_MS = 2200;

// Ticket orders. Topping ids match the build-screen ingredient list.
export const DUEL_ORDERS = [
  { name: "The Sweet Heat", toppings: ["noodles", "corn", "hot"], eggs: 0 },
  { name: "The Minimalist", toppings: ["noodles"], eggs: 0 },
  { name: "Seaweed Lover", toppings: ["noodles", "nori", "scallions"], eggs: 0 },
  { name: "Main South Special", toppings: ["noodles", "chashu", "hot", "scallions"], eggs: 1 },
  { name: "Pork Party", toppings: ["noodles", "chashu", "naruto", "scallions"], eggs: 2 },
  { name: "Almost Fridge", toppings: ["noodles", "chashu", "nori", "scallions", "corn", "naruto"], eggs: 2 },
];

// Dario adds one correct topping per interval. He gets faster every round.
export function darioIntervalMs(roundIndex) {
  return Math.max(1400, 4200 - roundIndex * 800);
}

// Pick a ticket, avoiding repeats within a duel when possible.
export function pickOrder(usedNames = [], rand = Math.random) {
  const pool = DUEL_ORDERS.filter((o) => !usedNames.includes(o.name));
  const list = pool.length ? pool : DUEL_ORDERS;
  return list[Math.floor(rand() * list.length)];
}

// The player's bowl matches the ticket: exact topping set plus egg count.
// "ajitama" in the selection is ignored; the egg count is checked separately.
export function orderMatches(selected, eggs, order) {
  const tops = selected.filter((id) => id !== "ajitama");
  return (
    eggs === order.eggs &&
    tops.length === order.toppings.length &&
    order.toppings.every((id) => tops.includes(id))
  );
}

// Dario always builds the ticket in order, so his next topping is the first
// ticket topping he has not placed yet. Returns null when he is done.
export function darioNextTopping(darioToppings, order) {
  return order.toppings.find((id) => !darioToppings.includes(id)) ?? null;
}

// Dario's next build step: toppings first, then the ticket's eggs, then done.
// The player must match the full ticket including eggs, so Dario has to cook
// the eggs too; otherwise he could win an egg ticket without cracking one.
export function darioNextStep(darioToppings, darioEggs, order) {
  const topping = darioNextTopping(darioToppings, order);
  if (topping) return { kind: "topping", id: topping };
  if (darioEggs < order.eggs) return { kind: "egg" };
  return null;
}

export function darioIsDone(darioToppings, darioEggs, order) {
  return darioNextStep(darioToppings, darioEggs, order) === null;
}

// A fire egg knocks Dario's most recently placed topping off his bowl.
export function fireEggKnockoff(darioToppings) {
  return darioToppings.slice(0, -1);
}
