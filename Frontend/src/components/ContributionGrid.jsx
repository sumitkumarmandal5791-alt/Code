import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, RefreshCw, AlertCircle, Activity } from "lucide-react";
import useActivity from "../hooks/useActivity";
import StreakWidget from "./StreakWidget";

// 5 Intensity thresholds: 0, 1, 2-3, 4-5, 6+
export const INTENSITY_THRESHOLDS = [0, 1, 2, 4, 6];

export const getIntensityLevel = (count) => {
  if (!count || count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

// CSS classes for 5 intensity levels supporting dark and light themes
export const INTENSITY_CLASSES = {
  0: "bg-slate-100 dark:bg-[#1f1f1f] border-slate-200/50 dark:border-white/5",
  1: "bg-emerald-200 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800",
  2: "bg-emerald-400 dark:bg-emerald-700/80 border-emerald-500 dark:border-emerald-600",
  3: "bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400",
  4: "bg-emerald-800 dark:bg-emerald-400 border-emerald-900 dark:border-emerald-300",
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function ContributionGrid({
  hideStreakWidget = false,
  showCustomHeader = false,
  footerNote = "Streaks reset at midnight Asia/Kolkata (IST). Includes all first-time accepted submissions.",
  onSummaryChange = null,
  className = "",
}) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(null); // null = last 365 days
  const [hoveredDay, setHoveredDay] = useState(null);

  const {
    heatmap,
    summary,
    loading,
    error,
    recentlyUpdatedDate,
    refetch,
  } = useActivity(selectedYear);

  // Sync summary with parent component if callback provided
  useEffect(() => {
    if (onSummaryChange && summary) {
      onSummaryChange(summary);
    }
  }, [summary, onSummaryChange]);

  // Total submissions in selected period
  const totalPeriodSubmissions = useMemo(() => {
    return heatmap.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [heatmap]);

  // Map quick lookup: 'YYYY-MM-DD' -> count
  const countMap = useMemo(() => {
    const map = new Map();
    heatmap.forEach((item) => {
      map.set(item.date, item.count);
    });
    return map;
  }, [heatmap]);

  // Generate 53 weeks (Sunday-indexed) for selected year or trailing 365 days
  const { weeks, monthHeaders } = useMemo(() => {
    let startDate;
    let endDate;

    if (selectedYear) {
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 364);
    }

    // Align start date back to the preceding Sunday
    const startSunday = new Date(startDate);
    startSunday.setDate(startDate.getDate() - startDate.getDay());

    const generatedWeeks = [];
    const generatedMonthHeaders = [];
    let currentDayIter = new Date(startSunday);
    let lastMonth = -1;
    let weekIndex = 0;

    while (currentDayIter <= endDate || currentDayIter.getDay() !== 0) {
      const week = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const y = currentDayIter.getFullYear();
        const m = String(currentDayIter.getMonth() + 1).padStart(2, "0");
        const d = String(currentDayIter.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;

        const isWithinRange = currentDayIter >= startDate && currentDayIter <= endDate;
        const count = isWithinRange ? countMap.get(dateStr) || 0 : 0;

        week.push({
          date: dateStr,
          rawDate: new Date(currentDayIter),
          count,
          level: getIntensityLevel(count),
          isWithinRange,
        });

        // Track month label placements
        if (dayOfWeek === 0) {
          const monthNumber = currentDayIter.getMonth();
          if (monthNumber !== lastMonth && isWithinRange) {
            generatedMonthHeaders.push({
              weekIndex,
              monthName: MONTH_NAMES[monthNumber],
            });
            lastMonth = monthNumber;
          }
        }

        currentDayIter.setDate(currentDayIter.getDate() + 1);
      }

      generatedWeeks.push(week);
      weekIndex++;
    }

    return { weeks: generatedWeeks, monthHeaders: generatedMonthHeaders };
  }, [selectedYear, countMap]);

  const formatDateTooltip = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split("-");
      const d = new Date(year, parseInt(month, 10) - 1, day);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Top Streak Metric Widgets (Optional) */}
      {!hideStreakWidget && <StreakWidget summary={summary} loading={loading} />}

      {/* Main Heatmap Container */}
      <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
        {/* Heatmap Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          {showCustomHeader ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>
                    {totalPeriodSubmissions} submission{totalPeriodSubmissions !== 1 ? "s" : ""} in{" "}
                    {selectedYear || "the last year"}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Live Sync
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Calculated in Asia/Kolkata (IST) timezone
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Activity &amp; Submissions</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Live Sync
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                LeetCode-style daily problem activity calculated in Asia/Kolkata timezone
              </p>
            </div>
          )}

          {/* Stats on the right + Year dropdown selector */}
          <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
            {showCustomHeader && (
              <div className="hidden md:flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
                <div>
                  Active days:{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {summary.totalActiveDays || 0}
                  </strong>
                </div>
                <span>•</span>
                <div>
                  Current streak:{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {summary.currentStreak || 0}
                  </strong>
                </div>
                <span>•</span>
                <div>
                  Max streak:{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {summary.longestStreak || 0}
                  </strong>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              title="Refresh heatmap"
              aria-label="Refresh activity heatmap"
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>

            <div className="relative">
              <select
                value={selectedYear || "trailing"}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedYear(val === "trailing" ? null : parseInt(val, 10));
                }}
                className="appearance-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-xs font-bold py-1.5 pl-3 pr-7 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
              >
                <option value="trailing">Last 365 Days</option>
                <option value={currentYear}>{currentYear}</option>
                <option value={currentYear - 1}>{currentYear - 1}</option>
                <option value={currentYear - 2}>{currentYear - 2}</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Heatmap Grid */}
        <div className="relative overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-[760px] select-none">
            {/* Month Labels Header Row */}
            <div className="flex text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1.5 h-4 pl-8 relative">
              {monthHeaders.map((header, idx) => (
                <span
                  key={idx}
                  style={{
                    position: "absolute",
                    left: `${header.weekIndex * 14.5 + 32}px`,
                  }}
                >
                  {header.monthName}
                </span>
              ))}
            </div>

            {/* Weeks & Days Matrix */}
            <div className="flex gap-[3.5px]">
              {/* Day-of-week labels on the left */}
              <div className="flex flex-col justify-between text-[9px] font-bold text-gray-400 dark:text-gray-500 pr-1.5 py-[1px] select-none">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* 53 Columns of Weeks */}
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3.5px]">
                  {week.map((day) => {
                    const isRecentlyUpdated = recentlyUpdatedDate === day.date;
                    const tooltipText =
                      day.count > 0
                        ? `${day.count} problem${day.count > 1 ? "s" : ""} solved on ${formatDateTooltip(day.date)}`
                        : `No problems solved on ${formatDateTooltip(day.date)}`;

                    if (!day.isWithinRange) {
                      return (
                        <div
                          key={day.date}
                          className="w-[11.5px] h-[11.5px] rounded-[3px] opacity-0"
                          aria-hidden="true"
                        />
                      );
                    }

                    return (
                      <div
                        key={day.date}
                        tabIndex={0}
                        role="gridcell"
                        aria-label={tooltipText}
                        onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-[11.5px] h-[11.5px] rounded-[3px] border transition-all duration-200 cursor-pointer ${
                          INTENSITY_CLASSES[day.level]
                        } ${
                          isRecentlyUpdated
                            ? "ring-4 ring-orange-500 scale-150 z-10 animate-pulse"
                            : "hover:scale-125 hover:z-10 hover:ring-2 hover:ring-gray-400"
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Footer: Hover Tooltip + Legend */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-white/5 text-xs">
          {/* Active Hover Tooltip Text */}
          <div className="text-gray-600 dark:text-gray-300 font-semibold min-h-[18px]">
            {hoveredDay ? (
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {hoveredDay.count} problem{hoveredDay.count !== 1 ? "s" : ""}
                </strong>{" "}
                solved on {formatDateTooltip(hoveredDay.date)}
              </span>
            ) : (
              <span className="text-gray-400">Hover over a cell to view problem count</span>
            )}
          </div>

          {/* 5-Level Intensity Legend */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 select-none">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-[3px] border ${INTENSITY_CLASSES[level]}`}
                title={`Level ${level}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Footer Note */}
        {footerNote && (
          <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
            {footerNote}
          </p>
        )}
      </div>
    </div>
  );
}

export default ContributionGrid;
