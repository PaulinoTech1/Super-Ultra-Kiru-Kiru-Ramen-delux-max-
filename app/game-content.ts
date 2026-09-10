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
  ["patience", "Chef’s Patience", "Some cravings test a chef’s hospitality.", "Reach the final refusal level that removes the non-ramen choices."],
  ["wake", "Sleeping on the Job", "Even the person making dinner needs a break.", "Activate the wake button while Chef Kenji is asleep."],
  ["logo", "Round and Round", "First impressions sometimes deserve another look. And another.", "Activate the triple-tap logo secret."],
  ["bottles", "Counter Menace", "A little clumsiness can change the evening.", "Knock over both bottles during bowl building."],
  ["sign", "Local Soul", "There’s hometown pride stamped on this place.", "Activate the 508 stamp secret."],
  ["sweet-heat", "The Sweet Heat", "A little sunshine can have a dangerous side.", "Have corn and hot sauce selected together."],
  ["location", "Find Your Way", "Every good bowl comes from somewhere.", "Activate the location message."],
  ["order", "Your Number’s Up", "Your order number might mean more than your place in line.", "Activate the Order #0508 message."],
  ["local-say", "Say It Like a Local", "The city’s name has fewer sounds than you might expect.", "Activate the Worcester pronunciation joke."],
  ["fridge", "The Entire Fridge", "Restraint is one approach. There is another.", "Select every available ingredient simultaneously."],
  ["minimalist", "The Minimalist", "Sometimes the essentials are enough.", "Select noodles with no other ingredients."],
  ["chicken", "An Unexpected Guest", "The kitchen’s generosity has its limits.", "Enter the normal chicken encounter."],
  ["fiery", "Too Hot to Handle", "A little heat can make a surprise much less ordinary.", "Enter the fiery chicken encounter."],
  ["golden", "A Golden Problem", "An extravagant order may attract extravagant company.", "Enter the golden chicken encounter."],
  ["goat", "Absolute GOAT", "Some customers leave with more than a full bowl.", "Win a chicken encounter and reach its victory ending."],
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

export const discoveryIds = new Set<string>(discoveryDefinitions.map(([id]) => id));

export function validDiscoveries(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && discoveryIds.has(id)))];
}

export function loadDiscoveries() {
  try {
    const raw = window.localStorage.getItem("kuru-kuru-discoveries");
    return validDiscoveries(raw ? JSON.parse(raw) : []);
  } catch { return []; }
}

export function saveDiscoveries(ids: string[]) {
  try { window.localStorage.setItem("kuru-kuru-discoveries", JSON.stringify(validDiscoveries(ids))); } catch { /* persistence is optional */ }
}
