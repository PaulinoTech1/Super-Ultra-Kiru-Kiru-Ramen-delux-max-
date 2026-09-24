"use client";

import { useEffect, useRef, useState } from "react";
import {
  COOKOFF_WINS_NEEDED,
  DARIO_STUN_MS,
  FIRE_EGG_COOLDOWN_MS,
  FIRE_EGG_FLIGHT_MS,
  ROUND_END_MS,
  darioIntervalMs,
  darioIsDone,
  darioNextStep,
  fireEggKnockoff,
  orderMatches,
  pickOrder,
} from "./cookoff-rules.mjs";

type Item = string[][];
type Phase = "intro" | "roundIntro" | "cook" | "roundEnd" | "duelEnd";
type DuelOrder = { name: string; toppings: string[]; eggs: number };

const DARIO_STUNNED_TAUNTS = [
  "OW! MY EYEBROWS! That egg was ON FIRE!",
  "You fight dirty! I respect it! OW!",
  "My beautiful mise en place! RUINED!",
];
const DARIO_SORE_LOSER = [
  "Lucky. LUCKY. The ticket was rigged!",
  "Beginner's luck! The health inspector distracted me!",
];
const DARIO_WINNER = [
  "Too slow, kid. Dario does it Dario-fast.",
  "Another masterpiece. Another legend. Me.",
];
const KENJI_CORNER = [
  "That's my student! Keep the pressure on!",
  "Fire eggs! Where did you learn that?! Beautiful!",
];
const ROUND_HYPE = [
  "Dario cracks his knuckles. The crowd leans in.",
  "Dario speeds up. Someone's nonna is taking bets.",
  "FULL TILT. No mercy. No survivors. Just ramen.",
];

function pickTaunt(lines: string[], rand = Math.random) {
  return lines[Math.floor(rand() * lines.length)];
}

function itemById(items: Item, id: string) {
  return items.find(([itemId]) => itemId === id);
}

