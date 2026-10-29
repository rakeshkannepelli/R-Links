import React from 'react';
import Chain from './Chain';

export default function SmoothLoader({
  message = 'VALIDATING SESSION...',
  subtext = 'Connecting to neural security grid'
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0f11]/90 backdrop-blur-xl select-none page-enter transition-opacity duration-300">
      {/* Centered Chain Animation with Ambient Glow */}
      <div className="relative flex flex-col items-center justify-center gap-6 px-4">
        {/* Ambient Glow */}
        <div className="absolute -inset-8 bg-[#00f99b]/20 rounded-full blur-2xl pointer-events-none animate-pulse" />

        {/* Sleek LDRS-Fitted Card */}
        <div className="relative z-10 flex items-center justify-center p-5 rounded-2xl bg-[#141820]/90 border border-[#00f99b]/30 shadow-[0_0_30px_rgba(0,249,155,0.25)]">
          <Chain
            size={94}
            color="#00f99b"
            speed={1.2}
            stroke={5}
            bgOpacity={0.15}
          />
        </div>

        {/* Status Text Block */}
        {(message || subtext) && (
          <div className="relative z-10 text-center space-y-1">
            {message && (
              <p className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#00f99b] uppercase">
                {message}
              </p>
            )}
            {subtext && (
              <p className="font-mono text-[10px] sm:text-xs text-[#5f5e5e] tracking-wider uppercase">
                {subtext}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
