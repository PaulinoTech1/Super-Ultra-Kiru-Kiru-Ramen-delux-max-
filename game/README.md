# Ramen Time

A small browser ramen game set at a fictional Worcester, MA counter. Pixel art is drawn directly on a low-resolution canvas: no image downloads, game engine, external fonts, account, or database needed for gameplay.

## Run

Requires Node 22.13 or later.

    cd game
    npm ci
    npm run dev

Open the URL printed by the server. Run `npm test` for the card-rule tests, `npx tsc --noEmit --incremental false` for type checking, and `npm run build` for the Sites-compatible production build.

## Play

Start each order by rolling a six-sided die for one of six unique ceramic bowls, each with its own palette and pixel pattern. The roll stays fixed for that order. Chef Kenji is the Chief Ramen Officer; after 30 seconds without pointer, keyboard, scroll, or focus activity, a sleepy bubble appears over his head. Activity wakes him immediately. Step three and its card-game hints stay hidden until the encounter begins.

Choose from ramen, pizza, or a burger. Five non-ramen choices exhaust the chef's patience and leave only ramen. Add noodles and any of seven optional toppings. Draw against the chef from a single Fisher-Yates-shuffled 52-card deck. Aces are high; ties discard both cards and draw again. If all 26 pairs tie, the game ends in a shared draw. Restart creates a fresh bowl and deck.

Tap the order number or Worcester pronunciation note for hidden dialogue. Try the hot sauce. Sound is opt-in. The game runs entirely in the browser after loading; Sites access protection is separate from gameplay.

Ajitama now has quantity controls. Add a fourth egg to summon the Shrewsbury Street wild-chicken miniboss. Click or tap ahead of the moving chicken to throw an egg; keyboard players can aim with the arrow keys and throw with Space or Enter. Eggs have flight time, misses do not count, and three hits award ABSOLUTE GOAT status and complete the order instead of the card duel. Chef supplies noodles if needed. Replay clears the egg count and encounter progress.
