"use client";

import { BOWLS } from './kitchen-rules.mjs';

const pips = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

export default function BowlRoll({ value, onRoll, onContinue }: {
  value: number | null; onRoll: () => void; onContinue: () => void;
}) {
  const bowl = value === null ? null : BOWLS[value];
  return <>
    <p className="eyebrow orange">FIRST, A LITTLE LUCK</p>
    <h2>Roll for your bowl.</h2>
    <p className="description">One die. Six house bowls. Each has its own glaze and pattern. Your roll picks the bowl for this order.</p>
    <div className={`bowl-die ${bowl ? 'rolled' : ''}`} role="img" aria-label={value === null ? 'Die ready to roll' : `Rolled ${value + 1}`}>
      {value === null ? <span className="die-question">?</span> : Array.from({ length: 9 }, (_, i) => <span key={i} className={pips[value].includes(i) ? 'pip' : ''} />)}
    </div>
    <div className="bowl-roll-result" role="status">{bowl ? <><strong>{bowl.name}</strong><p>{bowl.note}</p></> : <p>The counter has six bowls. Which one&apos;s yours?</p>}</div>
    <ol className="bowl-collection" aria-label="The six possible bowls">
      {BOWLS.map((option, i) => <li key={option.name} className={value === i ? 'picked' : ''}>
        <span className="mini-bowl" style={{ backgroundColor: option.body, borderColor: option.rim }} />
        <span>{i + 1}. {option.name}</span>
      </li>)}
    </ol>
    {bowl ? <button className="primary" onClick={onContinue}>THIS BOWL&apos;S MINE <span>→</span></button> : <button className="primary" onClick={onRoll}>ROLL THE DIE <span>⚄</span></button>}
    <p className="tiny">One roll per order. Same ingredients, six distinct house ceramics.</p>
  </>;
}