export default function DarioDuel({
  items,
  onUnlock,
  onThrow,
  onExit,
  turbo = false,
  onDuelEnd,
}: {
  items: Item;
  onUnlock: (id: string) => void;
  onThrow: () => void;
  onExit: () => void;
  turbo?: boolean;
  onDuelEnd?: (winner: "player" | "dario") => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [playerWins, setPlayerWins] = useState(0);
  const [darioWins, setDarioWins] = useState(0);
  const [usedNames, setUsedNames] = useState<string[]>([]);
  const [order, setOrder] = useState<DuelOrder>(() => pickOrder([]) as DuelOrder);
  const [playerSelected, setPlayerSelected] = useState<string[]>([]);
  const [playerEggs, setPlayerEggs] = useState(0);
  const [darioBowl, setDarioBowl] = useState<{ toppings: string[]; eggs: number }>({
    toppings: [],
    eggs: 0,
  });
  const [stunnedUntil, setStunnedUntil] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [taunt, setTaunt] = useState("So. The egg-thrower wants a REAL challenge.");
  const [cornerNote, setCornerNote] = useState("");
  const [roundResult, setRoundResult] = useState<"player" | "dario" | null>(null);
  const [hitFlash, setHitFlash] = useState(false);
  const [eggFlying, setEggFlying] = useState(false);
  const [arenaShake, setArenaShake] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const roundOver = useRef(false);
  const flightTimer = useRef<number | null>(null);

  // Clear a mid-flight egg if the duel unmounts.
  useEffect(() => {
    return () => {
      if (flightTimer.current !== null) window.clearTimeout(flightTimer.current);
    };
  }, []);

  // Clock for cooldown / stun indicators.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  // Dario builds the ticket on a timer. He gets faster every round.
  useEffect(() => {
    if (phase !== "cook") return;
    const timer = setInterval(() => {
      if (Date.now() < stunnedUntil) return;
      setDarioBowl((prev) => {
        const step = darioNextStep(prev.toppings, prev.eggs, order);
        if (!step) return prev;
        return step.kind === "egg"
          ? { ...prev, eggs: prev.eggs + 1 }
          : { ...prev, toppings: [...prev.toppings, step.id] };
      });
    }, Math.max(900, Math.round(darioIntervalMs(roundIndex) / (turbo ? 1.7 : 1))));
    return () => clearInterval(timer);
  }, [phase, roundIndex, order, stunnedUntil, turbo]);

  function endRound(winner: "player" | "dario") {
    if (roundOver.current) return;
    roundOver.current = true;
    const pw = playerWins + (winner === "player" ? 1 : 0);
    const dw = darioWins + (winner === "dario" ? 1 : 0);
    setPlayerWins(pw);
    setDarioWins(dw);
    setRoundResult(winner);
    setTaunt(
      winner === "player"
        ? pickTaunt(DARIO_SORE_LOSER)
        : pickTaunt(DARIO_WINNER),
    );
    setPhase("roundEnd");
    window.setTimeout(() => {
      if (pw >= COOKOFF_WINS_NEEDED || dw >= COOKOFF_WINS_NEEDED) {
        if (pw >= COOKOFF_WINS_NEEDED) onUnlock("market-king");
        // Show the duel-end result screen first. The parent only advances
        // (finalWin/finalLose) when the player taps through, so a loss with
        // hearts left can never silently reset the duel.
        setPhase("duelEnd");
      } else {
        const names = [...usedNames, order.name];
        setUsedNames(names);
        setOrder(pickOrder(names) as DuelOrder);
        setRoundIndex(roundIndex + 1);
        setPlayerSelected([]);
        setPlayerEggs(0);
        setDarioBowl({ toppings: [], eggs: 0 });
        setStunnedUntil(0);
        setCooldownUntil(0);
        setRoundResult(null);
        setCornerNote("");
        setEggFlying(false);
        setArenaShake(false);
        roundOver.current = false;
        setPhase("roundIntro");
      }
    }, ROUND_END_MS);
  }

  // Player completes the ticket.
  useEffect(() => {
    if (phase === "cook" && orderMatches(playerSelected, playerEggs, order)) {
      setCornerNote(pickTaunt(KENJI_CORNER));
      endRound("player");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerSelected, playerEggs, phase, order]);

  // Dario completes the ticket.
  useEffect(() => {
    if (phase === "cook" && darioIsDone(darioBowl.toppings, darioBowl.eggs, order)) endRound("dario");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darioBowl, phase, order]);

  function togglePlayer(id: string) {
    if (phase !== "cook") return;
    setPlayerSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function throwFireEgg() {
    if (phase !== "cook" || Date.now() < cooldownUntil) return;
    onThrow();
    const thrownAt = Date.now();
    setCooldownUntil(thrownAt + FIRE_EGG_COOLDOWN_MS);
    // The stun and the knockoff land the instant the egg leaves your hand.
    // The 650ms flight is pure theater; delaying the impact made the egg
    // feel unresponsive and let Dario squeeze in a free build step.
    setStunnedUntil(thrownAt + DARIO_STUN_MS);
    setDarioBowl((prev) => ({ ...prev, toppings: fireEggKnockoff(prev.toppings) }));
    setTaunt(pickTaunt(DARIO_STUNNED_TAUNTS));
    setHitFlash(true);
    setArenaShake(true);
    window.setTimeout(() => setHitFlash(false), 700);
    window.setTimeout(() => setArenaShake(false), 450);
    setEggFlying(true);
    if (flightTimer.current !== null) window.clearTimeout(flightTimer.current);
    flightTimer.current = window.setTimeout(() => {
      flightTimer.current = null;
      setEggFlying(false);
    }, FIRE_EGG_FLIGHT_MS);
  }

  function rematch() {
    setRoundIndex(0);
    setPlayerWins(0);
    setDarioWins(0);
    setUsedNames([]);
    setOrder(pickOrder([]) as DuelOrder);
    setPlayerSelected([]);
    setPlayerEggs(0);
    setDarioBowl({ toppings: [], eggs: 0 });
    setStunnedUntil(0);
    setCooldownUntil(0);
    setRoundResult(null);
    setCornerNote("");
    setEggFlying(false);
    setArenaShake(false);
    setTaunt("So. The egg-thrower wants a REAL challenge.");
    roundOver.current = false;
    setPhase("roundIntro");
  }

  const stunned = now < stunnedUntil;
  const cooling = now < cooldownUntil;
  const orderToppingNames = order.toppings.map(
    (id) => itemById(items, id)?.[1] ?? id,
  );

  return (
    <div className="cookoff">
      {phase === "intro" ? (
        <div className="boss-banner">
          <p className="boss-warning">⚠ BOSS BATTLE ⚠</p>
          <h2 className="boss-name-huge">CHEF DARIO</h2>
          <p className="boss-title">Self-proclaimed Market King of the Worcester Public Market</p>
        </div>
      ) : (
        <>
          <p className="eyebrow orange">ACROSS THE COUNTER</p>
          <h2>Chef Dario&apos;s Cookoff</h2>
        </>
      )}
      <div className="boss-bars" role="status" aria-label={`You have ${playerWins} round wins, Dario has ${darioWins}. First to ${COOKOFF_WINS_NEEDED} wins.`}>
        <div className="boss-bar you">
          <span className="boss-tag">YOU</span>
          {Array.from({ length: COOKOFF_WINS_NEEDED }).map((_, i) => (
            <span key={i} className={i < playerWins ? "seg on" : "seg"} />
          ))}
        </div>
        <div className="boss-bar foe">
          <span className="boss-tag">DARIO</span>
          {Array.from({ length: COOKOFF_WINS_NEEDED }).map((_, i) => (
            <span key={i} className={i < darioWins ? "seg on" : "seg"} />
          ))}
        </div>
      </div>

      {phase === "intro" && (
        <>
          <p className="description">
            Chef Dario slides in from across the Worcester Public Market, twirling
            a ladle like a weapon. &ldquo;Your ramen is SOUP,&rdquo; he declares.
            &ldquo;Three tickets. We both build. Fastest bowl wins the round.&rdquo;
          </p>
          <p className="description">
            Match each ticket exactly. And yes, those eggs are fire-coated.
            Throw one at Dario to stun him and knock his latest topping clean off.
          </p>
          <button className="primary" type="button" onClick={() => setPhase("roundIntro")}>
            ACCEPT THE CHALLENGE <span>→</span>
          </button>
          <p className="tiny">
            <button className="linklike" type="button" onClick={onExit}>
              Actually, I&apos;m not ready. Back to the shop.
            </button>
          </p>
        </>
      )}

      {phase === "roundIntro" && (
        <>
          <div className="ticket" role="status">
            <p className="eyebrow orange">ROUND {roundIndex + 1} TICKET</p>
            <h3>{order.name}</h3>
            <p>
              {orderToppingNames.join(" · ")}
              {order.eggs > 0 && ` · ${order.eggs} ajitama`}
            </p>
            <small>{ROUND_HYPE[roundIndex] ?? "Dario gets faster every round. Build it before he does."}</small>
          </div>
          <button className="primary" type="button" onClick={() => setPhase("cook")}>
            START COOKING <span>→</span>
          </button>
        </>
      )}

      {(phase === "cook" || phase === "roundEnd") && (
        <div className={`cookoff-arena${arenaShake ? " shake" : ""}`}>
          {eggFlying && (
            <div className="fire-egg-projectile" aria-hidden="true">
              <span className="egg-trail">🔥</span>
              <span className="egg-body">🥚</span>
            </div>
          )}
          <div className={`dario-panel${stunned ? " stunned" : ""}${hitFlash ? " hit" : ""}`}>
            {hitFlash && (
              <div className="nuke" aria-hidden="true">
                <div className="nuke-core" />
                <div className="nuke-ring" />
                <div className="nuke-ring r2" />
              </div>
            )}
            <p className="eyebrow orange">DARIO&apos;S COUNTER</p>
            <div className="dario-progress" aria-label={`Dario has placed ${darioBowl.toppings.length} of ${order.toppings.length} toppings and ${darioBowl.eggs} of ${order.eggs} eggs`}>
              {order.toppings.map((id) => {
                const placed = darioBowl.toppings.includes(id);
                const item = itemById(items, id);
                return (
                  <span key={id} className={placed ? "placed" : ""} title={item?.[1] ?? id}>
                    {placed ? item?.[3] ?? "?" : "○"}
                  </span>
                );
              })}
              {order.eggs > 0 && (
                <span className={darioBowl.eggs >= order.eggs ? "placed" : ""} title="ajitama eggs">
                  {"🥚".repeat(darioBowl.eggs)}{"○".repeat(Math.max(0, order.eggs - darioBowl.eggs))}
                </span>
              )}
            </div>
            {stunned && <p className="stun-flag" role="status">STUNNED!</p>}
            <p className="taunt speech-bubble bubble-dario" aria-live="polite">&ldquo;{taunt}&rdquo;</p>
          </div>

          <div className="ticket" role="status">
            <p className="eyebrow orange">TICKET: {order.name}</p>
            <p>
              {orderToppingNames.join(" · ")}
              {order.eggs > 0 && ` · ${order.eggs} ajitama`}
            </p>
          </div>

          {phase === "cook" ? (
            <>
              <div className="player-bowl" aria-hidden="true">
                <span className="bowl-label">YOUR BOWL</span>
                <span className="bowl-emoji">🍜</span>
                <span className="bowl-contents">
                  {playerSelected.map((id) => {
                    const item = itemById(items, id);
                    return (
                      <span key={id} style={{ color: item?.[4] }}>{item?.[3] ?? "?"}</span>
                    );
                  })}
                  {"🥚".repeat(playerEggs)}
                </span>
              </div>
              <div className="ingredients cookoff-ingredients">
                {items
                  .filter(([id]) => id !== "ajitama")
                  .map(([id, name, , glyph, color]) => (
                    <button
                      key={id}
                      type="button"
                      className={playerSelected.includes(id) ? "ingredient selected" : "ingredient"}
                      aria-pressed={playerSelected.includes(id)}
                      onClick={() => togglePlayer(id)}
                    >
                      <span className="ingredient-icon" style={{ color }}>{glyph}</span>
                      <span>{name}</span>
                      <b>{playerSelected.includes(id) ? "−" : "+"}</b>
                    </button>
                  ))}
              </div>
              <div className="cookoff-actions">
                <div className="egg-stepper" aria-label="Ajitama for the ticket">
                  <button type="button" onClick={() => setPlayerEggs((v) => Math.max(0, v - 1))} disabled={playerEggs === 0} aria-label="Remove one ajitama">−</button>
                  <output aria-live="polite">{playerEggs} 🥚</output>
                  <button type="button" onClick={() => setPlayerEggs((v) => Math.min(4, v + 1))} disabled={playerEggs >= 4} aria-label="Add one ajitama">+</button>
                </div>
                <button
                  type="button"
                  className={`fire-egg-btn${cooling ? " cooling" : ""}`}
                  disabled={cooling}
                  onClick={throwFireEgg}
                  aria-label={cooling ? "Fire egg recharging" : "Throw a fire-coated egg at Dario"}
                >
                  🔥 THROW FIRE EGG{cooling ? "…" : ""}
                </button>
              </div>
              <p className="tiny">Match the ticket exactly to take the round. Fire eggs stun Dario and knock off his last topping.</p>
            </>
          ) : (
            <div className="result" role="status">
              {roundResult === "player" ? `YOU TAKE ROUND ${roundIndex + 1}!` : `DARIO TAKES ROUND ${roundIndex + 1}.`}
            </div>
          )}
          {cornerNote && (
            <p className="tiny corner-note speech-bubble bubble-note" role="note">Kenji, from your corner: &ldquo;{cornerNote}&rdquo;</p>
          )}
        </div>
      )}

      {phase === "duelEnd" && (
        <>
          {playerWins >= COOKOFF_WINS_NEEDED ? (
            <>
              <p className="eyebrow orange">MARKET KING</p>
              <h2>Dario is cooked.</h2>
              <p className="description">
                Dario stares at your bowl, then at his own. &ldquo;...Fine. FINE!
                Worcester has TWO great ramen shops.&rdquo; He storms off,
                eyebrows still smoking.
              </p>
              <div className="result" role="status">MARKET KING STATUS EARNED.</div>
            </>
          ) : (
            <>
              <p className="eyebrow orange">DARIO WINS</p>
              <h2>He eats your noodles.</h2>
              <p className="description">
                &ldquo;Come back when your eggs aren&apos;t the only thing with
                fire in this kitchen!&rdquo; Dario cackles all the way back
                across the market.
              </p>
            </>
          )}
          {onDuelEnd ? (
            <button
              className="primary"
              type="button"
              onClick={() =>
                onDuelEnd(playerWins >= COOKOFF_WINS_NEEDED ? "player" : "dario")
              }
            >
              {playerWins >= COOKOFF_WINS_NEEDED ? (
                <>TAKE A BOW <span>→</span></>
              ) : (
                <>FACE THE MUSIC <span>→</span></>
              )}
            </button>
          ) : (
            <button className="primary" type="button" onClick={rematch}>
              REMATCH <span>↻</span>
            </button>
          )}
          <p className="tiny">
            <button className="linklike" type="button" onClick={onExit}>
              Back to the shop.
            </button>
          </p>
        </>
      )}
    </div>
  );
}
