import React, { useState, useEffect } from "react";
import { Flame, Trophy } from "lucide-react";

export function StreakCards({ summary = {}, loading = false }) {
  const { currentStreak = 0, longestStreak = 0 } = summary;
  const [highlightPulse, setHighlightPulse] = useState(false);

  useEffect(() => {
    if (currentStreak > 0) {
      setHighlightPulse(true);
      const timer = setTimeout(() => setHighlightPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="h-24 rounded-2xl bg-gray-100 dark:bg-white/[0.03] animate-pulse border border-gray-200/50 dark:border-white/5" />
        <div className="h-24 rounded-2xl bg-gray-100 dark:bg-white/[0.03] animate-pulse border border-gray-200/50 dark:border-white/5" />
      </div>
    );
  }

  const isBurning = currentStreak > 0;

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {/* 1. Current Streak Card */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
          isBurning
            ? "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-orange-500/30 dark:border-orange-500/40"
            : "bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10"
        } ${highlightPulse ? "ring-2 ring-orange-500 scale-[1.02]" : ""}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Current Streak
          </span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isBurning
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30 animate-pulse"
                : "bg-gray-100 dark:bg-white/5 text-gray-400"
            }`}
          >
            <Flame size={15} className={isBurning ? "fill-white" : ""} />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {currentStreak}
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {currentStreak === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      {/* 2. Best Streak Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Best Streak
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Trophy size={15} />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {longestStreak}
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {longestStreak === 1 ? "day" : "days"}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          Personal all-time best
        </p>
      </div>
    </div>
  );
}

export default StreakCards;

