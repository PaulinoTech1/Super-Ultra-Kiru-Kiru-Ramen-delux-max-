"use client";

import { useEffect, useState } from 'react';
import { BOWLS } from './kitchen-rules.mjs';

const pips = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

export default function BowlRoll({ value, onRoll, onChoose, onContinue }: {
  value: number | null; onRoll: () => void; onChoose: (index: number) => void; onContinue: () => void;
}) {
  const bowl = value === null ? null : BOWLS[value];
  // Mobile stepper: on phones the six bowls are shown one card at a time
  // (tapped ‹ ›) instead of a scrolling grid. Desktop ignores `mi`.
  const [mi, setMi] = useState(value ?? 0);
  useEffect(() => { if (value !== null) setMi(value); }, [value]);
  const pick = (i: number) => { setMi(i); onChoose(i); };
  const step = (d: number) => setMi((m) => Math.min(BOWLS.length - 1, Math.max(0, m + d)));
  return <>
    <p className="eyebrow orange">FIRST, A LITTLE LUCK</p>
    <h2>Roll for your bowl.</h2>
    <p className="description">One die. Six house bowls. Each has its own glaze and pattern. Your roll picks the bowl for this order.</p>
    <div className={`bowl-die ${bowl ? 'rolled' : ''}`} role="img" aria-label={value === null ? 'Die ready to roll' : `Rolled ${value + 1}`}>
      {value === null ? <span className="die-question">?</span> : Array.from({ length: 9 }, (_, i) => <span key={i} className={pips[value].includes(i) ? 'pip' : ''} />)}
    </div>
    <div className="bowl-roll-result" role="status">{bowl ? <><strong>{bowl.name}</strong><p>{bowl.note}</p></> : <p>The counter has six bowls. Which one&apos;s yours?</p>}</div>
    <ol className="bowl-collection" aria-label="The six possible bowls">
      {BOWLS.map((option, i) => <li key={option.name} className={value === i ? 'picked' : ''} data-active={i === mi}>
        <button type="button" className="bowl-choice" onClick={() => pick(i)} aria-label={`Choose bowl ${i + 1}, ${option.name}`}>
          <span className="mini-bowl" style={{ backgroundColor: option.body, borderColor: option.rim }} />
          <span>{i + 1}. {option.name}</span>
        </button>
      </li>)}
    </ol>
    <div className="bowl-step-nav" role="group" aria-label="Browse the six bowls">
      <button type="button" onClick={() => step(-1)} disabled={mi === 0} aria-label="Previous bowl">‹</button>
      <div className="step-dots" aria-hidden="true">
        {BOWLS.map((option, i) => <span key={option.name} className={i === mi ? 'on' : ''} />)}
      </div>
      <p className="step-pos" aria-live="polite">{mi + 1} / {BOWLS.length}</p>
      <button type="button" onClick={() => step(1)} disabled={mi === BOWLS.length - 1} aria-label="Next bowl">›</button>
    </div>
    {bowl ? <div className="bowl-actions"><button className="primary" onClick={onContinue}>THIS BOWL&apos;S MINE <span>→</span></button><button className="secondary" onClick={onRoll}>ROLL AGAIN <span>↻</span></button></div> : <button className="primary" onClick={onRoll}>ROLL THE DIE <span>⚄</span></button>}
    <p className="tiny">Roll again or choose any bowl from the counter. Same ingredients, six distinct house ceramics.</p>
  </>;
}
