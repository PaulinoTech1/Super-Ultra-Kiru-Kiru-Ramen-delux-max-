export const ingredientReactions = {
  corn: { add: "A little sunshine. Fine.", remove: "The sunshine has left the building." },
  hot: { add: "A little danger. Fine.", remove: "A tactical retreat. Respect." },
  ajitama: { add: "An eggcellent decision.", remove: "The egg has left the chat." },
  mushrooms: { add: "Earthy. Mysterious. Acceptable.", remove: "The forest has been evicted." },
  bamboo: { add: "Crunch with architectural ambition.", remove: "No more bamboo architecture." },
} as const;

export const bowlGreetings: Record<string, string> = {
  "Union Midnight": "For people whose bedtime is a suggestion.",
  "Heart of Gold": "Good bowl. Questionable customer.",
  "Worcester Classic": "A local legend in ceramic form.",
  "Shrewsbury Stripe": "Stripes make every slurp look faster.",
  "Canal Blue": "A cool bowl for a very warm broth.",
  "Market Special": "The market approves this decision.",
};

export const refusalDialogue = {
  pizza: ["Pizza is not ramen.", "That is a flat circle of betrayal.", "Kenji is choosing patience today.", "One more pizza request and the counter gets awkward.", "Pizza has been removed from the menu."],
  burger: ["Burgers have their own destiny.", "Please do not make me explain buns to ramen.", "Kenji is still being professional.", "The grill is not taking requests today.", "Burger has been removed from the menu."],
};

export const specialSigns = [
  "Today’s special: ramen. Tomorrow’s forecast: ramen.",
  "Soup of the day: technically a lifestyle.",
  "No substitutions for good manners.",
] as const;

export const discoveryDefinitions = [
  ["patience", "Exhaust the chef’s patience.", "Try the forbidden menu choices."],
  ["wake", "Wake the chef.", "Tap through a sleepy moment."],
  ["logo", "Discover the logo secret.", "Tap the ramen mark three times."],
  ["bottles", "Knock over both bottles.", "Tap the bottles on the counter."],
  ["sign", "Discover the restaurant sign’s secret.", "Tap the 508 stamp."],
  ["sweet-heat", "Make The Sweet Heat.", "Combine corn and hot sauce."],
] as const;

export function bowlNickname(selected: string[], allIngredients: string[]) {
  const has = (id: string) => selected.includes(id);
  if (allIngredients.every(has)) return "The Entire Fridge";
  if (has("corn") && has("hot")) return "The Sweet Heat";
  if (has("noodles") && selected.length === 1) return "The Minimalist";
  if (has("mushrooms") && has("bamboo")) return "The Forest Floor";
  return "The House Special";
}

export function orderTitle(selected: string[], knockedBottles: number[], eggs: number) {
  if (knockedBottles.length === 2) return ["Certified Counter Menace", "The counter remembers everything."];
  if (selected.includes("corn") && selected.includes("hot")) return ["Corn Enthusiast", "Sweet heat, strong opinions."];
  if (eggs >= 3) return ["Eggsistential Threat", "You asked a difficult question of the chicken."];
  return ["Minimalist", "Sometimes the quiet bowl wins."];
}

export function loadDiscoveries() {
  try {
    const raw = window.localStorage.getItem("kuru-kuru-discoveries");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch { return []; }
}

export function saveDiscoveries(ids: string[]) {
  try { window.localStorage.setItem("kuru-kuru-discoveries", JSON.stringify([...new Set(ids)])); } catch { /* persistence is optional */ }
}
