import React from 'react';

export default function SmoothLoader({ message = 'INITIALIZING SYSTEM NODE...', subtext = 'Validating neural credentials' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0f11]/90 backdrop-blur-md text-[#fbf9f0] select-none">
      {/* 3D Core Loader */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-8">
        {/* Outer pulsating orbit */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00f99b]/30 animate-[spin_8s_linear_infinite]" />
        
        {/* Counter-rotating glowing ring */}
        <div className="absolute inset-2 rounded-full border-2 border-t-[#00f99b] border-r-transparent border-b-[#006d41] border-l-transparent animate-[spin_2s_linear_infinite]" />
        
        {/* 3D Isometric Diamond Core */}
        <div className="relative w-12 h-12 bg-gradient-to-br from-[#00f99b] to-[#006d41] shadow-[0_0_25px_rgba(0,249,155,0.6)] rotate-45 flex items-center justify-center animate-pulse border border-[#ffffff]/40">
          <div className="w-5 h-5 bg-[#0d0f11] rotate-45 shadow-inner" />
        </div>

        {/* Ambient Glow */}
        <div className="absolute -inset-4 bg-[#00f99b]/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Cyber Telemetry Status */}
      <div className="flex flex-col items-center text-center space-y-2 px-4 max-w-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f99b] animate-ping" />
          <span className="font-['Space_Grotesk'] text-sm tracking-[0.25em] font-black uppercase text-[#00f99b]">
            {message}
          </span>
        </div>
        
        <p className="text-[11px] font-mono text-[#a0a09a] tracking-wider uppercase">
          {subtext}
        </p>

        {/* Smooth 3D Progress Bar */}
        <div className="w-48 h-1.5 bg-[#1b1d20] rounded-full overflow-hidden border border-[#ffffff]/10 mt-3 relative shadow-inner">
          <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#006d41] via-[#00f99b] to-[#006d41] w-full animate-[progress_1.6s_ease-in-out_infinite] rounded-full" />
        </div>
      </div>
    </div>
  );
}
