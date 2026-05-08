/**
 * BookAgent.jsx — AI Observer Book Widget
 * Sits fixed bottom-left above mobile nav.
 * Responds to: ADD, UPDATE, DELETE, EXPORT, P2P_START, P2P_END, PROFILE_UPDATE
 * Click/tap: greeting animation with speech bubble.
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import useAppStore from '../store';

// ── Animation state IDs ────────────────────────────────────────────────────
const S = { IDLE: 'idle', ADD: 'add', UPDATE: 'update', DEL: 'del', EXPORT: 'export', P2P: 'p2p', PROFILE: 'profile', GREET: 'greet' };

// ── Face expressions (text glyphs rendered on cover) ──────────────────────
const FACES = {
  [S.IDLE]: { e: '· ·', m: '‿', c: '#00f99b' },
  [S.ADD]: { e: '★ ★', m: '‿', c: '#00f99b' },
  [S.UPDATE]: { e: '● ●', m: '─', c: '#afc6ff' },
  [S.DEL]: { e: '× ×', m: '︵', c: '#ffb4ab' },
  [S.EXPORT]: { e: '▲ ▲', m: '‿', c: '#00f99b' },
  [S.P2P]: { e: '◈ ◈', m: '─', c: '#afc6ff' },
  [S.PROFILE]: { e: '^ ^', m: '‿', c: '#ffd700' },
  [S.GREET]: { e: '◡ ◡', m: '‿', c: '#00f99b' },
};

// ── Status labels and colors ────────────────────────────────────────────────
const LABELS = {
  [S.ADD]: 'STORING', [S.UPDATE]: 'REVISING', [S.DEL]: 'REMOVING',
  [S.EXPORT]: 'EXPORTING', [S.P2P]: 'P2P ACTIVE', [S.PROFILE]: 'UPDATING',
};
const COLORS = {
  [S.ADD]: '#006d41', [S.UPDATE]: '#0059c6', [S.DEL]: '#ba1a1a',
  [S.EXPORT]: '#006d41', [S.P2P]: '#0059c6', [S.PROFILE]: '#7b5800',
};

// ── Auto-reset durations (ms) — P2P stays until P2P_END ────────────────────
const DURATION = { [S.ADD]: 3000, [S.UPDATE]: 3200, [S.DEL]: 2600, [S.EXPORT]: 3500, [S.PROFILE]: 2800, [S.GREET]: 2600 };

// ══════════════════════════════════════════════════════════════════════════════
export default function BookAgent() {
  const lastAction = useAppStore(s => s.lastAction);
  const [state, setState] = useState(S.IDLE);
  const [showGreet, setShowGreet] = useState(false);
  const timer = useRef(null);

  // Helper: change state and auto-reset after duration
  const goState = useCallback((next, ms) => {
    clearTimeout(timer.current);
    setState(next);
    setShowGreet(false);
    if (ms) timer.current = setTimeout(() => setState(S.IDLE), ms);
  }, []);

  // React to store events
  useEffect(() => {
    if (!lastAction) return;
    const { type } = lastAction;
    if (type === 'ADD') goState(S.ADD, DURATION[S.ADD]);
    else if (type === 'UPDATE') goState(S.UPDATE, DURATION[S.UPDATE]);
    else if (type === 'DELETE') goState(S.DEL, DURATION[S.DEL]);
    else if (type === 'EXPORT') goState(S.EXPORT, DURATION[S.EXPORT]);
    else if (type === 'P2P_START') goState(S.P2P, null); // holds
    else if (type === 'P2P_END') goState(S.IDLE, null);
    else if (type === 'PROFILE_UPDATE') goState(S.PROFILE, DURATION[S.PROFILE]);
  }, [lastAction, goState]);

  // Cleanup on unmount
  useEffect(() => () => clearTimeout(timer.current), []);

  // Tap / click handler
  const onTap = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === S.P2P) return; // don't interrupt P2P
    clearTimeout(timer.current);
    setState(S.GREET);
    setShowGreet(true);
    timer.current = setTimeout(() => {
      setShowGreet(false);
      setTimeout(() => setState(S.IDLE), 350);
    }, DURATION[S.GREET]);
  }, [state]);

  const face = FACES[state] || FACES[S.IDLE];
  const coverOpen = state === S.ADD || state === S.UPDATE || state === S.EXPORT;
  const isP2P = state === S.P2P;
  const isDel = state === S.DEL;

  // Book 3D animation name
  const bookAnim =
    isDel ? 'ba-shake 0.4s ease-in-out 4 both' :
      state === S.GREET ? 'ba-jump 0.55s ease-out 1 both' :
        state === S.PROFILE ? 'ba-wave 0.7s ease-in-out 3 both' :
          isP2P ? 'ba-pulse 2s ease-in-out infinite' :
            'ba-float 5s ease-in-out infinite';

  return (
    <>
      {/* ── Fixed container — bottom-left above mobile nav, lower on desktop ── */}
      <div
        style={{
          position: 'fixed',
          bottom: undefined,   // let Tailwind control this
          left: 14,
          zIndex: 20,
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        className="bottom-24 md:bottom-6"
      >

        {/* ── Status badge ── */}
        <div style={{
          textAlign: 'center', marginBottom: 5, height: LABELS[state] ? 14 : 0,
          overflow: 'hidden', transition: 'height 0.3s ease',
        }}>
          {LABELS[state] && (
            <span style={{
              fontSize: 8, fontFamily: 'monospace', fontWeight: 900, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: COLORS[state],
            }}>
              ● {LABELS[state]}
            </span>
          )}
        </div>

        {/* ── P2P Layout: two books + path ── */}
        {isP2P ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Book3D face={face} coverOpen={false} bookAnim={bookAnim} isDel={false} size={40} />
            <P2PPath />
            <Book3D face={face} coverOpen={false} bookAnim={bookAnim} isDel={false} size={40} flipped />
          </div>
        ) : (
          /* ── Single book ── */
          <Book3D
            face={face} coverOpen={coverOpen} bookAnim={bookAnim}
            isDel={isDel} isExport={state === S.EXPORT}
            size={44} onTap={onTap}
          />
        )}

        {/* ── Greeting bubble (above book) ── */}
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%',
          transform: showGreet ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(6px) scale(0.92)',
          opacity: showGreet ? 1 : 0,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: 'none', zIndex: 30, whiteSpace: 'nowrap',
        }}>
          <div style={{
            background: '#fbf9f0', border: '2px solid #006d41',
            boxShadow: '3px 3px 0px #006d41', padding: '5px 10px',
            fontFamily: 'monospace', fontSize: 10, fontWeight: 900,
            color: '#006d41', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            👋 HI! I'M WATCHING.
          </div>
          {/* Downward arrow */}
          <div style={{
            position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '7px solid #006d41',
          }} />
        </div>
      </div>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes ba-float  { 0%,100%{transform:rotateX(-18deg) rotateY(-30deg) translateY(0)} 50%{transform:rotateX(-23deg) rotateY(-38deg) translateY(-7px)} }
        @keyframes ba-shake  { 0%,100%{transform:rotateX(-18deg) rotateY(-30deg) translateX(0)} 20%{transform:rotateX(-18deg) rotateY(-30deg) translateX(-7px) rotate(-3deg)} 40%{transform:rotateX(-18deg) rotateY(-30deg) translateX(7px) rotate(3deg)} 60%{transform:rotateX(-18deg) rotateY(-30deg) translateX(-5px) rotate(-2deg)} 80%{transform:rotateX(-18deg) rotateY(-30deg) translateX(5px) rotate(2deg)} }
        @keyframes ba-jump   { 0%{transform:rotateX(-18deg) rotateY(-30deg) scale(1) translateY(0)} 35%{transform:rotateX(-6deg) rotateY(-8deg) scale(1.2) translateY(-14px)} 65%{transform:rotateX(-14deg) rotateY(-24deg) scale(1.08) translateY(-5px)} 100%{transform:rotateX(-18deg) rotateY(-30deg) scale(1) translateY(0)} }
        @keyframes ba-wave   { 0%,100%{transform:rotateX(-18deg) rotateY(-30deg)} 33%{transform:rotateX(-18deg) rotateY(-48deg) translateY(-4px)} 66%{transform:rotateX(-18deg) rotateY(-14deg) translateY(-4px)} }
        @keyframes ba-pulse  { 0%,100%{transform:rotateX(-18deg) rotateY(-30deg) scale(1)} 50%{transform:rotateX(-22deg) rotateY(-36deg) scale(1.07)} }
        @keyframes ba-path   { to { stroke-dashoffset: -18; } }
      `}</style>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Book3D — the actual 3D CSS book
// ══════════════════════════════════════════════════════════════════════════════
function Book3D({ face, coverOpen, bookAnim, isDel, isExport, size = 44, onTap, flipped }) {
  const h = Math.round(size * 1.35);
  const spine = Math.round(size * 0.25);
  const pages = Math.round(size * 0.22);

  return (
    <div
      role={onTap ? 'button' : undefined}
      tabIndex={onTap ? 0 : undefined}
      aria-label="AI Observer"
      onClick={onTap}
      onTouchEnd={onTap}
      onKeyDown={onTap ? e => (e.key === 'Enter' || e.key === ' ') && onTap(e) : undefined}
      style={{
        width: size, height: h,
        position: 'relative', perspective: '600px', perspectiveOrigin: '65% 40%',
        cursor: onTap ? 'pointer' : 'default',
        transform: flipped ? 'scaleX(-1)' : undefined,
        flexShrink: 0,
      }}
    >
      {/* 3D rotating node */}
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d',
        animation: bookAnim, willChange: 'transform',
        filter: isDel ? 'drop-shadow(0 0 10px rgba(186,26,26,0.9))' : 'none',
        transition: 'filter 0.3s ease',
      }}>

        {/* ── Back face ── */}
        <div style={face3('translateZ(-7px)', 'linear-gradient(160deg,#004d2e,#002718)', '1px solid #001810')} />

        {/* ── Spine (left edge) ── */}
        <div style={{
          position: 'absolute', width: spine, height: '100%', top: 0, left: 0,
          background: 'linear-gradient(90deg,#001810,#003020)', border: '1px solid #001010',
          transform: 'rotateY(-90deg) translateZ(0)',
          transformOrigin: 'left center', WebkitTransformOrigin: 'left center',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 6, fontWeight: 900, color: 'rgba(0,249,155,0.7)',
            letterSpacing: '0.3em', writingMode: 'vertical-rl', textOrientation: 'mixed',
          }}>RLINKS</span>
        </div>

        {/* ── Pages edge (right) ── */}
        <div style={{
          position: 'absolute', width: pages, height: '100%', top: 0, right: 0,
          background: 'repeating-linear-gradient(0deg,#e8e4d4 0,#e8e4d4 2px,#fbf9f0 2px,#fbf9f0 5px)',
          border: '1px solid #c4c0b0',
          transform: `rotateY(90deg) translateZ(${size - pages}px)`,
          transformOrigin: 'right center', WebkitTransformOrigin: 'right center',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        }} />

        {/* ── Top edge ── */}
        <div style={{
          position: 'absolute', width: '100%', height: spine, top: 0, left: 0,
          background: 'linear-gradient(180deg,#fbf9f0,#e4e0d0)', border: '1px solid #c4c0b0',
          transform: 'rotateX(90deg)', transformOrigin: 'top center', WebkitTransformOrigin: 'top center',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        }} />

        {/* ── Inner page ── */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
          background: isExport ? '#fffde8' : '#fbf9f0',
          border: '1px solid #d0ccbc',
          transform: coverOpen ? 'rotateY(-38deg) translateZ(-1px)' : 'translateZ(-1px)',
          transformOrigin: 'left center', WebkitTransformOrigin: 'left center',
          transition: 'transform 0.7s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.4s ease',
          boxShadow: coverOpen ? (isExport ? 'inset 0 0 25px rgba(255,180,0,0.35)' : 'inset 0 0 25px rgba(0,249,155,0.35)') : 'none',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden',
        }}>
          {/* Ruled lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              position: 'absolute', left: 5, right: 5, top: 9 + i * 7, height: 1,
              background: coverOpen
                ? (isExport ? 'rgba(180,140,0,0.5)' : 'rgba(0,249,155,0.5)')
                : 'rgba(106,123,110,0.2)',
              transition: 'background 0.4s ease',
            }} />
          ))}
          {/* Dot indicator top-left */}
          <div style={{
            position: 'absolute', top: 6, left: 6, width: 5, height: 5, borderRadius: '50%',
            background: coverOpen ? (isExport ? '#ffd740' : '#00f99b') : 'transparent',
            transition: 'background 0.4s ease',
          }} />
        </div>

        {/* ── Front cover (swings open) ── */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
          background: 'linear-gradient(145deg,#008050,#005030,#003820)',
          border: '1.5px solid #001810',
          transform: coverOpen ? 'rotateY(-152deg) translateZ(7px)' : 'translateZ(7px)',
          transformOrigin: 'left center', WebkitTransformOrigin: 'left center',
          transition: 'transform 0.75s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '4px 4px 0px #001810',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          {/* Corner accents */}
          <div style={{ position: 'absolute', top: 4, left: 4, width: 8, height: 8, borderTop: '1.5px solid rgba(0,249,155,0.4)', borderLeft: '1.5px solid rgba(0,249,155,0.4)' }} />
          <div style={{ position: 'absolute', bottom: 4, right: 4, width: 8, height: 8, borderBottom: '1.5px solid rgba(0,249,155,0.4)', borderRight: '1.5px solid rgba(0,249,155,0.4)' }} />
          {/* Emoji face */}
          <div style={{ fontFamily: 'monospace', fontSize: size < 42 ? 9 : 11, fontWeight: 900, color: face.c, textAlign: 'center', lineHeight: 1.4, transition: 'color 0.4s ease' }}>
            <div>{face.e}</div>
            <div>{face.m}</div>
          </div>
          {/* DB badge */}
          <div style={{ border: `1px solid ${face.c}`, padding: '1px 4px', fontFamily: 'monospace', fontSize: 7, fontWeight: 900, color: face.c, letterSpacing: '0.1em', transition: 'color 0.3s,border-color 0.3s' }}>
            DB
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Animated SVG path between two books in P2P mode ──────────────────────
function P2PPath() {
  return (
    <svg width={40} height={50} viewBox="0 0 40 50" style={{ flexShrink: 0 }}>
      <path d="M4 25 Q20 6 36 25" fill="none" stroke="#0059c6" strokeWidth={2}
        strokeDasharray="5 3" strokeLinecap="round"
        style={{ animation: 'ba-path 0.9s linear infinite' }} />
      <path d="M4 25 Q20 44 36 25" fill="none" stroke="#afc6ff" strokeWidth={1.5}
        strokeDasharray="3 5" strokeLinecap="round"
        style={{ animation: 'ba-path 1.3s linear infinite reverse' }} />
      {/* Moving dot */}
      <circle r={3} fill="#0059c6">
        <animateMotion dur="1s" repeatCount="indefinite" path="M4 25 Q20 6 36 25" />
      </circle>
      <circle r={2} fill="#afc6ff" opacity={0.8}>
        <animateMotion dur="1.4s" repeatCount="indefinite" path="M36 25 Q20 44 4 25" />
      </circle>
    </svg>
  );
}

// ── Utility: flat face styles ──────────────────────────────────────────────
function face3(transform, bg, border) {
  return {
    position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
    background: bg, border,
    transform,
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
  };
}
