"use client";

import { useState } from "react";
import { CIDER_ID, drinkById } from "./slosh-rules.mjs";

const STEP_TITLES = [
  "YOUR JOB",
  "GRAB A DRINK",
  "SERVE THE TICKET",
  "HANDLE LENNY'S FUMBLES",
  "SECRET WEAPONS",
];

export default function SloshTutorial({
  onDone,
  onExit,
}: {
  onDone: () => void;
  onExit: () => void;
}) {
  const [step, setStep] = useState(0);
  // Step 1: grab demo
  const [grabbed, setGrabbed] = useState(false);
  // Step 2: serve demo
  const [served, setServed] = useState(false);
  const [wrongTap, setWrongTap] = useState(false);
  // Step 3: fumble demos
  const [crateTaps, setCrateTaps] = useState(3);
  const [spillTaps, setSpillTaps] = useState(2);
  const [kegHp, setKegHp] = useState(5);

  const ramune = drinkById("ramune");
  const mugicha = drinkById("mugicha");
  const cider = drinkById(CIDER_ID);

  const fumblesDone = crateTaps === 0 && spillTaps === 0 && kegHp === 0;
  const canNext =
    step === 0 || (step === 1 && grabbed) || (step === 2 && served) || (step === 3 && fumblesDone) || step === 4;

  const dots = (
    <div className="slosh-tut-dots" aria-label={`Step ${step + 1} of ${STEP_TITLES.length}`}>
      {STEP_TITLES.map((t, i) => (
        <span key={t} className={`slosh-tut-dot${i === step ? " on" : ""}${i < step ? " past" : ""}`} />
      ))}
    </div>
  );

  const nav = (
    <div className="slosh-tut-nav">
      {step > 0 ? (
        <button type="button" className="linklike" onClick={() => setStep(step - 1)}>
          ← Back
        </button>
      ) : (
        <span />
      )}
      {step < STEP_TITLES.length - 1 ? (
        <button
          type="button"
          className="accept-btn slosh-tut-next"
          onClick={() => setStep(step + 1)}
          disabled={!canNext}
        >
          NEXT →
        </button>
      ) : (
        <button type="button" className="accept-btn slosh-tut-next" onClick={onDone}>
          CLOCK IN — START THE SHIFT
        </button>
      )}
    </div>
  );

  return (
    <div className="slosh-tut">
      <p className="eyebrow orange">LENNY&apos;S TRAINING SHIFT</p>
      <h2 className="slosh-tut-step-title">
        STEP {step + 1}: {STEP_TITLES[step]}
      </h2>
      {dots}

      {step === 0 && (
        <div className="slosh-tut-card">
          <p>
            You&apos;re the new shift lead. Lenny delivers the drinks, you serve the
            customers. Here&apos;s the whole job:
          </p>
          <ul>
            <li>
              <b>Serve 8 drink tickets</b> before the 90-second clock runs out.
            </li>
            <li>
              Every ticket has a <b>patience bar</b>. If it empties, the customer{" "}
              <b>walks out</b>. <b>3 walkouts</b> and the shift is a disaster.
            </li>
            <li>
              Lenny will fumble constantly. Handling him is half the job. That&apos;s
              next.
            </li>
          </ul>
        </div>
      )}

      {step === 1 && (
        <div className="slosh-tut-card">
          <p>
            Drinks ride Lenny&apos;s conveyor belt across the top of the screen.{" "}
            <b>Tap a drink to grab it</b> into your hand. Try it:
          </p>
          <div className="belt-wrap">
            <div className="belt-track slosh-tut-belt">
              {!grabbed && (
                <button
                  type="button"
                  className="belt-drink"
                  style={{ left: "50%", borderColor: ramune?.color }}
                  onClick={() => setGrabbed(true)}
                  aria-label={`Grab ${ramune?.name ?? "Ramune"}`}
                >
                  <span className="belt-drink-glyph" aria-hidden="true">
                    {ramune?.glyph}
                  </span>
                  <span className="belt-drink-name">{ramune?.name}</span>
                </button>
              )}
            </div>
          </div>
          <div className="slosh-hand">
            <span className="slosh-hand-label">YOUR HAND:</span>
            {grabbed ? (
              <>
                <span className="slosh-held" aria-hidden="true">
                  {ramune?.glyph}
                </span>
                <span>{ramune?.name}</span>
              </>
            ) : (
              <span className="slosh-empty">empty — tap the drink on the belt</span>
            )}
          </div>
          {grabbed && (
            <p className="slosh-tut-done">
              ✓ Got it! You can only hold <b>one</b> drink at a time. In the real
              shift, tap 🗑️ to toss one you don&apos;t need.
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="slosh-tut-card">
          <p>
            Your hand holds a {ramune?.name}. <b>Tap the ticket showing the same
            drink</b> to serve it:
          </p>
          <div className="slosh-hand">
            <span className="slosh-hand-label">YOUR HAND:</span>
            <span className="slosh-held" aria-hidden="true">
              {ramune?.glyph}
            </span>
            <span>{ramune?.name}</span>
          </div>
          <div className="slosh-tickets">
            <button
              type="button"
              className={`slosh-ticket${served ? " served" : ""}`}
              onClick={() => setServed(true)}
              aria-label={`Serve ${ramune?.name} to this ticket`}
            >
              <span className="slosh-ticket-glyph" aria-hidden="true">
                {served ? "✓" : ramune?.glyph}
              </span>
              <span className="slosh-ticket-name">
                {served ? "SERVED!" : ramune?.name}
              </span>
            </button>
            <button
              type="button"
              className={`slosh-ticket${wrongTap ? " shake" : ""}`}
              onClick={() => {
                setWrongTap(true);
                setTimeout(() => setWrongTap(false), 500);
              }}
              aria-label={`Try serving ${mugicha?.name} (wrong drink)`}
            >
              <span className="slosh-ticket-glyph" aria-hidden="true">
                {mugicha?.glyph}
              </span>
              <span className="slosh-ticket-name">{mugicha?.name}</span>
            </button>
          </div>
          {served ? (
            <p className="slosh-tut-done">
              ✓ Served! That&apos;s the whole core loop: <b>grab the drink, tap the
              matching ticket</b>. (Tapping the wrong ticket just shakes it. No
              penalty, no serve.)
            </p>
          ) : (
            <p className="slosh-hint">
              Psst: try tapping the {mugicha?.name} ticket too, just to see what
              happens.
            </p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="slosh-tut-card">
          <p>
            Lenny fumbles. When he does, <b>tap the problem to fix it</b>. Practice
            all three:
          </p>
          <div className="slosh-tut-fumble">
            <button
              type="button"
              className="slosh-crate"
              onClick={() => setCrateTaps((v) => Math.max(0, v - 1))}
              disabled={crateTaps === 0}
            >
              {crateTaps === 0 ? "✓ Shoved back!" : `📦 WRONG CRATE! Tap ${crateTaps}× to shove it back!`}
            </button>
            <p className="slosh-hint">A wrong crate blocks the belt. 3 taps shoves it back.</p>
          </div>
          <div className="slosh-tut-fumble">
            <button
              type="button"
              className="slosh-spill"
              onClick={() => setSpillTaps((v) => Math.max(0, v - 1))}
              disabled={spillTaps === 0}
            >
              {spillTaps === 0 ? "✓ Mopped!" : `💧 SPILL! Mop it! (${spillTaps}×)`}
            </button>
            <p className="slosh-hint">
              Spills must be mopped <b>fast</b> (2 taps, 6 seconds) or <b>every
              ticket</b> loses patience.
            </p>
          </div>
          <div className="slosh-tut-fumble">
            <button
              type="button"
              className="slosh-keg"
              onClick={() => setKegHp((v) => Math.max(0, v - 1))}
              disabled={kegHp === 0}
            >
              {kegHp === 0 ? "✓ Cracked! 🥤 Free drink!" : <>🛢️<span className="slosh-keg-hp">{kegHp}</span></>}
            </button>
            <p className="slosh-hint">
              A mystery keg rolls toward you. <b>5 taps</b> cracks it before it
              reaches you, and the free drink inside is always one a ticket wants.
              If it hits you: you lose your held drink and get <b>dazed</b> for 2
              seconds.
            </p>
          </div>
          {fumblesDone && (
            <p className="slosh-tut-done">✓ All three handled. Lenny fears you now.</p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="slosh-tut-card">
          <p>Two last things before you clock in:</p>
          <ul>
            <li>
              <b>⭐ THREATEN ONE-STAR REVIEW:</b> your panic button. Lenny sweats
              and sends <b>only correct drinks</b> for 6 seconds. 25-second
              cooldown, so save it for a rough patch.
            </li>
            <li>
              <b>⚠️ THE CIDER:</b> if a customer orders {cider?.name}, Lenny loses
              it: <i>&ldquo;CIDER?! I DON&apos;T do cider!! FINE. But I&apos;m
              FURIOUS about it.&rdquo;</i> While a cider ticket is active his
              fumbles come <b>twice as fast</b>. Serve it or let it walk out to
              calm him down.
            </li>
          </ul>
          <p>
            That&apos;s everything. Grab drinks, match tickets, smack Lenny&apos;s
            fumbles, and pray nobody orders the cider.
          </p>
        </div>
      )}

      {nav}
      <button className="linklike" type="button" onClick={onExit}>
        Not today. Back to the counter.
      </button>
    </div>
  );
}
