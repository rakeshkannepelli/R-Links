/**
 * BookAgent.jsx — Cute Round / Oval AI Companion Bot ("R-Bot")
 * Positioned fixed bottom-left above navigation.
 * Features cute round/oval egg capsule body, animated glowing digital face,
 * tiny bobbing ears/antenna, and cheerful interactive animations.
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import useAppStore from '../store';

// Animation state IDs
const S = { IDLE: 'idle', ADD: 'add', UPDATE: 'update', DEL: 'del', EXPORT: 'export', P2P: 'p2p', PROFILE: 'profile', GREET: 'greet' };

// Cute digital face expressions for the visor
const FACES = {
  [S.IDLE]:    { leftEye: '●', rightEye: '●', mouth: '‿', color: '#00f99b', label: 'ONLINE' },
  [S.ADD]:     { leftEye: '★', rightEye: '★', mouth: '‿', color: '#00f99b', label: 'SAVED!' },
  [S.UPDATE]:  { leftEye: '◕', rightEye: '◕', mouth: '─', color: '#60a5fa', label: 'UPDATED' },
  [S.DEL]:     { leftEye: '×', rightEye: '×', mouth: '︵', color: '#f87171', label: 'REMOVED' },
  [S.EXPORT]:  { leftEye: '▲', rightEye: '▲', mouth: '‿', color: '#00f99b', label: 'EXPORTED' },
  [S.P2P]:     { leftEye: '◈', rightEye: '◈', mouth: '─', color: '#a78bfa', label: 'P2P SYNC' },
  [S.PROFILE]: { leftEye: '^', rightEye: '^', mouth: '‿', color: '#fbbf24', label: 'PROFILE' },
  [S.GREET]:   { leftEye: '^', rightEye: '^', mouth: '‿', color: '#00f99b', label: 'HELLO!' },
};

const DURATION = {
  [S.ADD]: 3000,
  [S.UPDATE]: 3000,
  [S.DEL]: 2500,
  [S.EXPORT]: 3500,
  [S.PROFILE]: 2800,
  [S.GREET]: 2800
};

export default function BookAgent() {
  const lastAction = useAppStore(s => s.lastAction);
  const user = useAppStore(s => s.user);
  const links = useAppStore(s => s.links);
  const [state, setState] = useState(S.IDLE);
  const [showGreet, setShowGreet] = useState(false);
  const [greetText, setGreetText] = useState("✨ Tap me for a daily spark or joke!");
  const [hovered, setHovered] = useState(false);
  
  const timer = useRef(null);
  const clickCount = useRef(0);

  const goState = useCallback((next, ms) => {
    clearTimeout(timer.current);
    setState(next);
    setShowGreet(false);
    if (ms) timer.current = setTimeout(() => setState(S.IDLE), ms);
  }, []);

  useEffect(() => {
    if (!lastAction) return;
    const { type } = lastAction;
    if (type === 'ADD') goState(S.ADD, DURATION[S.ADD]);
    else if (type === 'UPDATE') goState(S.UPDATE, DURATION[S.UPDATE]);
    else if (type === 'DELETE') goState(S.DEL, DURATION[S.DEL]);
    else if (type === 'EXPORT') goState(S.EXPORT, DURATION[S.EXPORT]);
    else if (type === 'P2P_START') goState(S.P2P, null);
    else if (type === 'P2P_END') goState(S.IDLE, null);
    else if (type === 'PROFILE_UPDATE') goState(S.PROFILE, DURATION[S.PROFILE]);
  }, [lastAction, goState]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onTap = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === S.P2P) return;
    clearTimeout(timer.current);
    
    const total = links.length;
    const opId = user?.operatorId || 'OPERATOR';
    
    const quotes = [
      // Motivational & Best Quotes
      "🚀 'The secret of getting ahead is getting started.' — Mark Twain",
      "🔥 'First, solve the problem. Then, write the code.' — John Johnson",
      "⚡ 'Stay curious & keep building. Greatness is built one link at a time!'",
      "💡 'Simplicity is prerequisite for reliability.' — Edsger Dijkstra",
      "✨ 'Your mind is for having ideas, not holding them. RLinks has your back!'",
      "🌟 'Every expert was once a beginner. Keep archiving gems!'",
      "🏆 'Focus on progress, not perfection. You are doing amazing!'",
      "🔮 'The best way to predict the future is to invent it.' — Alan Kay",
      "🌱 'Small disciplines repeated with consistency lead to great achievements.'",
      
      // Coding Jokes & Tech Humor
      "😂 Why do programmers prefer dark mode? Because light attracts bugs!",
      "☕ A developer's mind: 90% coffee, 10% googling syntax errors!",
      "🐛 It’s not a bug, it’s an undocumented feature in disguise!",
      "🍕 Why did the JS developer wear glasses? Because they didn't C#!",
      "🛸 There are 10 types of people: those who understand binary, and those who don't!",
      "🤖 I asked my computer for a joke... it gave me Windows updates at 99%!",
      "🌐 There's no place like 127.0.0.1 — home sweet localhost!",
      "✨ 99 little bugs in the code, fix one down, 127 little bugs in the code!"
    ];
    
    const idx = (clickCount.current + Math.floor(Math.random() * (quotes.length - 1) + 1)) % quotes.length;
    clickCount.current += 1;
    
    setGreetText(quotes[idx]);
    setState(S.GREET);
    setShowGreet(true);
    
    timer.current = setTimeout(() => {
      setShowGreet(false);
      setTimeout(() => setState(S.IDLE), 300);
    }, 4000);
  }, [state]);

  const currentFace = FACES[state] || FACES[S.IDLE];

  return (
    <>
      <aside
        aria-label="R-Bot AI Assistant"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onTap}
        className="fixed z-40 cursor-pointer select-none bottom-20 md:bottom-6 left-2 md:left-4 scale-[0.70] md:scale-100 origin-bottom-left transition-all duration-300"
        style={{
          transform: hovered ? 'scale(1.08) translateY(-4px)' : undefined,
        }}
      >
        {/* Status Chip Above Bot */}
        <div className="flex justify-center mb-1.5 h-4 overflow-hidden">
          <span 
            className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shadow-sm transition-all"
            style={{
              color: currentFace.color,
              borderColor: `${currentFace.color}40`,
              background: '#121417',
            }}
          >
            ● {currentFace.label}
          </span>
        </div>

        {/* ── The Cute Round / Oval Bot Body ── */}
        <div 
          className="relative flex items-center justify-center rbot-float"
          style={{
            width: 58,
            height: 64,
          }}
        >
          {/* Top Antenna Bulb */}
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-[#30312b] rounded-full flex flex-col items-center"
          >
            <div 
              className="w-2.5 h-2.5 rounded-full -mt-1 shadow-sm animate-pulse"
              style={{
                background: currentFace.color,
                boxShadow: `0 0 8px ${currentFace.color}`,
              }}
            />
          </div>

          {/* Left Magnetic Ear */}
          <div 
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-4 rounded-l-full border border-[#5f5e5e]/40 shadow-sm"
            style={{ background: '#25272a' }}
          />
          {/* Right Magnetic Ear */}
          <div 
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-4 rounded-r-full border border-[#5f5e5e]/40 shadow-sm"
            style={{ background: '#25272a' }}
          />

          {/* Main Oval Pod Body */}
          <div 
            className="w-full h-full rounded-[48%_48%_44%_44%] border-2 border-[#5f5e5e]/40 shadow-[3px_4px_0px_#006d41,0_8px_20px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center p-1.5 relative overflow-hidden transition-all"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #e6e4dc)',
            }}
          >
            {/* Glossy highlight streak on forehead */}
            <div 
              className="absolute top-1.5 left-3 w-8 h-3 rounded-full opacity-60 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.9), transparent)',
              }}
            />

            {/* Oval Glass Face Screen (Visor) */}
            <div 
              className="w-11 h-9 rounded-[40%_40%_36%_36%] bg-[#0f1115] border border-[#5f5e5e]/30 flex flex-col items-center justify-center relative shadow-inner overflow-hidden"
            >
              {/* Visor scanline reflection */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,249,155,0.2) 2px, rgba(0,249,155,0.2) 4px)',
                }}
              />

              {/* Expressive Cute LED Face */}
              <div 
                className="flex items-center justify-center gap-1.5 font-bold tracking-tighter text-xs select-none transition-all"
                style={{
                  color: currentFace.color,
                  textShadow: `0 0 6px ${currentFace.color}`,
                }}
              >
                <span className="text-sm leading-none">{currentFace.leftEye}</span>
                <span className="text-[10px] leading-none mb-0.5">{currentFace.mouth}</span>
                <span className="text-sm leading-none">{currentFace.rightEye}</span>
              </div>
            </div>

            {/* Cute Rosy Cheek Blushes */}
            <div className="flex justify-between w-9 px-1 mt-0.5 opacity-60">
              <div className="w-1.5 h-1 rounded-full bg-pink-400" />
              <div className="w-1.5 h-1 rounded-full bg-pink-400" />
            </div>
          </div>
        </div>

        {/* Speech Bubble */}
        <div 
          className="absolute bottom-[calc(100%+14px)] left-0 sm:left-1/2 -translate-x-0 sm:-translate-x-1/2 transition-all duration-300 pointer-events-none z-50 min-w-[200px] max-w-[260px] sm:max-w-[340px]"
          style={{
            opacity: showGreet ? 1 : 0,
            transform: showGreet ? 'translate(0, 0) scale(1)' : 'translate(0, 8px) scale(0.9)',
          }}
        >
          <div 
            className="bg-[#121417] text-[#00f99b] border-2 border-[#00f99b] shadow-[3px_3px_0px_#006d41] px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold tracking-wide flex flex-col gap-1 leading-snug whitespace-normal"
          >
            <span>{greetText}</span>
          </div>
          {/* Caret pointer */}
          <div 
            className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-[#00f99b] ml-6 sm:mx-auto mt-[-1px]"
          />
        </div>
      </aside>

      {/* Cute Floating Keyframes */}
      <style>{`
        @keyframes rbot-float-anim {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(1.5deg);
          }
        }
        .rbot-float {
          animation: rbot-float-anim 3.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
