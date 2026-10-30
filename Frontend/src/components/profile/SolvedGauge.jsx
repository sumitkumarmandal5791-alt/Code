import React, { useMemo } from "react";

export function SolvedGauge({ stats = {}, loading = false }) {
  const {
    counts = {
      easy: { solved: 0, total: 843 },
      medium: { solved: 0, total: 1762 },
      hard: { solved: 0, total: 768 },
    },
    totalSolved = 0,
    totalProblems = 3373,
  } = stats;

  const easySolved = counts.easy?.solved || 0;
  const easyTotal = counts.easy?.total || 843;
  const mediumSolved = counts.medium?.solved || 0;
  const mediumTotal = counts.medium?.total || 1762;
  const hardSolved = counts.hard?.solved || 0;
  const hardTotal = counts.hard?.total || 768;

  // SVG Gauge calculations
  // Radius = 54, Circumference = 2 * PI * 54 = 339.292
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const { easyDash, mediumDash, hardDash, mediumOffset, hardOffset } = useMemo(() => {
    const safeTotal = Math.max(totalProblems, 1);
    const easyFrac = easySolved / safeTotal;
    const mediumFrac = mediumSolved / safeTotal;
    const hardFrac = hardSolved / safeTotal;

    const easyLen = easyFrac * CIRCUMFERENCE;
    const mediumLen = mediumFrac * CIRCUMFERENCE;
    const hardLen = hardFrac * CIRCUMFERENCE;

    return {
      easyDash: `${easyLen} ${CIRCUMFERENCE - easyLen}`,
      mediumDash: `${mediumLen} ${CIRCUMFERENCE - mediumLen}`,
      hardDash: `${hardLen} ${CIRCUMFERENCE - hardLen}`,
      mediumOffset: -easyLen,
      hardOffset: -(easyLen + mediumLen),
    };
  }, [easySolved, mediumSolved, hardSolved, totalProblems, CIRCUMFERENCE]);

  if (loading) {
    return (
      <div className="w-full h-44 rounded-2xl bg-gray-100 dark:bg-white/[0.03] animate-pulse border border-gray-200/50 dark:border-white/5" />
    );
  }

  const ariaSummary = `Solved ${totalSolved} out of ${totalProblems} problems. Easy: ${easySolved} of ${easyTotal}, Medium: ${mediumSolved} of ${mediumTotal}, Hard: ${hardSolved} of ${hardTotal}.`;

  return (
    <div
      className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm transition-all"
      aria-label={ariaSummary}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
          All Problems
        </h3>
        <span className="text-xs text-gray-400">
          {Math.round((totalSolved / Math.max(totalProblems, 1)) * 100)}% Completed
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Left: Difficulty Breakdown Rows */}
        <div className="flex-1 space-y-3">
          {/* Easy */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-emerald-500">Easy</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                <span className="font-bold text-gray-900 dark:text-white">{easySolved}</span>
                <span className="text-gray-400 text-[11px]">/{easyTotal}</span>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, (easySolved / Math.max(easyTotal, 1)) * 100)}%`,
                }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              />
            </div>
          </div>

          {/* Medium */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-amber-500">Medium</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                <span className="font-bold text-gray-900 dark:text-white">{mediumSolved}</span>
                <span className="text-gray-400 text-[11px]">/{mediumTotal}</span>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, (mediumSolved / Math.max(mediumTotal, 1)) * 100)}%`,
                }}
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
              />
            </div>
          </div>

          {/* Hard */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-rose-500">Hard</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                <span className="font-bold text-gray-900 dark:text-white">{hardSolved}</span>
                <span className="text-gray-400 text-[11px]">/{hardTotal}</span>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, (hardSolved / Math.max(hardTotal, 1)) * 100)}%`,
                }}
                className="h-full bg-rose-500 rounded-full transition-all duration-700"
              />
            </div>
          </div>
        </div>

        {/* Right: Circular Donut Gauge */}
        <div className="relative flex items-center justify-center flex-shrink-0 w-32 h-32">
          <svg
            className="w-full h-full -rotate-90 transform"
            viewBox="0 0 130 130"
            role="img"
            aria-hidden="true"
          >
            {/* Background Track */}
            <circle
              cx="65"
              cy="65"
              r={RADIUS}
              className="stroke-gray-100 dark:stroke-white/5"
              strokeWidth="9"
              fill="transparent"
            />

            {/* Easy Segment */}
            {easySolved > 0 && (
              <circle
                cx="65"
                cy="65"
                r={RADIUS}
                stroke="#10b981"
                strokeWidth="9"
                strokeDasharray={easyDash}
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Medium Segment */}
            {mediumSolved > 0 && (
              <circle
                cx="65"
                cy="65"
                r={RADIUS}
                stroke="#f59e0b"
                strokeWidth="9"
                strokeDasharray={mediumDash}
                strokeDashoffset={mediumOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Hard Segment */}
            {hardSolved > 0 && (
              <circle
                cx="65"
                cy="65"
                r={RADIUS}
                stroke="#ef4444"
                strokeWidth="9"
                strokeDasharray={hardDash}
                strokeDashoffset={hardOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            )}
          </svg>

          {/* Centered Total Numbers */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
              {totalSolved}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
              /{totalProblems}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mt-0.5">
              Solved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SolvedGauge;

