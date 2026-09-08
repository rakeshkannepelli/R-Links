import React from 'react';
import { grid } from 'ldrs';

// Register UI Ball grid web component once
if (typeof window !== 'undefined') {
  grid.register();
}

export default function SmoothLoader({ 
  message = 'INITIALIZING SYSTEM NODE...', 
  subtext = 'Validating neural credentials and link vault index' 
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0f11]/90 backdrop-blur-xl text-[#fbf9f0] select-none page-enter transition-opacity duration-300">
      {/* 3D Core Loader Container */}
      <div className="relative flex flex-col items-center justify-center mb-8">
        {/* Ambient Glow behind Grid */}
        <div className="absolute -inset-6 bg-[#00f99b]/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
        
        {/* UI Ball LDRS Grid Web Component */}
        <div className="relative z-10 flex items-center justify-center p-4 rounded-2xl bg-[#141820]/80 border border-[#00f99b]/30 shadow-[0_0_30px_rgba(0,249,155,0.2)]">
          <l-grid
            size="64"
            speed="1.4"
            color="#00f99b"
          ></l-grid>
        </div>
      </div>

      {/* Cyber Telemetry Status */}
      <div className="flex flex-col items-center text-center space-y-2.5 px-4 max-w-sm relative z-10">
        <div className="flex items-center gap-2 bg-[#00f99b]/10 border border-[#00f99b]/30 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#00f99b] animate-ping" />
          <span className="font-['Space_Grotesk'] text-xs tracking-[0.2em] font-black uppercase text-[#00f99b]">
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
