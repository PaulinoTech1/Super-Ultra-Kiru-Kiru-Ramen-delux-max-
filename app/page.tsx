"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { makeDeck, drawRound, openingReply } from "./rules.mjs";
import ChickenBoss from "./ChickenBoss";
import BowlRoll from "./BowlRoll";
import { BOWLS, rollBowl, thirdStep } from "./kitchen-rules.mjs";
import { bowlGreetings, bowlNickname, discoveryDefinitions, ingredientReactions, loadDiscoveries, orderTitle, refusalDialogue, saveDiscoveries, specialSigns } from "./game-content";
import {
  needsChickenBoss,
  MAX_AJITAMA,
  addAjitama,
  ajitamaPositions,
} from "./chicken-rules.mjs";
const items = [
  ["noodles", "Noodles", "The good, slurpy stuff", "≋", "#edc675"],
  ["ajitama", "Ajitama", "Jammy. Marinated. Perfect.", "◒", "#f4ad39"],
  ["chashu", "Chashu", "Slow-braised pork belly", "▤", "#d88e76"],
  ["nori", "Nori", "A little taste of the sea", "▥", "#63836b"],
  ["scallions", "Scallions", "Fresh-cut green goodness", "⁙", "#95b777"],
  ["corn", "Sweet corn", "Tiny golden treasures", "⠿", "#e8c65e"],
  ["hot", "Hot sauce", "Main South kind of heat", "♨", "#dc6946"],
  ["naruto", "Narutomaki", "A very good spiral", "◎", "#eba8a0"],
];
function Shop({
  toppings,
  eggs,
  bowlIndex,
  sleepy,
  knockedBottles,
  onBottleKnock,
}: {
  toppings: string[];
  eggs: number;
  bowlIndex: number | null;
  sleepy: boolean;
  knockedBottles: number[];
  onBottleKnock: (index: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    const bowl =
      bowlIndex === null
        ? {
            body: "#807c69",
            shade: "#59584a",
            rim: "#d0c6a6",
            accent: "#d0c6a6",
            pattern: "",
          }
        : BOWLS[bowlIndex];
    const r = (x: number, y: number, w: number, h: number, color: string) => {
      c.fillStyle = color;
      c.fillRect(x, y, w, h);
    };
    const t = (text: string, x: number, y: number, color: string, size = 8) => {
      c.fillStyle = color;
      c.font = `bold ${size}px monospace`;
      c.fillText(text, x, y);
    };
    r(0, 0, 640, 350, "#282924");
    for (let y = 12; y < 230; y += 24)
      for (let x = y % 48 ? 0 : 24; x < 640; x += 48) {
        r(x, y, 46, 22, "#30312a");
        r(x + 3, y + 2, 40, 1, "#37372e");
      }
    r(38, 39, 180, 127, "#181e1e");
    r(44, 45, 168, 113, "#44534c");
    for (let i = 0; i < 13; i++) {
      r(46 + i * 13, 110 - (i % 4) * 12, 12, 49 + (i % 4) * 12, "#273933");
      r(49 + i * 13, 119 - (i % 4) * 12, 3, 4, "#8b8761");
    }
    r(119, 48, 6, 112, "#796d4d");
    r(44, 100, 168, 5, "#796d4d");
    t("WORCESTER", 65, 69, "#c7c29b", 12);
    t("THE HEART OF THE COMMONWEALTH", 49, 84, "#9caa91", 6);
    r(268, 33, 126, 70, "#171c18");
    r(274, 39, 114, 58, "#8d4932");
    t("KURU KURU", 292, 51, "#f0c56f", 9);
    t("RAMEN", 282, 70, "#f4d59a", 23);
    t("HOT BOWLS / GOOD SOULS", 280, 89, "#ebc18a", 8);
    for (const [i, x] of [235, 421].entries()) {
      if (knockedBottles.includes(i)) {
        r(x - 4, 76, 44, 7, "#734930");
        r(x + 9, 69, 30, 7, "#d08443");
      } else {
        r(x + 11, 0, 2, 32, "#b18754");
        r(x + 3, 32, 22, 7, "#734930");
        r(x, 39, 28, 43, "#d08443");
        r(x + 4, 39, 20, 43, "#e9a857");
        r(x + 12, 42, 4, 35, "#c97c40");
        r(x + 3, 82, 22, 5, "#734930");
      }
    }
    c.strokeStyle = "#e8c65e";
    c.strokeRect(230, 0, 38, 88);
    c.strokeRect(416, 0, 38, 88);
    r(485, 40, 110, 99, "#c2b58e");
    r(491, 46, 98, 87, "#ded0a5");
    t("HOUSE RULES", 499, 61, "#624d37", 9);
    t("1. EAT RAMEN", 499, 79, "#624d37");
    t("2. SLURP LOUD", 499, 94, "#624d37");
    t("3. IT'S WUSS-TER", 497, 115, "#9f503a");
    r(0, 176, 640, 9, "#82704a");
    r(0, 185, 640, 11, "#171c19");
    for (let i = 0; i < 5; i++) {
      r(48 + i * 24, 148, 14, 27, ["#835540", "#9a804b", "#586b4e"][i % 3]);
      r(51 + i * 24, 143, 8, 5, "#cab27c");
    }
    r(305, 109, 49, 11, "#e8dfbd");
    r(298, 119, 64, 17, "#f3e8c8");
    r(310, 136, 41, 34, "#cc9a6e");
    r(307, 139, 7, 18, "#5c4735");
    r(350, 139, 6, 18, "#5c4735");
    r(316, 144, 5, 5, "#262b24");
    r(339, 144, 5, 5, "#262b24");
    r(325, 157, 13, 3, "#6e4130");
    r(302, 172, 61, 44, "#e9dcb8");
    r(320, 172, 21, 43, "#64776c");
    r(288, 181, 15, 26, "#cc9a6e");
    r(363, 181, 15, 26, "#cc9a6e");
    r(0, 216, 640, 10, "#c3935e");
    r(0, 226, 640, 77, "#997046");
    for (let y = 228; y < 300; y += 25) {
      r(0, y, 640, 2, "#765335");
      for (let x = y % 2 ? 0 : 83; x < 640; x += 143) r(x, y, 2, 25, "#765335");
    }
    r(0, 302, 640, 48, "#4b3d2a");
    r(0, 303, 640, 5, "#2b2b21");
    r(24, 246, 106, 39, "#d8c49b");
    t("ORDER No. 508", 30, 260, "#66503a", 10);
    t("GOOD BOWLS ONLY", 30, 275, "#927c55");
    r(520, 210, 22, 58, "#ad4f37");
    r(524, 200, 14, 11, "#433b29");
    r(521, 232, 20, 19, "#e8cf97");
    t("HOT", 523, 245, "#8c4932");
    r(565, 218, 22, 46, "#3d4937");
    r(568, 207, 16, 13, "#c0a36d");
    r(228, 283, 203, 9, "#795535");
    r(235, 245, 185, 13, bowl.rim);
    r(239, 258, 177, 13, bowl.body);
    r(251, 271, 153, 13, bowl.body);
    r(269, 284, 117, 12, bowl.shade);
    r(293, 296, 70, 5, bowl.rim);
    if (bowl.pattern === "stripes") {
      r(251, 268, 153, 3, bowl.accent);
      r(269, 279, 117, 3, bowl.accent);
    }
    if (bowl.pattern === "dots")
      for (let i = 0; i < 12; i++)
        r(266 + (i % 6) * 23, 264 + Math.floor(i / 6) * 12, 4, 4, bowl.accent);
    if (bowl.pattern === "checks")
      for (let i = 0; i < 16; i++)
        r(
          265 + (i % 8) * 16,
          263 + Math.floor(i / 8) * 11,
          8,
          7,
          i % 2 === Math.floor(i / 8) ? bowl.accent : bowl.shade,
        );
    if (bowl.pattern === "hills")
      for (let i = 0; i < 7; i++) {
        r(267 + i * 18, 273, 14, 4, bowl.accent);
        r(271 + i * 18, 269, 6, 4, bowl.accent);
      }
    if (bowl.pattern === "stars")
      for (let i = 0; i < 5; i++) {
        const x = 279 + i * 24,
          y = 267 + (i % 2) * 10;
        r(x, y - 3, 3, 9, bowl.accent);
        r(x - 3, y, 9, 3, bowl.accent);
      }
    if (bowl.pattern === "heart") {
      r(315, 264, 9, 6, bowl.accent);
      r(330, 264, 9, 6, bowl.accent);
      r(315, 270, 24, 6, bowl.accent);
      r(321, 276, 12, 5, bowl.accent);
      r(324, 281, 6, 3, bowl.accent);
    }
    r(244, 238, 166, 19, "#dfc08a");
    r(253, 240, 148, 15, "#9c5b30");
    if (toppings.includes("noodles"))
      for (let i = 0; i < 8; i++) {
        r(265 + i * 15, 239, 8, 3, "#efd08a");
        r(269 + i * 15, 242, 8, 3, "#efd08a");
        r(265 + i * 15, 245, 8, 3, "#efd08a");
      }
    if (toppings.includes("nori")) {
      r(266, 212, 23, 30, "#354d3a");
      r(270, 215, 3, 22, "#56704b");
    }
    if (toppings.includes("chashu")) {
      r(351, 228, 35, 15, "#cf9976");
      r(357, 231, 24, 3, "#8d4c3c");
      r(360, 237, 18, 3, "#e9bd91");
    }

    if (toppings.includes("scallions"))
      for (let i = 0; i < 10; i++)
        r(277 + ((i * 23) % 112), 239 + (i % 3) * 4, 5, 3, "#86a96b");
    if (toppings.includes("corn"))
      for (let i = 0; i < 9; i++)
        r(265 + (i % 3) * 5, 244 + Math.floor(i / 3) * 3, 3, 2, "#f6cc4e");
    if (toppings.includes("hot"))
      for (let i = 0; i < 8; i++)
        r(280 + i * 14, 248 - (i % 3) * 2, 8, 2, "#d84428");
    if (toppings.includes("naruto")) {
      r(378, 227, 18, 18, "#f6dcc6");
      r(382, 231, 10, 10, "#cd7988");
      r(385, 234, 4, 4, "#f6dcc6");
    }
    if (toppings.includes("ajitama"))
      for (const { x, y } of ajitamaPositions(eggs)) {
        r(x, y, 21, 20, "#f1e2b5");
        r(x + 4, y - 4, 13, 27, "#f1e2b5");
        r(x + 6, y + 4, 10, 12, "#f0a135");
        r(x + 8, y + 6, 6, 7, "#dc7c27");
      }
    r(383, 202, 4, 38, "#d2ac6b");
    r(392, 196, 4, 44, "#d2ac6b");
    for (const x of [304, 332, 359]) {
      r(x, 200, 3, 11, "#afad8e");
      r(x + 3, 190, 3, 10, "#828b76");
      r(x, 184, 3, 6, "#626f60");
    }
    t("EST. 1988  /  OPEN LATE", 248, 332, "#ac956e", 9);
    if (sleepy) {
      r(316, 144, 5, 5, "#cc9a6e");
      r(339, 144, 5, 5, "#cc9a6e");
      r(315, 147, 8, 2, "#423a2c");
      r(338, 147, 8, 2, "#423a2c");
      r(357, 85, 47, 28, "#e8dfbd");
      r(353, 109, 10, 6, "#e8dfbd");
      r(350, 117, 4, 4, "#e8dfbd");
      t("Z", 362, 105, "#526247", 16);
      t("z", 376, 100, "#526247", 12);
      t("z", 387, 95, "#526247", 9);
    }
  }, [toppings, eggs, bowlIndex, sleepy, knockedBottles]);
  return (
    <canvas
      ref={ref}
      onClick={(event) => {
        const canvas = event.currentTarget;
        const scaleX = 640 / canvas.getBoundingClientRect().width;
        const x = (event.clientX - canvas.getBoundingClientRect().left) * scaleX;
        const index = x < 320 ? 0 : 1;
        if (!knockedBottles.includes(index)) onBottleKnock(index);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          const nextBottle = [0, 1].find((index) => !knockedBottles.includes(index));
          if (nextBottle !== undefined) onBottleKnock(nextBottle);
        }
      }}
      tabIndex={0}
      width={640}
      height={350}
      role="img"
      aria-label={`Pixel ramen shop. Two counter bottles are clickable; ${knockedBottles.length} of 2 knocked over. Press Enter or Space to knock over the next bottle. Chef Kenji, Chief Ramen Officer, is ${sleepy ? "sleeping" : "awake"}. ${bowlIndex === null ? "Unassigned bowl" : BOWLS[bowlIndex].name}. In your bowl: shoyu broth, ${toppings.map((id) => (id === "ajitama" ? `${eggs} ajitama` : id)).join(", ")}`}
    />
  );
}
export default function Home() {
  const [stage, S] = useState("roll"),
    [refusals, R] = useState(0),
    [selected, U] = useState<string[]>([]),
    [tab, T] = useState("ALL"),
    [deck, D] = useState<ReturnType<typeof makeDeck>>([]),
    [round, Q] = useState<ReturnType<typeof drawRound> | null>(null),
    [sound, M] = useState(false),
    [secret, E] = useState(""),
    [logoTaps, L] = useState(0),
    [help, H] = useState(false),
    [eggs, A] = useState(0),
    [bowlIndex, setBowlIndex] = useState<number | null>(null),
    [sleepy, setSleepy] = useState(false),
    [fieryChicken, setFieryChicken] = useState(false),
    [goldenChicken, setGoldenChicken] = useState(false),
    [knockedBottles, setKnockedBottles] = useState<number[]>([]),
    [duelLoss, setDuelLoss] = useState(false),
    [discoveries, setDiscoveries] = useState<string[]>(() => {
      if (typeof window === "undefined") return [];
      return loadDiscoveries();
    }),
    [discoveryToast, setDiscoveryToast] = useState<string | null>(null),
    [specialSign] = useState<string>(specialSigns[0]);
  const discoveriesReady = useRef(true);
  const musicRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (discoveriesReady.current) saveDiscoveries(discoveries);
  }, [discoveries]);
  function discover(id: string) {
    setDiscoveries((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      const definition = discoveryDefinitions.find(([entryId]) => entryId === id);
      if (definition) setDiscoveryToast(`Discovery unlocked: ${definition[1]}`);
      if (discoveriesReady.current) saveDiscoveries(next);
      return next;
    });
  }
  function revealSecret(text: string, discovery?: string) {
    if (!canPlay) return;
    if (discovery) discover(discovery);
    E(text);
  }
  const canPlay = !sleepy;
  useEffect(() => {
    if (!discoveryToast) return;
    const timer = window.setTimeout(() => setDiscoveryToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [discoveryToast]);
  useEffect(() => {
    const eligible = stage === "roll" || stage === "welcome" || stage === "build";
    if (!eligible || sleepy) return;
    let timer = window.setTimeout(() => setSleepy(true), 30_000);
    const activity = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setSleepy(true), 30_000);
    };
    const events = ["pointerdown", "pointermove", "keydown", "wheel", "scroll", "focus"];
    for (const event of events) window.addEventListener(event, activity, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, activity);
    };
  }, [stage, sleepy]);
  useEffect(() => {
    if (!sound) {
      if (musicTimerRef.current) clearTimeout(musicTimerRef.current);
      musicTimerRef.current = null;
      void musicRef.current?.close();
      musicRef.current = null;
      return;
    }
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    musicRef.current = audio;
    const notes = [146.83, 174.61, 220, 261.63, 293.66, 261.63, 220, 174.61];
    let index = 0;
    const playNote = () => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[index % notes.length];
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.018, audio.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.48);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.5);
      index += 1;
      musicTimerRef.current = setTimeout(playNote, 620);
    };
    void audio.resume().then(playNote);
    return () => {
      if (musicTimerRef.current) clearTimeout(musicTimerRef.current);
      musicTimerRef.current = null;
      void audio.close();
      if (musicRef.current === audio) musicRef.current = null;
    };
  }, [sound]);
  function roll() {
    if (!canPlay) return;
    beep();
    setBowlIndex(rollBowl());
  }

  function chooseBowl(index: number) {
    if (!canPlay || stage !== "roll") return;
    beep();
    setBowlIndex(index);
    E(`You chose the ${BOWLS[index].name}. Chef Kenji respects a decisive order.`);
  }

  function confirmBowl() {
    if (!canPlay) return;
    if (bowlIndex !== null) {
      E(bowlGreetings[BOWLS[bowlIndex].name] || "A bowl with excellent instincts.");
    }
    S("welcome");
  }

  function beep() {
    if (!sound) return;
    const a = new AudioContext(),
      o = a.createOscillator(),
      g = a.createGain();
    o.type = "square";
    o.frequency.value = 440;
    g.gain.value = 0.025;
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.07);
    o.onended = () => {
      void a.close();
    };
  }
  function wakeChef() {
    if (sleepy) {
      discover("wake");
      E("I was inspecting the inside of my eyelids.");
      setSleepy(false);
    }
  }
  function choose(ramen: boolean) {
    if (!canPlay) return;
    beep();
    if (ramen) S("build");
    else {
      const kind = refusals % 2 === 0 ? "pizza" : "burger";
      E(refusalDialogue[kind][Math.min(refusals, refusalDialogue[kind].length - 1)]);
      R((v) => Math.min(5, v + 1));
      if (refusals >= 4) discover("patience");
    }
  }
  function toggle(id: string) {
    if (!canPlay) return;
    beep();
    const removing = selected.includes(id);
    const next = removing ? selected.filter((x) => x !== id) : [...selected, id];
    U(next);
    if (id === "hot" && !removing && selected.includes("corn")) E("Sunshine with consequences.");
    else if (id === "hot" && !removing) E(ingredientReactions.hot.add);
    else if (id === "noodles" && removing) E("We were so close to making ramen.");
    else if (id === "corn" && !removing) E(ingredientReactions.corn.add);
    else if (id === "hot" && removing) E(ingredientReactions.hot.remove);
    else if (ingredientReactions[id as keyof typeof ingredientReactions]) E(ingredientReactions[id as keyof typeof ingredientReactions][removing ? "remove" : "add"]);
    if (next.includes("corn") && next.includes("hot")) discover("sweet-heat");
    const selectable = items.filter(([itemId]) => itemId !== "ajitama").map(([itemId]) => itemId);
    if (selectable.every((itemId) => next.includes(itemId))) discover("fridge");
    if (next.length === 1 && next.includes("noodles")) discover("minimalist");
  }
  function addEgg() {
    if (!canPlay || stage !== "build" || eggs >= MAX_AJITAMA) return;
    beep();
    const next = addAjitama(eggs);
    A(next);
    U((v) => (v.includes("ajitama") ? v : [...v, "ajitama"]));
    if (next === 1) E("An excellent decision.");
    else if (next === 2) E("A person of ambition.");
    else if (next === 3) E("Is this still ramen, or an eggsistential crisis?");
    if (needsChickenBoss(next)) {
      const hotSauceTriggered = selected.includes("hot");
      const allToppingsBeforeEggs = items
        .filter(([id]) => id !== "ajitama" && id !== "noodles")
        .every(([id]) => selected.includes(id));
      setGoldenChicken(allToppingsBeforeEggs);
      setFieryChicken(!allToppingsBeforeEggs && hotSauceTriggered);
      discover(allToppingsBeforeEggs ? "golden" : hotSauceTriggered ? "fiery" : "chicken");
      E(allToppingsBeforeEggs
        ? "Every topping before the fourth egg?! The golden chicken is here, and it throws electric eggs!"
        : hotSauceTriggered
          ? "You added hot sauce before the fourth egg. Now the wild chicken is on fire! Four hits to cool it down."
          : "Sorry, the wild chicken has us on rations.");
      S("boss-intro");
    }
  }
  function removeEgg() {
    if (!canPlay || stage !== "build" || eggs === 0) return;
    beep();
    A(eggs - 1);
    if (eggs === 1) U((v) => v.filter((x) => x !== "ajitama"));
  }
  function knockBottle(index: number) {
    if (!canPlay || stage !== "build" || knockedBottles.includes(index)) return;
    beep();
    const next = [...knockedBottles, index];
    setKnockedBottles(next);
    if (next.length === 2) {
      discover("bottles");
      D(makeDeck());
      Q(null);
      E("You knocked over every bottle. Chef Kenji is dealing the cards.");
      S("duel");
    }
  }
  function bossWin() {
    discover("goat");
    U((v) => (v.includes("noodles") ? v : [...v, "noodles"]));
    E("");
    S("goat");
  }
  function duel() {
    if (!canPlay) return;
    beep();
    D(makeDeck());
    Q(null);
    S("duel");
  }
  function draw() {
    if (!canPlay) return;
    beep();
    const result = drawRound(deck);
    D(result.remaining);
    Q(result);
    if (result.winner === "player") {
      E("You win the card duel. Chef Kenji lets you stay on the counter.");
    } else if (result.winner !== "tie") {
      setDuelLoss(true);
      E("Chef Kenji wins. You're kicked off the counter. Click the apology to restart.");
      S("over");
    }
  }
  function reset() {
    setBowlIndex(null);
    setSleepy(false);
    setFieryChicken(false);
    setGoldenChicken(false);
    setKnockedBottles([]);
    setDuelLoss(false);
    A(0);
    U([]);
    R(0);
    S("roll");
    Q(null);
    D([]);
    E("");
    T("ALL");
  }
  const message = sleepy
    ? "Chef Kenji has dozed off. Wake him to continue."
    : stage === "roll"
      ? bowlIndex === null
        ? "Chief Ramen Officer reporting for duty. Roll the die. Six bowls, one destiny."
        : `A ${bowlIndex + 1}! ${BOWLS[bowlIndex].name}. That's your bowl for this order.`
      : stage === "boss-intro"
        ? "Sorry, the wild chicken has us on rations."
        : stage === "boss"
          ? goldenChicken
            ? "Every topping before the fourth egg?! The golden chicken fights back with electric eggs. You have six hits."
            : fieryChicken
              ? "Hot sauce before the fourth egg?! The wild chicken is on fire. Four hits. Cool it down!"
              : "FOUR ajitama?! You've summoned the Shrewsbury Street chicken. Three hits. Save my shop!"
          : stage === "goat"
            ? "ABSOLUTE GOAT. Four eggs, three hits, one legend. I finished your noodles. Order up!"
            : stage === "welcome"
              ? openingReply(refusals)
              : stage === "build"
                ? selected.includes("hot")
                  ? "Hot sauce? Now that's a Main South bowl. Respect."
                  : "Make yourself a bowl. Make it yours. I've got a little surprise for you when you're done."
                : stage === "duel"
                  ? round
                    ? "Same rank. Huh. We draw again. No funny business."
                    : "Good bowl. Now, one last thing. You feeling lucky?"
                  : round?.winner === "player"
                    ? "You got me, kid. That's a champion's bowl. Come back hungry."
                    : "The house wins. Your ramen's still good. Eat it before it gets cold.";
  return (
    <main>
      <header>
        <Link
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault();
            const taps = logoTaps + 1;
            L(taps === 3 ? 0 : taps);
            if (taps === 3) {
              revealSecret("Kuru kuru means round and round. Chef says every great bowl deserves another lap.", "logo");
            }
          }}
          aria-label="Ramen Time secret logo"
        >
          <span className="brand-mark">≋</span> RAMEN TIME<sup>®</sup>
        </Link>
        <button
          className="location"
          type="button"
          onClick={() => revealSecret("Find us at Worcester Public Market. Good ramen, good people, no shortcuts.", "location")}
        >
          <i /> WORCESTER, MA <span>/</span> OPEN LATE
        </button>
        <button
          className="sound"
          aria-pressed={sound}
          onClick={() => M(!sound)}
        >
          ♪ SOUND {sound ? "ON" : "OFF"}
        </button>
      </header>
      <section className="intro">
        <div>
          <p className="eyebrow">A LITTLE BOWL. A LITTLE LUCK.</p>
          <h1>
            Your bowl.
            <br />
            Your rules<span className="orange">.</span>
            <sup>*</sup>
          </h1>
          <p className="subtitle">
            Roll your bowl. Build your dream ramen.
            <br className="mobile" /> Leave it all on the counter.
          </p>
        </div>
        <button
          className="stamp"
          type="button"
          onClick={() => revealSecret("The 508 is home base: a little city, a big heart, and a bowl worth talking about.", "sign")}
          aria-label="Reveal the 508 ramen secret"
        >
          MADE WITH
          <br />
          <strong>SOUL</strong>
          <br />
          IN THE 508<span>✦</span>
        </button>
      </section>
      <nav className="steps" aria-label="Game progress">
        {[
          stage === "roll" ? "ROLL YOUR BOWL" : "PICK YOUR CRAVING",
          "BUILD YOUR BOWL",
          thirdStep(stage),
        ].map((label, i) => (
          <div
            key={label}
            className={
              (stage === "roll" || stage === "welcome"
                ? 0
                : stage === "build"
                  ? 1
                  : 2) === i
                ? "active"
                : ""
            }
          >
            <span>0{i + 1}</span>
            {label}
            <b>{i < 2 ? "→" : thirdStep(stage) === "??" ? "?" : "✦"}</b>
          </div>
        ))}
      </nav>
      <section className="game-layout">
        <div className="scene-side">
          <div className="scene-top">
            <span>
              <i /> THE COUNTER
            </span>
            <button
              onClick={() =>
                revealSecret(
                  "Order 508. A little love for the local area code. Ask for the diner-car special next time.",
                  "order",
                )
              }
            >
              ORDER #0508 ↗
            </button>
          </div>
          {stage === "boss" ? (
            <ChickenBoss onWin={bossWin} onLose={() => { E("Looks like you need more ramen! You're cooked buddy!"); S("over"); }} onThrow={beep} isOnFire={fieryChicken} isGolden={goldenChicken} />
          ) : (
            <Shop
              toppings={selected}
              eggs={eggs}
              bowlIndex={bowlIndex}
              sleepy={sleepy}
              knockedBottles={knockedBottles}
              onBottleKnock={knockBottle}
            />
          )}
          <div className="scene-bottom">
            <span>✦ {specialSign}</span>
            <button
              onClick={() =>
                revealSecret(
"It's pronounced WUSS-ter. Chef has removed one syllable and added one extra noodle.",
                    "local-say",
                  )
              }
            >
              WOOS-TAH, NOT WOR-CESTER ↗
            </button>
          </div>
          <div className="dialogue" aria-live="polite">
            <div className="chef-avatar">
              ▟<br />▀
            </div>
            <div>
              <p className="eyebrow">
                CHEF KENJI <span className="muted">/ CHIEF RAMEN OFFICER</span>
              </p>
              <p>“{secret || message}”</p>
              {sleepy && <button className="wake-button" type="button" aria-label="Wake Chef Kenji" onClick={(event) => { event.stopPropagation(); wakeChef(); }}>Wake Chef Kenji →</button>}
              {secret && (
                <button className="text-button" onClick={() => canPlay && E("")}>
                  Back to the counter →
                </button>
              )}
            </div>
          </div>
          <p className="footnote">
            *Your rules. His restaurant. There may be some negotiation.
          </p>
        </div>
        <div className="panel">
          {stage === "roll" ? (
            <BowlRoll
  value={bowlIndex}
  onRoll={roll}
  onChoose={chooseBowl}
  onContinue={confirmBowl}
            />
          ) : stage === "welcome" ? (
            <>
              <p className="eyebrow orange">FIRST THINGS FIRST</p>
              <h2>
                What are you
                <br />
                in the mood for?
              </h2>
              <p className="description">
                Pull up a stool. Chef wants to know.
              </p>
              <div className="cravings">
                {(refusals >= 5
                  ? ["Ramen"]
                  : ["Ramen", "Pizza", "A burger"]
                ).map((name, i) => (
                  <button
                    key={name}
                    onClick={() => choose(i === 0)}
                    className={i === 0 ? "ramen-choice" : ""}
                  >
                    <span className="food-icon">
                      {i === 0 ? "≋" : i === 1 ? "◭" : "▤"}
                    </span>
                    <span>
                      {name}
                      <small>
                        {i === 0
                          ? "A very, very good choice."
                          : i === 1
                            ? "Wrong neighborhood?"
                            : "Bold of you to ask."}
                      </small>
                    </span>
                    <b>↗</b>
                  </button>
                ))}
              </div>
              <div className="insistence">
                <span>CHEF&apos;S PATIENCE</span>
                <span className="patience">
                  {"▰".repeat(5 - refusals)}
                  <span className="muted">{"▱".repeat(refusals)}</span>
                </span>
              </div>
              <p className="tiny">
                {refusals >= 5
                  ? "The menu has been… simplified. Ramen it is."
                  : "No reservations. No rush. (Unless you order pizza.)"}
              </p>
            </>
          ) : stage === "build" ? (
            <>
              <div className="panel-title">
                <div>
                  <p className="eyebrow orange">THE GOOD STUFF</p>
                  <h2>Build your bowl.</h2>
                  <p className="assigned-bowl">
                    {bowlIndex !== null ? BOWLS[bowlIndex].name : ""}
                    <br /><small>{bowlNickname(selected, items.map(([id]) => id))}</small>
                  </p>
                </div>
                <span className="count">{selected.length}/8</span>
              </div>
              <p className="description">
                Shoyu broth is on the house. Tap to add or remove. Ajitama: use
                + ADD EGG and let the kitchen decide when it&apos;s time for a surprise.
              </p>
              <div className="tabs" aria-label="Ingredient filters">
                {["ALL", "BASE", "TOPPINGS", "EXTRAS"].map((t) => (
                  <button
                    key={t}
                    onClick={() => T(t)}
                    aria-pressed={tab === t}
                    className={tab === t ? "chosen" : ""}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="ingredients">
                {items
                  .filter(
                    (_, i) =>
                      tab === "ALL" ||
                      tab ===
                        (i === 0 ? "BASE" : i < 6 ? "TOPPINGS" : "EXTRAS"),
                  )
                  .map(([id, name, note, glyph, color]) =>
                    id === "ajitama" ? (
                      <div
                        key={id}
                        className={
                          eggs
                            ? "ingredient selected egg-ingredient"
                            : "ingredient egg-ingredient"
                        }
                      >
                        <span className="ingredient-icon" style={{ color }}>
                          {glyph}
                        </span>
                        <span>
                          {name}
                          <small>
                            {eggs === 3 ? "Chef is watching you…" : note}
                          </small>
                        </span>
                        <div className="egg-stepper">
                          <button
                            onClick={removeEgg}
                            disabled={eggs === 0}
                            aria-label="Remove one ajitama"
                          >
                            −
                          </button>
                          <output
                            aria-label="Ajitama quantity"
                            aria-live="polite"
                          >
                            {eggs}/4
                          </output>
                          <button
                            onClick={addEgg}
                            disabled={eggs >= MAX_AJITAMA}
                            aria-label="Add one ajitama"
                          >
                            + ADD EGG
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        key={id}
                        className={
                          selected.includes(id)
                            ? "ingredient selected"
                            : "ingredient"
                        }
                        aria-pressed={selected.includes(id)}
                        onClick={() => toggle(id)}
                      >
                        <span className="ingredient-icon" style={{ color }}>
                          {glyph}
                        </span>
                        <span>
                          {name}
                          <small>{note}</small>
                        </span>
                        <b>{selected.includes(id) ? "−" : "+"}</b>
                      </button>
                    ),
                  )}
              </div>
              <button
                className="primary"
                disabled={!selected.includes("noodles")}
                onClick={duel}
              >
                BOWL&apos;S READY. WHAT&apos;S NEXT? <span>→</span>
              </button>
              <p className="tiny">
                {selected.includes("noodles")
                  ? "Bowl built. Chef has one last surprise."
                  : "Add noodles to get this ramen party started."}
              </p>
            </>
          ) : stage === "boss-intro" ? (
            <>
              <p className="eyebrow orange">FOUR EGGS / ONE SECRET</p>
              <h2>Stacked to the max.</h2>
              <p className="description">
                Two ajitama below. Two on top. Your bowl has reached its
                four-egg limit.
              </p>
              <div className="boss-warning">
                AJITAMA: 4 / 4<br />
                <span>
                  ◒ ◒<br />◒ ◒
                </span>
              </div>
              <p className="description">
                A wild chicken heard about your order. Land three egg hits to
                earn ABSOLUTE GOAT status and finish your bowl.
              </p>
              <button className="primary" onClick={() => S("boss")}>
                FACE THE WILD CHICKEN <span>→</span>
              </button>
            </>
          ) : stage === "boss" ? (
            <>
              <p className="eyebrow orange">SECRET ENCOUNTER / THE 508</p>
              <h2>
                Too many eggs.
                <br />
                One angry bird.
              </h2>
              <p className="description">
                The Shrewsbury Street chicken has entered the chat. Send it
                packing with three egg hits.
              </p>
              <div className="boss-warning">
                WILD CHICKEN
                <br />
                <span>◒ ◒ ◒</span>
              </div>
              <p className="description">
                Click or tap a little ahead of the chicken. Your egg takes a
                moment to get there. Missed? Keep throwing.
              </p>
              <p className="tiny">
                Keyboard: focus the arena, aim with ← →, throw with Space or
                Enter. No timer. Unlimited eggs.
              </p>
              <div className="result">
                REWARD: ABSOLUTE GOAT STATUS + ORDER COMPLETE
              </div>
            </>
          ) : stage === "goat" ? (
            <>
              <p className="eyebrow orange">SECRET ENDING UNLOCKED</p>
              <div className="goat-badge">
                ✦<br />
                ABSOLUTE
                <br />
                GOAT
                <br />
                <span>WORCESTER EGG PATROL / 508</span>
              </div>
              <h2>Order complete.</h2>
              <p className="eyebrow orange">{orderTitle(selected, knockedBottles, eggs)[0]}</p>
              <p className="description">
                {orderTitle(selected, knockedBottles, eggs)[1]} Four ajitama. Three direct hits. One legendary bowl. The chicken
                retreats and Chef finishes your order on the house.
              </p>
              <div className="result" role="status">
                ABSOLUTE GOAT STATUS EARNED. YOU WIN.
              </div>
              <button className="primary" onClick={reset}>
                ANOTHER BOWL? <span>↻</span>
              </button>
              <p className="tiny">
                Your bowl: shoyu,{" "}
                {selected
                  .map((id) =>
                    id === "ajitama"
                      ? `${eggs} ajitama`
                      : items.find((x) => x[0] === id)?.[1],
                  )
                  .join(", ")}
                .
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow orange">
                {stage === "over"
                  ? "THE COUNTER HAS SPOKEN"
                  : "ONE BOWL. ONE SHOWDOWN."}
              </p>
              <h2>
                {stage === "over"
                  ? round?.winner === "player"
                    ? "You beat the chef!"
                    : round?.winner === "draw"
                      ? "A legendary draw."
                      : "Chef takes the win."
                  : round
                    ? "A draw. Go again."
                    : "Feeling lucky?"}
              </h2>
              <p className="description">
                One shared 52-card deck. High card wins.
                <br />
                Ace is high. Same rank? Both draw again.
              </p>
              <div className="card-table">
                {["YOU", "CHEF KENJI"].map((label, i) => {
                  const card = round
                    ? i === 0
                      ? round.player
                      : round.chef
                    : null;
                  return (
                    <div key={label}>
                      <span className="eyebrow">{label}</span>
                      <div
                        className={`playing-card ${card ? "face" : "back"} ${card && (card.suit === "♥" || card.suit === "♦") ? "red" : ""}`}
                      >
                        {card ? (
                          <>
                            <span>
                              {card.label}
                              <small>{card.suit}</small>
                            </span>
                            <strong>{card.suit}</strong>
                            <span className="card-bottom">{card.label}</span>
                          </>
                        ) : (
                          <>
                            <span>RT</span>
                            <strong>♠</strong>
                            <span>508</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="deck-note">
                {deck.length} CARDS LEFT IN THE DECK
              </div>
              {stage === "over" ? (
                <>
                  <div className="result" role="status">
                    {round?.winner === "player"
                      ? "✦ LUCKY HANDS. LEGENDARY BOWL."
                      : round?.winner === "draw"
                        ? "ALL 52 CARDS TIED. EVEN CHEF IS IMPRESSED."
                        : "✦ THE CHEF WINS. THE RAMEN IS STILL YOURS."}
                  </div>
  <button className="primary" onClick={reset}>
  {duelLoss ? "MY BAD, I JUST REALLY NEEDED RAMEN TODAY." : "ANOTHER BOWL?"} <span>↻</span>
  </button>
  </>
  ) : (
  <button className="primary" onClick={draw}>
                  {round ? "DRAW AGAIN" : "DRAW YOUR CARDS"} <span>↗</span>
                </button>
              )}
              <p className="tiny">
                {stage === "over"
                  ? `Your bowl: shoyu, ${selected.map((id) => (id === "ajitama" ? `${eggs} ajitama` : items.find((x) => x[0] === id)?.[1])).join(", ")}.`
                  : "No reshuffling. No jokers. No chef privileges."}
              </p>
            </>
          )}
        </div>
      </section>
      {discoveryToast && <p className="discovery-toast" role="status">{discoveryToast}</p>}
      <details className="discoveries">
        <summary>DISCOVERY LOG: {discoveries.length} / {discoveryDefinitions.length}</summary>
        <div>
          {discoveryDefinitions.map(([id, label, hint, description]) => {
            const unlocked = discoveries.includes(id);
            return (
              <div className="discovery-entry" key={id}>
                <span className="discovery-icon" aria-hidden="true">{unlocked ? "✓" : "?"}</span>
                <div>
                  <strong>{unlocked ? label : "Undiscovered"}</strong>
                  <small>{unlocked ? description : hint}</small>
                </div>
              </div>
            );
          })}
        </div>
      </details>
      <footer>
        <span>© RAMEN TIME / SLURP LOCAL.</span>
        <button onClick={() => H(!help)} aria-expanded={help}>
          HOW TO PLAY ↗
        </button>
        <span className="footer-note">NO DOWNLOADS. JUST NOODLES.</span>
      </footer>
      {help && (
        <aside className="help">
          <h3>The house rules</h3>
          <p>
            Roll the die for one of six unique bowls, choose ramen, then tap
            ingredients to make it yours. Noodles are required. Add ajitama and
            discover what Chef has in store when the kitchen gets restless.
            Play again for a fresh roll.
            {stage === "duel" || stage === "over"
              ? " The showdown uses one shared 52-card deck. Ace is high. Ties draw again from the remaining cards; a fully tied deck ends in a shared draw."
              : ""}
          </p>
          <button className="text-button" onClick={() => H(false)}>
            Got it. Let&apos;s eat. ×
          </button>
        </aside>
      )}
    </main>
  );
}
