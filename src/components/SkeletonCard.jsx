import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-[#f0eee5]/80 border-2 border-[#5f5e5e]/20 p-4 rounded-xl shadow-[4px_4px_0px_#5f5e5e/10] relative overflow-hidden animate-pulse">
      {/* 3D Shimmer Overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      <div className="flex items-start gap-4">
        {/* Icon Skeleton */}
        <div className="w-12 h-12 rounded-2xl bg-[#e4e3da] border border-[#5f5e5e]/15 shrink-0 shadow-inner" />

        {/* Content Skeletons */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 bg-[#e4e3da] rounded-md w-3/5" />
            <div className="h-3 bg-[#e4e3da] rounded-full w-12" />
          </div>

          <div className="h-3 bg-[#e4e3da] rounded-md w-4/5 opacity-70" />

          <div className="flex items-center gap-2 pt-1">
            <div className="h-5 w-16 bg-[#e4e3da] rounded-lg" />
            <div className="h-5 w-20 bg-[#e4e3da] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
