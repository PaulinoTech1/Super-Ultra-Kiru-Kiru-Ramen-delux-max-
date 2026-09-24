"use client";

import { useEffect, useRef, useState } from "react";
import SloshTutorial from "./SloshTutorial";
import {
  CIDER_ID,
  DRINKS,
  MAX_WALKOUTS,
  REVIEW_CALM_MS,
  SERVE_GOAL,
  SHIFT_SECONDS,
  drinkById,
  grabDrink,
  initialShift,
  isCiderRage,
  serveTicket,
  tapCrate,
  tapKeg,
  tapSpill,
  threatenReview,
  tickShift,
} from "./slosh-rules.mjs";

type Ticket = { key: number; drink: string; patience: number };
type BeltDrink = { key: number; drink: string; x: number };
type Game = {
  ticksLeft: number;
  served: number;
  walkouts: number;
  tickets: Ticket[];
  belt: BeltDrink[];
  held: string | null;
  crate: { tapsLeft: number } | null;
  spill: { tapsLeft: number; ticksLeft: number } | null;
  keg: { x: number; hp: number } | null;
  spawnIn: number;
  eventIn: number;
  calmUntil: number;
  reviewCooldownUntil: number;
  dazedUntil: number;
  result: "win" | "lose" | null;
  nextKey: number;
};
type Phase = "intro" | "tutorial" | "shift" | "end";

const LENNY_FUMBLE_LINES = [
  "Oops! Wrong crate! ...you didn't see anything.",
  "That spill? That was already there. Probably.",
  "MYSTERY KEG! No refunds!",
  "I'm sure I loaded the right drinks. 60% sure.",
];
const LENNY_CALM_LINE = "NO WAIT! Not the review! RIGHT drinks coming up, I swear!";
const LENNY_HIT_LINE = "MY KEG! ...fine. Take the drink. Take all the drinks.";
// Grabbing the cider itself sets Lenny off: insults, then the real story.
const LENNY_CIDER_INSULTS = [
  "Oh, grabbing the CIDER? Real cute. Real funny.",
  "You think this is a joke?! Cider took EVERYTHING from me!",
  "One summer my whole family drove out for cider. They never came back.",
  "Mom, Dad, Uncle Sploosh... all gone. They chose the cider over ME.",
  "The doctor said they were addicted. I said they were family. The cider won.",
  "Every bubble in that bottle is a tiny reminder of what I lost.",
  "Go ahead. Hold it. Hold my trauma right there in your hand.",
  "You're gonna wave that around in front of me? Heartless. Cold-blooded.",
];

function pickLine(lines: string[]) {
  return lines[Math.floor(Math.random() * lines.length)];
}

