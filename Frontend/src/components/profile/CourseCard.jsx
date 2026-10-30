import React from "react";
import { BookOpen, CheckCircle } from "lucide-react";

export function CourseCard({ course }) {
  const { category, title, total, solved, percentage } = course;
  const isComplete = solved >= total && total > 0;

  return (
    <div className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 hover:border-emerald-500/30 transition-all duration-200 group shadow-sm">
      <div>
        {/* Category Label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {category}
          </span>
          {isComplete && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <CheckCircle size={12} />
              <span>Completed</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
          {title}
        </h4>
      </div>

      <div className="mt-4">
        {/* Solved / Total Count & Percentage */}
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-gray-400">{percentage}% finished</span>
          <span className="text-gray-700 dark:text-gray-300 font-bold">
            <span className="text-gray-900 dark:text-white">{solved}</span>
            <span className="text-gray-400">/{total}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-emerald-500 to-teal-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default CourseCard;

