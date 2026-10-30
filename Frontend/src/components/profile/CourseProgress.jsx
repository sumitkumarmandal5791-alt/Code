import React, { useState } from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import CourseCard from "./CourseCard";

export function CourseProgress({ courses = [], loading = false }) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="h-6 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-gray-100 dark:bg-white/[0.03] animate-pulse border border-gray-200/50 dark:border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  const initialCount = 3;
  const visibleCourses = expanded ? courses : courses.slice(0, initialCount);
  const hiddenCount = Math.max(0, courses.length - initialCount);

  return (
    <div className="w-full space-y-5">
      {/* Centered Heading */}
      <div className="text-center pt-2">
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          Your Progress
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Track your learning journey and mastery
        </p>
      </div>

      {/* Courses Section Divider & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <Layers size={14} className="text-emerald-500" />
          <span>Courses</span>
        </div>
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {visibleCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* "Show N more" / "Show less" Expander Button */}
      {courses.length > initialCount && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 hover:border-emerald-500/30 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {expanded ? (
              <>
                <span>Show less</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>Show {hiddenCount} more</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default CourseProgress;

