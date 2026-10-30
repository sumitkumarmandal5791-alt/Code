import React, { useState } from "react";
import { Award, HelpCircle, X } from "lucide-react";

export function RankCard({ ranking = {}, loading = false }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    percentile = "Top 99.9%",
    totalSolved = 0,
    distribution = [],
    explanation = "Your percentile ranking is dynamically determined against all active CodeBits users using accepted first-time problem submissions and difficulty multipliers.",
  } = ranking;

  if (loading) {
    return (
      <div className="w-full h-32 rounded-2xl bg-gray-100 dark:bg-white/[0.03] animate-pulse border border-gray-200/50 dark:border-white/5" />
    );
  }

  // Find maximum users in buckets to scale distribution chart heights
  const maxBucketCount = Math.max(...distribution.map((d) => d.users), 500);

  return (
    <div className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm relative transition-all">
      {/* Top Header: Percentile & Total Solved */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                {percentile}
              </span>
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                aria-label="How is this calculated?"
                title="How is this calculated?"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <HelpCircle size={14} />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">Global Standing</p>
          </div>
        </div>

        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
          {totalSolved} solved
        </span>
      </div>

      {/* Mini Distribution Chart */}
      <div className="mt-2">
        <div className="flex items-end justify-between gap-1.5 h-16 pt-2 pb-1 border-b border-gray-100 dark:border-white/5">
          {distribution.map((item, idx) => {
            const heightPercent = Math.max(15, Math.round((item.users / maxBucketCount) * 100));
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Bucket bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    item.isUserBucket
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/30 ring-1 ring-emerald-400"
                      : "bg-gray-200 dark:bg-white/10 group-hover:bg-gray-300 dark:group-hover:bg-white/20"
                  }`}
                />

                {/* Hover bubble */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 text-white text-[9px] font-semibold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md z-10">
                  {item.range} ({item.users})
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5 px-0.5">
          <span>0</span>
          <span className="text-emerald-500 font-semibold">Your rank tier</span>
          <span>200+</span>
        </div>
      </div>

      {/* How is this calculated Tooltip/Modal */}
      {showTooltip && (
        <div className="absolute inset-x-4 top-14 p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/15 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Award size={14} className="text-amber-500" />
              <span>How Ranking is Calculated</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
            >
              <X size={13} />
            </button>
          </div>
          <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
            {explanation}
          </p>
          <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/5 flex justify-end">
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RankCard;

