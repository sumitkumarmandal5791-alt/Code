import React, { useState, useEffect } from "react";
import { Flame, Trophy, CheckCircle2, Calendar, Sparkles } from "lucide-react";

export function StreakWidget({ summary = {}, loading = false }) {
  const {
    currentStreak = 0,
    longestStreak = 0,
    totalSolved = 0,
    totalActiveDays = 0,
    lastActiveDate = null,
  } = summary;

  const [celebrate, setCelebrate] = useState(false);

  // Trigger brief celebration animation when currentStreak changes upwards
  useEffect(() => {
    if (currentStreak > 0) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200/60 dark:border-slate-800"
          />
        ))}
      </div>
    );
  }

  const isStreakActive = currentStreak > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full mb-6">
      {/* 1. Current Streak Card */}
      <div
        className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 ${
          isStreakActive
            ? "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-orange-500/30 dark:border-orange-500/40 shadow-sm"
            : "bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Streak
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform ${
              isStreakActive
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/30 animate-bounce"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}
          >
            <Flame size={20} className={isStreakActive ? "fill-white" : ""} />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl sm:text-3xl font-black tracking-tight transition-transform duration-300 ${
              celebrate ? "scale-110 text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-white"
            }`}
          >
            {currentStreak}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {currentStreak === 1 ? "day" : "days"}
          </span>
        </div>

        {isStreakActive && (
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            <Sparkles size={11} />
            <span>Streak burning strong!</span>
          </div>
        )}
      </div>

      {/* 2. Longest Streak Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Longest Streak
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trophy size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {longestStreak}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {longestStreak === 1 ? "day" : "days"}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 block mt-1">Personal all-time best</span>
      </div>

      {/* 3. Total Solved Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Solved
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {totalSolved}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">problems</span>
        </div>
        <span className="text-[11px] text-slate-400 block mt-1">First-time solves only</span>
      </div>

      {/* 4. Active Days Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Days
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {totalActiveDays}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">days</span>
        </div>
        <span className="text-[11px] text-slate-400 block mt-1">
          {lastActiveDate ? `Last: ${lastActiveDate}` : "Start coding today!"}
        </span>
      </div>
    </div>
  );
}

export default StreakWidget;
