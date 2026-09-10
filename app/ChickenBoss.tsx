"use client";

import { useEffect, useRef, useState } from 'react';
import { BOSS_HITS, FIERY_BOSS_HITS, GOLDEN_BOSS_HITS, GOLDEN_PLAYER_HITS, GOLDEN_HEALTH_BOWLS, FLIGHT_SECONDS, chickenX, eggHitsChicken, scoreEgg } from './chicken-rules.mjs';

type Shot = { x: number; y: number; started: number };

export default function ChickenBoss({ onWin, onLose, onThrow, isOnFire = false, isGolden = false }: { onWin: () => void; onLose?: () => void; onThrow: () => void; isOnFire?: boolean; isGolden?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const win = useRef(onWin);
  const sound = useRef(onThrow);
  const lose = useRef(onLose);
  const game = useRef({ time: 0, hits: 0, playerHits: 0, aim: 320, shot: null as Shot | null, enemyEgg: null as { started: number; x: number } | null, flash: 0, hit: false, done: false });
  const targetHits = isGolden ? GOLDEN_BOSS_HITS : isOnFire ? FIERY_BOSS_HITS : BOSS_HITS;
  const [hits, setHits] = useState(0);
  const [playerHits, setPlayerHits] = useState(0);
  const [feedback, setFeedback] = useState(isGolden ? 'The golden chicken fights back with electric eggs!' : 'A wild chicken escaped onto Shrewsbury Street!');

  useEffect(() => { win.current = onWin; lose.current = onLose; sound.current = onThrow; }, [onWin, onLose, onThrow]);
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!context) return;
    let frame = 0;
    let previous = 0;
    let active = true;
    const rect = (x: number, y: number, w: number, h: number, color: string) => {
      context.fillStyle = color;
      context.fillRect(Math.round(x), Math.round(y), w, h);
    };
    const text = (label: string, x: number, y: number, size = 10, color = '#e6d9ae') => {
      context.font = `bold ${size}px monospace`;
      context.fillStyle = color;
      context.fillText(label, x, y);
    };
    function animate(now: number) {
      if (!active) return;
      const g = game.current;
      // Clamp elapsed time so background tabs cannot produce surprise shots or hits.
      g.time += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      if (isGolden && !g.enemyEgg && Math.floor(g.time) > 0 && Math.floor(g.time * 2) % 7 === 0) g.enemyEgg = { started: g.time, x: chickenX(g.time) };
      if (isGolden && g.enemyEgg && g.time - g.enemyEgg.started >= 0.75) {
        g.playerHits += 1;
        setPlayerHits(g.playerHits);
        g.enemyEgg = null;
        setFeedback(g.playerHits >= GOLDEN_PLAYER_HITS ? "Looks like you need more ramen! You're cooked buddy!" : `Electric egg hit! ${GOLDEN_PLAYER_HITS - g.playerHits} hits left.`);
        if (g.playerHits >= GOLDEN_PLAYER_HITS) { g.done = true; lose.current?.(); return; }
      }
      if (g.shot && g.time - g.shot.started >= FLIGHT_SECONDS) {
        g.hit = eggHitsChicken(g.shot.x, g.shot.y, g.time);
        g.hits = scoreEgg(g.hits, g.hit, targetHits);
        g.flash = g.time + 0.3;
        g.shot = null;
        setHits(g.hits);
        setFeedback(g.hit ? `${g.hits} of ${targetHits} hits! ${g.hits === targetHits ? 'ABSOLUTE GOAT. Order complete!' : 'Direct yolk!'}` : 'Miss! Lead the chicken a little. Unlimited eggs, keep throwing.');
        if (g.hits === targetHits) { g.done = true; win.current(); return; }
      }
      rect(0, 0, 640, 350, '#202c26');
      for (let x = 0; x < 640; x += 48) {
        rect(x, 60, 42, 105, '#334435');
        rect(x + 4, 68, 4, 85, '#465440');
      }
      rect(0, 106, 640, 7, '#526247');
      rect(0, 167, 640, 183, '#4c4b32');
      for (let i = 0; i < 42; i++) rect((i * 97) % 640, 180 + (i * 31) % 160, 9, 3, '#65704b');
      rect(211, 15, 218, 27, '#cfac72');
      text('SHREWSBURY ST. / WILD CROSSING', 219, 33, 11, '#343c2b');
      const x = chickenX(g.time);
      const stride = Math.sin(g.time * 16) > 0 ? 5 : -5;
      rect(x - 27, 174, 59, 6, '#34392a');
      rect(x - 22 + stride, 165, 7, 12, '#e6a04d');
      rect(x + 13 - stride, 165, 7, 12, '#e6a04d');
      const feather = isGolden ? '#f3c94f' : isOnFire ? '#e35b35' : g.flash > g.time && g.hit ? '#f4bb4b' : '#eee1b5';
      rect(x - 29, 129, 49, 34, feather);
      rect(x - 36, 118, 12, 30, feather);
      rect(x - 44, 111, 10, 22, '#bcae83');
      rect(x - 18, 139, 25, 16, '#c9ba90');
      rect(x + 12, 108, 26, 43, feather);
      rect(x + 16, 100, 7, 10, '#d76043');
      rect(x + 27, 96, 7, 14, '#d76043');
      rect(x + 31, 118, 5, 5, '#252b23');
      rect(x + 38, 128, 12, 7, '#e9a744');
      rect(x + 27, 141, 8, 12, '#d76043');
      // Fixed throwing position and an aim reticle; shots travel before collision.
      rect(g.aim - 13, 144, 26, 2, '#e5b271');
      rect(g.aim - 1, 133, 2, 26, '#e5b271');
      if (isGolden && g.enemyEgg) {
        const p = Math.min(1, (g.time - g.enemyEgg.started) / 0.75);
        const ex = chickenX(g.enemyEgg.started) + (320 - chickenX(g.enemyEgg.started)) * p;
        const ey = 120 + 194 * p;
        rect(ex - 7, ey - 7, 14, 14, '#f3c94f');
        rect(ex - 3, ey - 12, 6, 24, '#8ee7ff');
        rect(ex - 12, ey - 3, 24, 6, '#8ee7ff');
      }
      if (g.shot) {
        const p = Math.min(1, (g.time - g.shot.started) / FLIGHT_SECONDS);
        const ex = 320 + (g.shot.x - 320) * p;
        const ey = 314 + (g.shot.y - 314) * p - Math.sin(p * Math.PI) * 24;
        rect(ex - 6, ey - 8, 12, 16, '#fff0c7');
        rect(ex - 4, ey - 11, 8, 22, '#fff0c7');
        rect(ex - 2, ey - 3, 5, 7, '#e8ac45');
      }
      rect(285, 321, 70, 29, '#bc8e61');
      rect(300, 307, 38, 22, '#dfb07d');
      text('508 EGG PATROL', 18, 326, 11);
      text(`${g.hits}/${targetHits} HITS`, 543, 326, 12);
      if (isGolden) {
        text('GOLDEN CHICKEN', 245, 58, 12, '#f3c94f');
        text(`RAMEN HEALTH ${GOLDEN_HEALTH_BOWLS - Math.ceil(g.playerHits / 2)}/${GOLDEN_HEALTH_BOWLS}`, 18, 347, 10, '#f3c94f');
      }
      if (isOnFire) text('HOT SAUCE CHICKEN', 245, 58, 12, '#ffb347');
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    canvas.current?.focus();
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [isGolden, isOnFire, targetHits]);

  function throwEgg(x = game.current.aim, y = 145) {
    const g = game.current;
    if (g.done || g.shot) return;
    g.aim = x;
    g.shot = { x, y, started: g.time };
    sound.current();
  }

  return <div className="boss-game">
    <canvas ref={canvas} width={640} height={350} tabIndex={0} role="button" aria-roledescription="egg-toss game"
      aria-label={`${isGolden ? 'Golden chicken electric egg battle' : 'Wild chicken egg toss'}${isOnFire ? ' with hot sauce on fire' : ''}. Click or tap ahead of the moving chicken to throw. Keyboard: left and right arrows aim, Space or Enter throws. Hit ${targetHits} times. ${isGolden ? `${GOLDEN_PLAYER_HITS} incoming hits defeat you.` : ''}`}
      onPointerDown={event => {
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.focus({ preventScroll: true });
        throwEgg((event.clientX - bounds.left) * 640 / bounds.width, (event.clientY - bounds.top) * 350 / bounds.height);
      }}
      onKeyDown={event => {
        if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(event.key)) event.preventDefault();
        if (event.key === 'ArrowLeft') game.current.aim = Math.max(35, game.current.aim - 18);
        if (event.key === 'ArrowRight') game.current.aim = Math.min(605, game.current.aim + 18);
        if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) throwEgg();
      }} />
    <div className="boss-score">
      <span aria-label={`${hits} of ${targetHits} hits`}>{'◒'.repeat(hits)}{'○'.repeat(targetHits - hits)}</span>
      {isGolden && <span aria-label={`${GOLDEN_HEALTH_BOWLS - Math.ceil(playerHits / 2)} of ${GOLDEN_HEALTH_BOWLS} ramen bowls health`}> {Array.from({ length: GOLDEN_HEALTH_BOWLS }, (_, index) => index < GOLDEN_HEALTH_BOWLS - Math.ceil(playerHits / 2) ? '◉' : '○').join('')} HEALTH</span>}
      <p role="status">{feedback}</p>
    </div>
    <p className="tiny boss-controls">TAP TO AIM & THROW · ← → + SPACE ON KEYBOARD · UNLIMITED EGGS</p>
  </div>;
}
