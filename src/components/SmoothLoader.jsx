import React from 'react';
import Chain from './Chain';

export default function SmoothLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0f11]/90 backdrop-blur-xl select-none page-enter transition-opacity duration-300">
      {/* Centered Chain Animation with Ambient Glow */}
      <div className="relative flex items-center justify-center">
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
      </div>
    </div>
  );
}
