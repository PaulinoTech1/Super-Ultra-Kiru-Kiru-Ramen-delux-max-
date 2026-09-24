"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { makeDeck, drawRound, openingReply } from "./rules.mjs";
import ChickenBoss from "./ChickenBoss";
import BowlRoll from "./BowlRoll";
import DarioDuel from "./DarioDuel";
import SloshRush from "./SloshRush";
import { BOWLS, rollBowl, thirdStep } from "./kitchen-rules.mjs";
import { bowlGreetings, bowlNickname, discoveryDefinitions, ingredientReactions, loadDiscoveries, orderTitle, refusalDialogue, saveDiscoveries, specialSigns } from "./game-content";
import {
  needsChickenBoss,
  MAX_AJITAMA,
  addAjitama,
  ajitamaPositions,
} from "./chicken-rules.mjs";
import {
  CUSTOMERS_PER_DAY,
  MAX_HEARTS,
  heartsForDifficulty,
  initialRun,
  startDay,
  serveBowl,
  loseCustomer,
  starsForDay,
  loadBest,
  saveBest,
  recordRun,
} from "./day-rules.mjs";
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
// Where to find each challenge. Shown in popups to make them easier to find.
const challengeGuide: Record<string, string> = {
  patience: "Craving screen: pick Pizza or Burger 5 times in a row.",
  wake: "Wait 30 seconds without touching anything until Kenji sleeps, then click Wake Chef Kenji.",
  logo: "Click the RAMEN TIME logo top-left 3 times.",
  bottles: "Build screen: click both bottles on the counter canvas.",
  sign: "Click the MADE WITH SOUL IN THE 508 stamp.",
  "sweet-heat": "Build screen: select Sweet corn and Hot sauce together.",
  location: "Click WORCESTER, MA / OPEN LATE in the header.",
  order: "Click ORDER #0508 above the counter.",
  "local-say": "Click WOOS-TAH, NOT WOR-CESTER below the counter.",
  fridge: "Build screen: select all 7 toppings at once (everything except Ajitama).",
  minimalist: "Build screen: select only Noodles, nothing else.",
  chicken: "Build screen: press + ADD EGG 4 times with no Hot sauce selected to meet the normal chicken.",
  fiery: "Build screen: select Hot sauce (but not every topping), then 4 ajitama eggs.",
  golden: "Build screen: select all 6 toppings first (everything except Noodles and Ajitama), then 4 ajitama eggs.",
  goat: "Win the chicken mini-game: land 3 egg hits (4 against the fiery chicken).",
  cookoff: "Earn Absolute GOAT, then click the DARIO'S CHALLENGE flyer pinned above the counter.",
  "market-king": "Beat Chef Dario in the cookoff: match his ticket order before he finishes his. Throw fire eggs to stun him.",
  slosh: "Become Market King, then click the SLOSH & SONS delivery flyer pinned above the counter.",
  "beverage-boss": "Beat Lenny in the drink rush: serve 8 drink tickets while he fumbles deliveries, spills drinks, and rolls mystery kegs at you. Pray nobody orders the cider.",
};
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
    [settings, setSettings] = useState(() => {
      const fallback = { music: 80, sfx: 80, difficulty: "normal" };
      if (typeof window === "undefined") return fallback;
      try {
        const raw = window.localStorage.getItem("kuru-kuru-settings");
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        const clampVol = (v: unknown, dflt: number) =>
          Number.isFinite(Number(v)) ? Math.max(0, Math.min(100, Number(v))) : dflt;
        return {
          music: clampVol(parsed.music, 80),
          sfx: clampVol(parsed.sfx, 80),
          difficulty: ["easy", "normal", "hard"].includes(parsed.difficulty) ? parsed.difficulty : "normal",
        };
      } catch {
        return fallback;
      }
    }),
    [splashFx, setSplashFx] = useState(0),
    [run, setRun] = useState(() => initialRun(heartsForDifficulty(settings.difficulty))),
    [serveResult, setServeResult] = useState<{ kind: string; earned?: number } | null>(null),
    [best, setBest] = useState(() => {
      if (typeof window === "undefined") return { day: 0, coins: 0, bowls: 0 };
      return loadBest();
    }),
    [discoveries, setDiscoveries] = useState<string[]>(() => {
      if (typeof window === "undefined") return [];
      return loadDiscoveries();
    }),
    [discoveryToast, setDiscoveryToast] = useState<string | null>(null),
    [specialSign] = useState<string>(specialSigns[0]),
    [showChallenges, setShowChallenges] = useState(false),
    [showSettings, setShowSettings] = useState(false),
    [hintPopupId, setHintPopupId] = useState<string | null>(null),
    [showIntroPopup, setShowIntroPopup] = useState(false);
  const discoveriesReady = useRef(true);
  const musicRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bossAudioRef = useRef<HTMLAudioElement | null>(null);
  const brothAudioRef = useRef<HTMLAudioElement | null>(null);
  const dialogAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastDialogueRef = useRef(0);
  useEffect(() => {
    if (discoveriesReady.current) saveDiscoveries(discoveries);
  }, [discoveries]);
  useEffect(() => {
    try {
      window.localStorage.setItem("kuru-kuru-settings", JSON.stringify(settings));
    } catch { /* settings are optional */ }
  }, [settings]);
  const sfxLevel = Math.max(0, Math.min(100, settings.sfx)) / 100;
  const musicLevel = Math.max(0, Math.min(100, settings.music)) / 100;
  const heartsForDay = heartsForDifficulty(settings.difficulty);
  const dialogTargetRef = useRef(0.16);
  dialogTargetRef.current = 0.16 * musicLevel;
  const musicLevelRef = useRef(0.8);
  musicLevelRef.current = musicLevel;
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
    if (!canPlay) {
      // Secrets still count while Kenji naps: wake him and grant the
      // discovery instead of silently swallowing the attempt.
      setSleepy(false);
    }
    if (discovery) discover(discovery);
    E(text);
  }
  const canPlay = !sleepy;
  useEffect(() => {
    if (!discoveryToast) return;
    const timer = window.setTimeout(() => setDiscoveryToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [discoveryToast]);
  // Intro popup: nudge toward the challenges once, dismissible.
  useEffect(() => {
    try {
      if (window.localStorage.getItem("kuru-kuru-challenges-intro-seen")) return;
    } catch { /* ignore */ }
    if (discoveries.length >= 5) return;
    const t = window.setTimeout(() => setShowIntroPopup(true), 1800);
    return () => window.clearTimeout(t);
  }, [discoveries.length]);
  function dismissIntroPopup() {
    setShowIntroPopup(false);
    try { window.localStorage.setItem("kuru-kuru-challenges-intro-seen", "1"); } catch { /* ignore */ }
  }
  function openNextHint() {
    const next = discoveryDefinitions.find(([id]) => !discoveries.includes(id));
    if (next) setHintPopupId(next[0] as string);
  }
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
    const bossStage = stage === "boss" || stage === "cookoff" || stage === "slosh";
    if (!sound || bossStage) {
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
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.018 * musicLevelRef.current), audio.currentTime + 0.04);
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
  }, [sound, stage]);
  // File-based audio loops: boss battle, broth ambience, dialogue underscore.
  // All CC0, see public/audio/ATTRIBUTION.md.
  useEffect(() => {
    const bossStage = stage === "boss" || stage === "cookoff" || stage === "slosh";
    const ensure = (ref: { current: HTMLAudioElement | null }, path: string, volume: number) => {
      if (!ref.current) {
        const el = new Audio(path);
        el.loop = true;
        el.volume = volume;
        ref.current = el;
      }
      return ref.current;
    };
    const boss = ensure(bossAudioRef, "/audio/boss-battle.ogg", 0.4 * musicLevelRef.current);
    const broth = ensure(brothAudioRef, "/audio/broth-loop.ogg", 0.1 * musicLevelRef.current);
    const dialog = ensure(dialogAudioRef, "/audio/dialogue-loop.ogg", 0);
    const wantBoss = sound && bossStage;
    const wantBroth = sound && !bossStage && stage === "build";
    if (wantBoss) {
      broth.pause();
      void boss.play().catch(() => {});
    } else if (wantBroth) {
      boss.pause();
      void broth.play().catch(() => {});
    } else {
      boss.pause();
      broth.pause();
    }
    // Dialogue music fades in while someone is talking, out after 8s quiet.
    const fade = window.setInterval(() => {
      const talking = sound && !bossStage && Date.now() - lastDialogueRef.current < 8000;
      const target = talking ? dialogTargetRef.current : 0;
      const step = target > dialog.volume ? 0.04 : -0.04;
      const next = Math.max(0, Math.min(dialogTargetRef.current, dialog.volume + step));
      dialog.volume = next;
      if (next > 0 && dialog.paused) void dialog.play().catch(() => {});
      else if (next === 0 && !dialog.paused) dialog.pause();
    }, 500);
    return () => {
      window.clearInterval(fade);
      boss.pause();
      broth.pause();
      dialog.pause();
    };
  }, [sound, stage]);
  // Keep loop volumes riding the music slider without restarting the loops.
  useEffect(() => {
    if (bossAudioRef.current) bossAudioRef.current.volume = 0.4 * musicLevel;
    if (brothAudioRef.current) brothAudioRef.current.volume = 0.1 * musicLevel;
  }, [musicLevel]);
  // Sizzle bed under the build stage: looped filtered noise, gain rides the SFX slider.
  const sizzleRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
  useEffect(() => {
    const live = sizzleRef.current;
    if (!sound) {
      if (live) live.gain.gain.setTargetAtTime(0, live.ctx.currentTime, 0.2);
      return;
    }
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    let s = sizzleRef.current;
    if (!s) {
      try {
        const ctx = new AudioContextClass();
        const len = ctx.sampleRate;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 5200;
        bp.Q.value = 0.7;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        src.connect(bp);
        bp.connect(gain);
        gain.connect(ctx.destination);
        src.start();
        s = { ctx, gain };
        sizzleRef.current = s;
      } catch {
        return;
      }
    }
    void s.ctx.resume().catch(() => {});
    s.gain.gain.setTargetAtTime(stage === "build" ? 0.03 * sfxLevel : 0, s.ctx.currentTime, 0.4);
    return () => {
      s!.gain.gain.setTargetAtTime(0, s!.ctx.currentTime, 0.25);
    };
  }, [sound, stage, sfxLevel]);
  // Stamp dialogue activity so the underscore knows someone is talking.
  useEffect(() => {
    if (secret) lastDialogueRef.current = Date.now();
  }, [secret]);
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
    g.gain.value = 0.025 * sfxLevel;
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.07);
    o.onended = () => {
      void a.close();
    };
  }
  // One-shot synth helper: enveloped oscillator, optional pitch slide.
  function blip(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, delay = 0) {
    if (!sound || sfxLevel <= 0) return;
    try {
      const a = new AudioContext(),
        o = a.createOscillator(),
        g = a.createGain();
      const t0 = a.currentTime + delay;
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * sfxLevel), t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(a.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
      o.onended = () => {
        void a.close();
      };
    } catch { /* audio is optional */ }
  }
  // Customer slurps the bowl: a wobbly downward sweep.
  function slurp() {
    blip(520, 0.45, "sawtooth", 0.05, 150);
    blip(390, 0.4, "triangle", 0.04, 120, 0.08);
  }
  // Coins hit the register: two bright pings.
  function chaChing() {
    blip(988, 0.12, "triangle", 0.06);
    blip(1319, 0.22, "triangle", 0.06, undefined, 0.1);
  }
  // Egg meets chicken: a low thud.
  function thud() {
    blip(170, 0.16, "sine", 0.09, 55);
  }
  function splash() {
    if (!sound) return;
    try {
      const el = new Audio("/audio/splash.ogg");
      el.volume = 0.55 * sfxLevel;
      void el.play().catch(() => {});
    } catch { /* audio is optional */ }
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
    if (!removing) {
      splash();
      setSplashFx((k) => k + 1);
    }
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
    splash();
    setSplashFx((k) => k + 1);
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
  function serveFanfare() {
    slurp();
    window.setTimeout(() => chaChing(), 280);
  }
  function bossWin() {
    discover("goat");
    const withNoodles = selected.includes("noodles") ? selected : [...selected, "noodles"];
    const { run: next, earned } = serveBowl(run, withNoodles, { goatWon: true });
    setRun(next);
    setServeResult({ kind: "goat", earned });
    U(withNoodles);
    E("");
    serveFanfare();
    S("goat");
  }
  function chickenLose() {
    const { run: next } = loseCustomer(run);
    setRun(next);
    setServeResult({ kind: "chicken-loss" });
    E(next.result === "gameover"
      ? "The chicken stands victorious over the counter. The shop can't take another hit."
      : "Looks like you need more ramen! You're cooked, buddy. The customer leaves.");
    S("over");
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
      const { run: next, earned } = serveBowl(run, selected, { duelWon: true });
      setRun(next);
      setServeResult({ kind: "duel-win", earned });
      E(`The customer is delighted. +${earned} coins. Chef Kenji nods approvingly.`);
      serveFanfare();
      S("over");
    } else if (result.winner === "draw") {
      const { run: next, earned } = serveBowl(run, selected, {});
      setRun(next);
      setServeResult({ kind: "duel-draw", earned });
      E(`All 52 cards tied. The customer calls it a legendary meal. +${earned} coins.`);
      serveFanfare();
      S("over");
    } else if (result.winner !== "tie") {
      const { run: next } = loseCustomer(run);
      setRun(next);
      setServeResult({ kind: "duel-loss" });
      E(next.result === "gameover"
        ? "Chef Kenji wins the duel, and the customer storms out. That was the last straw."
        : "Chef Kenji wins the duel. The customer walks out hungry.");
      S("over");
    }
  }
  function clearBowl() {
    setBowlIndex(null);
    setSleepy(false);
    setFieryChicken(false);
    setGoldenChicken(false);
    setKnockedBottles([]);
    A(0);
    U([]);
    R(0);
    Q(null);
    D([]);
    E("");
    T("ALL");
    setServeResult(null);
  }
  function reset() {
    clearBowl();
    setRun(initialRun(heartsForDay));
    S("roll");
  }
  // Next customer in line: fresh bowl, same day, same coins, same hearts.
  function nextCustomer() {
    if (!canPlay) return;
    beep();
    clearBowl();
    S("roll");
  }
  function persistBest(nextRun: ReturnType<typeof initialRun>) {
    setBest((current) => {
      const updated = recordRun(current, nextRun);
      saveBest(updated);
      return updated;
    });
  }
  function serveContinueLabel() {
    if (run.result === "gameover") return "FACE THE MUSIC";
    if (run.result === "day-end") return "CLOSE UP SHOP";
    if (run.result === "victory") return "TAKE A BOW";
    return "NEXT CUSTOMER";
  }
  function continueAfterServe() {
    if (!canPlay) return;
    beep();
    if (run.result === "gameover") {
      persistBest(run);
      S("gameover");
    } else if (run.result === "day-end") {
      persistBest(run);
      S("day-end");
    } else if (run.result === "victory") {
      persistBest(run);
      S("victory");
    } else {
      nextCustomer();
    }
  }
  function openNextDay() {
    if (!canPlay) return;
    beep();
    const next = startDay({ ...run, day: run.day + 1 }, heartsForDay);
    setRun(next);
    clearBowl();
    E(`Day ${next.day}. ${CUSTOMERS_PER_DAY} customers, one dream. The regulars are already lining up.`);
    S("roll");
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
                  : stage === "cookoff"
                    ? "Dario?! In MY market?! Show him what Worcester ramen really is, kid."
                    : stage === "day-end"
                      ? `Day ${run.day} in the books. Count the coins, mop the floor, rest those wrists.`
                      : stage === "gameover"
                        ? "The sign says CLOSED. Too many walkouts. Tomorrow is another day, kid."
                        : stage === "victory"
                          ? "Five days, kid. FIVE. You're a ramen legend of the 508 now."
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
        <div className="header-actions">
          <button
            className="challenges-btn"
            type="button"
            onClick={() => setShowChallenges(true)}
            aria-label={`Open challenges, ${discoveries.length} of ${discoveryDefinitions.length} found`}
          >
            ★ CHALLENGES {discoveries.length}/{discoveryDefinitions.length}
          </button>
          <button
            className="settings-btn"
            type="button"
            onClick={() => setShowSettings(true)}
            aria-label="Open settings"
          >
            ⚙ SETTINGS
          </button>
          <button
            className="sound"
            aria-pressed={sound}
            onClick={() => M(!sound)}
          >
            ♪ SOUND {sound ? "ON" : "OFF"}
          </button>
        </div>
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
            <span
              className="day-hud"
              aria-label={`Day ${run.day}, customer ${run.customer} of ${CUSTOMERS_PER_DAY}, ${run.hearts} of ${heartsForDay} hearts, ${run.totalCoins} coins earned`}
            >
              DAY {run.day} · {run.customer}/{CUSTOMERS_PER_DAY} · {"♥".repeat(run.hearts)}
              <span className="muted">{"♥".repeat(Math.max(0, heartsForDay - run.hearts))}</span> · {run.totalCoins} COINS
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
            {discoveries.includes("goat") && (
              <button
                className="flyer-btn"
                type="button"
                aria-label="Accept Chef Dario's cookoff challenge"
                onClick={() => {
                  beep();
                  discover("cookoff");
                  S("cookoff");
                }}
              >
                🔥 DARIO&apos;S CHALLENGE
              </button>
            )}
            {discoveries.includes("market-king") && (
              <button
                className="flyer-btn"
                type="button"
                aria-label="Accept Lenny's drink rush delivery shift"
                onClick={() => {
                  beep();
                  discover("slosh");
                  S("slosh");
                }}
              >
                🚚 SLOSH &amp; SONS DELIVERY
              </button>
            )}
          </div>
          {stage === "boss" ? (
            <ChickenBoss onWin={bossWin} onLose={chickenLose} onThrow={beep} onHit={thud} isOnFire={fieryChicken} isGolden={goldenChicken} />
          ) : (
            <div className="shop-wrap">
              <Shop
                toppings={selected}
                eggs={eggs}
                bowlIndex={bowlIndex}
                sleepy={sleepy}
                knockedBottles={knockedBottles}
                onBottleKnock={knockBottle}
              />
              {stage === "build" && (
                <div className="steam-layer" aria-hidden="true">
                  <span className="steam-wisp" style={{ left: "41%" }} />
                  <span className="steam-wisp" style={{ left: "49%", animationDelay: "1.2s" }} />
                  <span className="steam-wisp" style={{ left: "57%", animationDelay: "2.1s" }} />
                </div>
              )}
              {splashFx > 0 && (
                <div key={splashFx} className="splash-burst" aria-hidden="true">
                  {[
                    [-34, -26], [-18, -40], [0, -46], [18, -40], [34, -26],
                    [-26, -10], [26, -10], [0, -18],
                  ].map(([dx, dy], i) => (
                    <span
                      key={i}
                      className="burst-drop"
                      style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, animationDelay: `${(i % 3) * 0.03}s` } as React.CSSProperties}
                    />
                  ))}
                </div>
              )}
            </div>
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
              <p className="speech-bubble bubble-kenji">“{secret || message}”</p>
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
              <button className="primary" onClick={continueAfterServe}>
                {serveContinueLabel()} <span>→</span>
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
          ) : stage === "cookoff" ? (
            <DarioDuel
              items={items}
              onUnlock={discover}
              onThrow={beep}
              onExit={() => S("build")}
            />
          ) : stage === "slosh" ? (
            <SloshRush onUnlock={discover} onExit={() => S("build")} />
          ) : stage === "day-end" ? (
            <>
              <p className="eyebrow orange">DAY {run.day} COMPLETE</p>
              <h2>
                Shop&apos;s closed.
                <br />
                Bowls are empty.
              </h2>
              <div className="stars" role="img" aria-label={`${starsForDay(run.lostHearts)} out of 3 stars`}>
                {"★".repeat(starsForDay(run.lostHearts))}
                <span className="muted">{"★".repeat(3 - starsForDay(run.lostHearts))}</span>
              </div>
              <p className="description">
                {run.served} of {CUSTOMERS_PER_DAY} customers served · {run.perfect} perfect bowls · {run.lostHearts} walkout{run.lostHearts === 1 ? "" : "s"}
              </p>
              <div className="result" role="status">
                +{run.coins} COINS TODAY
              </div>
              <p className="tiny">
                BEST: DAY {best.day} · {best.coins} COINS IN A DAY · {best.bowls} BOWLS ALL TIME
              </p>
              <button className="primary" onClick={openNextDay}>
                OPEN FOR DAY {run.day + 1} <span>→</span>
              </button>
            </>
          ) : stage === "gameover" ? (
            <>
              <p className="eyebrow orange">THE SHOP CLOSES EARLY</p>
              <h2>
                Too many
                <br />
                walkouts.
              </h2>
              <p className="description">
                Three unhappy customers in one day, and word travels fast on Shrewsbury Street. Kenji flips the sign to CLOSED.
              </p>
              <div className="result" role="status">
                DAY {run.day} · {run.totalCoins} COINS EARNED
              </div>
              <p className="tiny">
                BEST: DAY {best.day} · {best.coins} COINS IN A DAY · {best.bowls} BOWLS ALL TIME
              </p>
              <button className="primary" onClick={reset}>
                TRY AGAIN <span>↻</span>
              </button>
            </>
          ) : stage === "victory" ? (
            <>
              <p className="eyebrow orange">FIVE DAYS. ZERO REGRETS.</p>
              <h2>
                Ramen legend
                <br />
                of the 508.
              </h2>
              <p className="description">
                Five straight days of slinging bowls at Worcester Public Market. Kenji hangs your photo next to the health inspection certificate.
              </p>
              <div className="result" role="status">
                {run.totalServed} BOWLS SERVED · {run.totalCoins} COINS EARNED
              </div>
              <p className="tiny">
                {run.totalPerfect} PERFECT BOWLS · BEST SINGLE DAY: {best.coins} COINS
              </p>
              <button className="primary" onClick={reset}>
                RUN IT BACK <span>↻</span>
              </button>
            </>
          ) : stage === "over" ? (
            <>
              <p className="eyebrow orange">THE COUNTER HAS SPOKEN</p>
              <h2>
                {serveResult?.kind === "duel-win"
                  ? "Served with style."
                  : serveResult?.kind === "duel-draw"
                    ? "A legendary draw."
                    : serveResult?.kind === "chicken-loss"
                      ? "Outfoxed by poultry."
                      : "The customer walks out."}
              </h2>
              <p className="description">
                {serveResult?.kind === "duel-win"
                  ? "You beat Chef Kenji at his own game. The customer is already telling their friends."
                  : serveResult?.kind === "duel-draw"
                    ? "All 52 cards tied. Even Chef is impressed, and the customer pays full price."
                    : serveResult?.kind === "chicken-loss"
                      ? "The wild chicken defends its turf. No bowl, no pay, one unhappy customer."
                      : "Chef Kenji takes the duel. The customer leaves hungry and tells Yelp."}
              </p>
              <div className="result" role="status">
                {serveResult && serveResult.earned !== undefined
                  ? `✦ +${serveResult.earned} COINS`
                  : run.result === "gameover"
                    ? "✦ NO HEARTS LEFT"
                    : `✦ HEART LOST · ${run.hearts} LEFT`}
              </div>
              <button className="primary" onClick={continueAfterServe}>
                {serveContinueLabel()} <span>→</span>
              </button>
              <p className="tiny">
                Your bowl: shoyu, {selected.map((id) => (id === "ajitama" ? `${eggs} ajitama` : items.find((x) => x[0] === id)?.[1])).join(", ")}.
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow orange">
                ONE BOWL. ONE SHOWDOWN.
              </p>
              <h2>
                {round
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
              <button className="primary" onClick={draw}>
                {round ? "DRAW AGAIN" : "DRAW YOUR CARDS"} <span>↗</span>
              </button>
              <p className="tiny">
                No reshuffling. No jokers. No chef privileges.
              </p>
            </>
          )}
        </div>
      </section>
      {discoveryToast && (
        <p className="discovery-toast" role="status" aria-hidden="false">
          <span className="sparkle" aria-hidden="true">✦</span>
          {" "}{discoveryToast}{" "}
          <span className="sparkle sparkle-2" aria-hidden="true">✦</span>
          <span className="sparkle sparkle-3" aria-hidden="true">✧</span>
        </p>
      )}
      <div className="challenges-cta-row">
        <button className="challenges-cta" type="button" onClick={() => setShowChallenges(true)}>
          ★ View all {discoveryDefinitions.length} challenges ({discoveries.length}/{discoveryDefinitions.length})
        </button>
        <button className="hint-cta" type="button" onClick={openNextHint}>
          Need a hint? →
        </button>
      </div>
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
      {showSettings && (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-label="Settings">
          <div className="popup-card settings-popup">
            <div className="popup-header">
              <h3>Settings</h3>
              <button type="button" aria-label="Close settings" onClick={() => setShowSettings(false)}>×</button>
            </div>
            <label className="setting-row">
              <span>MUSIC VOLUME</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={settings.music}
                onChange={(event) => setSettings((s) => ({ ...s, music: Number(event.target.value) }))}
                aria-label="Music volume"
              />
              <output aria-label={`${settings.music} percent`}>{settings.music}</output>
            </label>
            <label className="setting-row">
              <span>SFX VOLUME</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={settings.sfx}
                onChange={(event) => setSettings((s) => ({ ...s, sfx: Number(event.target.value) }))}
                aria-label="Sound effects volume"
              />
              <output aria-label={`${settings.sfx} percent`}>{settings.sfx}</output>
            </label>
            <fieldset className="setting-row difficulty-field">
              <legend>DIFFICULTY</legend>
              <div className="difficulty-btns" role="group" aria-label="Difficulty">
                {(["easy", "normal", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={settings.difficulty === d}
                    className={settings.difficulty === d ? "chosen" : ""}
                    onClick={() => setSettings((s) => ({ ...s, difficulty: d }))}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="tiny">
                EASY: 4 HEARTS/DAY · NORMAL: 3 · HARD: 2. A new difficulty takes
                effect on your next day (or a fresh run).
              </p>
            </fieldset>
            <div className="popup-actions">
              <button className="primary" type="button" onClick={() => setShowSettings(false)}>
                BACK TO RAMEN →
              </button>
            </div>
          </div>
        </div>
      )}
      {showIntroPopup && (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-label="Hidden challenges intro">
          <div className="popup-card intro-popup">
            <h3>Psst. {discoveryDefinitions.length} hidden challenges.</h3>
            <p>This shop hides {discoveryDefinitions.length} secrets. Logo taps, bottle chaos, egg math, chicken encounters. Want the map?</p>
            <div className="popup-actions">
              <button className="primary" type="button" onClick={() => { dismissIntroPopup(); setShowChallenges(true); }}>
                SHOW ME THE MAP →
              </button>
              <button className="text-button" type="button" onClick={dismissIntroPopup}>
                I like surprises. ×
              </button>
            </div>
          </div>
        </div>
      )}
      {showChallenges && (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-label={`${discoveryDefinitions.length} challenges`}>
          <div className="popup-card challenges-modal">
            <div className="popup-header">
              <h3>{discoveryDefinitions.length} Hidden Challenges</h3>
              <button type="button" aria-label="Close challenges" onClick={() => setShowChallenges(false)}>×</button>
            </div>
            <p className="popup-progress">{discoveries.length} / {discoveryDefinitions.length} found. Tap any hidden one to see exactly where it lives.</p>
            <div className="challenges-grid">
              {discoveryDefinitions.map(([id, label, hint, description]) => {
                const unlocked = discoveries.includes(id);
                return (
                  <div key={id} className={unlocked ? "challenge-card unlocked" : "challenge-card"}>
                    <span className="challenge-icon" aria-hidden="true">{unlocked ? "✓" : "?"}</span>
                    <div>
                      <strong>{unlocked ? label : "Hidden challenge"}</strong>
                      <small className="challenge-hint">{hint}</small>
                      <small className="challenge-where">Find it: {challengeGuide[id] || description}</small>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="popup-actions">
              <button className="primary" type="button" onClick={() => setShowChallenges(false)}>
                BACK TO RAMEN →
              </button>
              <button className="text-button" type="button" onClick={openNextHint}>
                Give me one hint →
              </button>
            </div>
          </div>
        </div>
      )}
      {hintPopupId && (() => {
        const def = discoveryDefinitions.find(([id]) => id === hintPopupId);
        if (!def) return null;
        const [id, label, hint] = def;
        const unlocked = discoveries.includes(id);
        return (
          <div className="popup-overlay" role="dialog" aria-modal="true" aria-label="Challenge hint">
            <div className="popup-card hint-popup">
              <div className="popup-header">
                <h3>{unlocked ? label : "Need a nudge?"}</h3>
                <button type="button" aria-label="Close hint" onClick={() => setHintPopupId(null)}>×</button>
              </div>
              {!unlocked && (
                <>
                  <p className="challenge-hint">{hint}</p>
                  <p className="challenge-where">Find it: {challengeGuide[id]}</p>
                  <div className="popup-actions">
                    <button className="primary" type="button" onClick={() => { setHintPopupId(null); setShowChallenges(true); }}>
                      OPEN FULL MAP →
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => {
                        const next = discoveryDefinitions.find(([nid]) => nid !== id && !discoveries.includes(nid as string));
                        setHintPopupId(next ? (next[0] as string) : null);
                      }}
                    >
                      Next hint →
                    </button>
                  </div>
                </>
              )}
              {unlocked && (
                <>
                  <p>You already found {label}. Nice.</p>
                  <div className="popup-actions">
                    <button className="primary" type="button" onClick={() => setHintPopupId(null)}>KEEP COOKING →</button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </main>
  );
}