// Lenny's ambient paranoia: nothing is actually discontinued. He just says it.
// The longer the shift runs, the more items he claims are gone.
function discontinuedGrumble(elapsedMs: number, rand: () => number = Math.random) {
  const pool = DRINKS.map((d) => d.name);
  const count = Math.min(3, 1 + Math.floor(elapsedMs / 30000));
  const names: string[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    names.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  const list = names.join(", ");
  const templates = [
    `They discontinued ${list}, you know. Corporate decision.`,
    `${list}? Discontinued. Don't shoot the messenger.`,
    `Heard ${list} got discontinued. Tragic. Anyway.`,
    `Pretty sure ${list} ${count > 1 ? "are" : "is"} discontinued now. Everything's discontinued if you think about it.`,
    `No more ${list}. They took it off the truck. I saw the memo. There was no memo.`,
  ];
  return templates[Math.floor(rand() * templates.length)];
}

export default function SloshRush({
  onUnlock,
  onExit,
}: {
  onUnlock: (id: string) => void;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [game, setGame] = useState<Game>(() => initialShift());
  const [now, setNow] = useState(() => Date.now());
  const [shakeTicket, setShakeTicket] = useState<number | null>(null);
  const [lennyLine, setLennyLine] = useState("We'll get it there... eventually.");
  const gameRef = useRef(game);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announced = useRef(false);
  const fumbleWasActive = useRef(false);
  const seenTickets = useRef<Set<number>>(new Set());
  // Lines said through say() with an importance window block Lenny's ambient
  // discontinued-rambling until the window expires, so gameplay signals win.
  const importantUntil = useRef(0);
  const shiftStartAt = useRef(Date.now());

  // Say a line, optionally reserving the speech bubble for importantMs so the
  // ambient grumbler doesn't talk over gameplay signals.
  const say = (line: string, importantMs = 0) => {
    setLennyLine(line);
    importantUntil.current = Date.now() + importantMs;
  };

  useEffect(() => {
    gameRef.current = game;
  });

  const startShift = () => {
    announced.current = false;
    fumbleWasActive.current = false;
    seenTickets.current = new Set();
    importantUntil.current = 0;
    shiftStartAt.current = Date.now();
    const fresh = initialShift();
    gameRef.current = fresh;
    setGame(fresh);
    setNow(Date.now());
    setShakeTicket(null);
    say("First delivery! Only... slightly wrong!", 5000);
    setPhase("shift");
  };

  useEffect(() => {
    if (phase !== "shift") return;
    const timer = setInterval(() => {
      const tnow = Date.now();
      setNow(tnow);
      const next = tickShift(gameRef.current, tnow);
      gameRef.current = next;
      setGame(next);
    }, 100);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "shift" && game.result && !announced.current) {
      announced.current = true;
      if (game.result === "win") onUnlock("beverage-boss");
      setPhase("end");
    }
  }, [phase, game.result, onUnlock]);

  useEffect(() => {
    const fumbleActive = !!(game.crate || game.spill || game.keg);
    if (fumbleActive && !fumbleWasActive.current) say(pickLine(LENNY_FUMBLE_LINES), 5000);
    fumbleWasActive.current = fumbleActive;
  }, [game.crate, game.spill, game.keg]);

  useEffect(() => {
    if (phase === "shift" && now < game.calmUntil && lennyLine !== LENNY_CALM_LINE) {
      say(LENNY_CALM_LINE, 8000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, game.calmUntil]);

  useEffect(() => {
    if (phase !== "shift") return;
    for (const t of game.tickets) {
      if (t.drink === CIDER_ID && !seenTickets.current.has(t.key)) {
        seenTickets.current.add(t.key);
        say("CIDER?! I DON'T do cider!! FINE. But I'm FURIOUS about it.", 6000);
      }
    }
  }, [phase, game.tickets]);

  // Ambient grumbling: when nothing important is happening, Lenny rambles
  // about discontinued drinks. Nothing is actually discontinued.
  useEffect(() => {
    if (phase !== "shift") return;
    const timer = setInterval(() => {
      const tnow = Date.now();
      const g = gameRef.current;
      if (g.result) return;
      if (tnow < g.calmUntil) return;
      if (tnow < importantUntil.current) return;
      say(discontinuedGrumble(tnow - shiftStartAt.current), 0);
    }, 11000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(
    () => () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    },
    [],
  );

  const doGrab = (key: number) => {
    const tnow = Date.now();
    const prev = gameRef.current;
    const grabbed = prev.belt.find((b) => b.key === key);
    const next = grabDrink(prev, key, tnow);
    if (next === prev) return;
    gameRef.current = next;
    setGame(next);
    if (grabbed && grabbed.drink === CIDER_ID) {
      say(pickLine(LENNY_CIDER_INSULTS), 6000);
    }
  };

  const doServe = (key: number) => {
    const prev = gameRef.current;
    if (prev.result || !prev.held) return;
    const { game: next, served } = serveTicket(prev, key);
    gameRef.current = next;
    setGame(next);
    if (!served) {
      setShakeTicket(key);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShakeTicket(null), 450);
      say("That ain't what they ordered!", 4000);
    }
  };

  const doTrash = () => {
    const prev = gameRef.current;
    if (!prev.held || prev.result) return;
    const next = { ...prev, held: null };
    gameRef.current = next;
    setGame(next);
  };

  const doCrate = () => {
    const next = tapCrate(gameRef.current);
    if (next === gameRef.current) return;
    gameRef.current = next;
    setGame(next);
    if (!next.crate) say("Fine! Taking it back! ...it was the right crate. Probably.", 4000);
  };

  const doSpill = () => {
    const next = tapSpill(gameRef.current);
    if (next === gameRef.current) return;
    gameRef.current = next;
    setGame(next);
    if (!next.spill) say("Mopped! See? Good as new. Mostly.", 4000);
  };

  const doKeg = () => {
    const { game: next, burst } = tapKeg(gameRef.current);
    if (next === gameRef.current) return;
    gameRef.current = next;
    setGame(next);
    if (burst) say(LENNY_HIT_LINE, 5000);
  };

  const doReview = () => {
    const tnow = Date.now();
    const prev = gameRef.current;
    if (prev.result || tnow < prev.reviewCooldownUntil) return;
    const next = threatenReview(prev, tnow);
    gameRef.current = next;
    setGame(next);
  };

  if (phase === "intro") {
    return (
      <div className="boss-intro">
        <div className="boss-banner" aria-hidden="true">⚠ BOSS BATTLE ⚠</div>
        <h2 className="boss-name">LENNY</h2>
        <p className="boss-title">Slosh &amp; Sons Beverage Distributing</p>
        <p className="boss-tagline">&ldquo;We&apos;ll get it there... eventually.&rdquo;</p>
        <div className="boss-brief">
          <p>Business is booming and Lenny is your distributor. Problem: Lenny. All drinks are non-alcoholic Japanese sodas and teas.</p>
          <p>Serve {SERVE_GOAL} drinks in {SHIFT_SECONDS} seconds. {MAX_WALKOUTS} walkouts and the shift is a disaster.</p>
          <p>New here? Run the training shift first. It walks you through every tap.</p>
        </div>
        <button className="accept-btn" type="button" onClick={() => setPhase("tutorial")}>
          SHOW ME THE ROPES
        </button>
        <button className="linklike" type="button" onClick={startShift}>
          I know the drill. Clock in.
        </button>
        <button className="linklike" type="button" onClick={onExit}>
          Not today. Back to the counter.
        </button>
      </div>
    );
  }

  if (phase === "tutorial") {
    return <SloshTutorial onDone={startShift} onExit={onExit} />;
  }

  if (phase === "end") {
    const won = game.result === "win";
    return (
      <div className="boss-intro">
        <h2 className="boss-name">{won ? "BEVERAGE BOSS!" : "SHIFT DISASTER"}</h2>
        <p className="boss-tagline">
          {won
            ? "Lenny signed an exclusive contract. The drinks arrive on time now. Miracles happen."
            : "Three customers walked out. Lenny blamed the traffic. There was no traffic."}
        </p>
        <p>
          Served: {game.served} / {SERVE_GOAL} · Walkouts: {game.walkouts}
        </p>
        <button className="accept-btn" type="button" onClick={startShift}>
          {won ? "WORK ANOTHER SHIFT" : "TRY AGAIN"}
        </button>
        <button className="linklike" type="button" onClick={onExit}>
          Back to the counter.
        </button>
      </div>
    );
  }

  const calmed = now < game.calmUntil;
  const dazed = now < game.dazedUntil;
  const ciderRage = isCiderRage(game.tickets);
  // Lenny's anger: cider rage, walkouts, and active fumbles all feed it.
  // The speech bubble grows (and pulses at max) so his mood is hard to miss.
  const anger = Math.min(
    3,
    (ciderRage ? 1 : 0) + game.walkouts + (game.crate || game.spill || game.keg ? 1 : 0),
  );
  const reviewCooldown = Math.max(0, Math.ceil((game.reviewCooldownUntil - now) / 1000));
  const clock = Math.max(0, Math.ceil(game.ticksLeft / 10));
  const heldDrink = game.held ? drinkById(game.held) : null;

  return (
    <div className="slosh-arena">
      <div className="slosh-bossbar">
        <div className="slosh-boss-id">
          <span className="slosh-lenny" aria-hidden="true">🚚</span>
          <div>
            <div className="slosh-boss-name">LENNY · SLOSH &amp; SONS</div>
            <div className={`slosh-lenny-line speech-bubble anger-${anger}`} aria-live="polite">{lennyLine}</div>
          </div>
        </div>
        <div className="slosh-goal">
          <div className="slosh-goal-label">
            SHIFT GOAL {game.served}/{SERVE_GOAL} · ⏱ {clock}s
          </div>
          <div className="slosh-goal-bar" aria-hidden="true">
            {Array.from({ length: SERVE_GOAL }).map((_, i) => (
              <span key={i} className={i < game.served ? "seg on" : "seg"} />
            ))}
          </div>
          <div className="slosh-walkouts" aria-label={`${game.walkouts} walkouts`}>
            Walkouts: {"⚠".repeat(game.walkouts) || "—"}
          </div>
        </div>
      </div>

      {ciderRage && (
        <div className="slosh-rage" role="alert">
          😡 CIDER RAGE — Lenny&apos;s fumbles are coming twice as fast!
        </div>
      )}

      {calmed && (
        <div className="slosh-calm" role="status">
          😰 LENNY IS SWEATING — correct drinks only!
        </div>
      )}

      <div className={`slosh-lenny-visual${calmed ? " sweating" : ""}${ciderRage ? " angry" : ""}`} aria-hidden="true">
        {ciderRage ? "😡" : "🧑‍💼"}{calmed ? "💦" : "📋"}
      </div>

      <div className="belt-wrap">
        <div className="belt-label">LENNY&apos;S CONVEYOR (grab what you need!)</div>
        <div className="belt-track">
          {game.belt.map((b) => {
            const d = drinkById(b.drink);
            return (
              <button
                key={b.key}
                type="button"
                className="belt-drink"
                style={{ left: `${b.x}%`, borderColor: d?.color }}
                onClick={() => doGrab(b.key)}
                aria-label={`Grab ${d?.name ?? b.drink}`}
                disabled={dazed || !!game.crate}
              >
                <span className="belt-drink-glyph" aria-hidden="true">{d?.glyph}</span>
                <span className="belt-drink-name">{d?.name}</span>
              </button>
            );
          })}
          {game.crate && (
            <button type="button" className="slosh-crate" onClick={doCrate} aria-label={`Shove the wrong crate back, ${game.crate.tapsLeft} taps left`}>
              📦 WRONG CRATE! Tap {game.crate.tapsLeft}× to shove it back!
            </button>
          )}
        </div>
      </div>

      <div className="slosh-counter">
        {game.keg && (
          <button
            type="button"
            className="slosh-keg"
            style={{ left: `${game.keg.x}%` }}
            onClick={doKeg}
            aria-label={`Stop the mystery keg, ${game.keg.hp} taps left`}
          >
            🛢️<span className="slosh-keg-hp">{game.keg.hp}</span>
          </button>
        )}
        {game.spill && (
          <button
            type="button"
            className="slosh-spill"
            onClick={doSpill}
            aria-label={`Mop the spill, ${game.spill.tapsLeft} taps left`}
          >
            💧 SPILL! Mop it! ({game.spill.tapsLeft}×)
          </button>
        )}
        <div className="slosh-hand">
          <span className="slosh-hand-label">YOUR HAND:</span>
          {dazed ? (
            <span className="slosh-dazed" role="status">😵 DAZED!</span>
          ) : heldDrink ? (
            <>
              <span className="slosh-held" aria-hidden="true">{heldDrink.glyph}</span>
              <span>{heldDrink.name}</span>
              <button type="button" className="slosh-trash" onClick={doTrash} aria-label={`Throw away ${heldDrink.name}`}>
                🗑️
              </button>
            </>
          ) : (
            <span className="slosh-empty">empty — grab a drink off the belt</span>
          )}
        </div>
      </div>

      <div className="slosh-tickets" role="group" aria-label="Drink tickets">
        {game.tickets.map((t) => {
          const d = drinkById(t.drink);
          return (
            <button
              key={t.key}
              type="button"
              className={`slosh-ticket${shakeTicket === t.key ? " shake" : ""}`}
              onClick={() => doServe(t.key)}
              disabled={dazed || !game.held}
              aria-label={`Serve ${d?.name ?? t.drink} to this ticket`}
            >
              <span className="slosh-ticket-glyph" aria-hidden="true">{d?.glyph}</span>
              <span className="slosh-ticket-name">{d?.name}</span>
              <span className="slosh-patience" aria-hidden="true">
                <span
                  className={`slosh-patience-fill${t.patience < 30 ? " low" : ""}`}
                  style={{ width: `${Math.max(0, t.patience)}%` }}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="slosh-actions">
        <button
          type="button"
          className="slosh-review"
          onClick={doReview}
          disabled={reviewCooldown > 0}
        >
          {reviewCooldown > 0 ? `⭐ REVIEW THREAT (${reviewCooldown}s)` : "⭐ THREATEN ONE-STAR REVIEW"}
        </button>
        <span className="slosh-hint">Correct drinks only for {Math.round(REVIEW_CALM_MS / 1000)}s</span>
      </div>

      <button className="linklike" type="button" onClick={onExit}>
        Abandon shift.
      </button>
    </div>
  );
}
