import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";

export function ContributionGrid() {
  const socket = useSocket();
  const reduxUser = useSelector((state) => state.auth?.user || state.slicers?.user);

  // Initialize state with user's daily submissions from DB
  const [dailySubmissions, setDailySubmissions] = useState({});
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    if (reduxUser) {
      setDailySubmissions(reduxUser.dailySubmissions || {});
      setStreakData(reduxUser.streak || { currentStreak: 0, longestStreak: 0 });
    }
  }, [reduxUser]);

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return;

    const handleActivityUpdate = (data) => {
      console.log("Real-time activity update received:", data);
      if (data.dailySubmissions) {
        setDailySubmissions(data.dailySubmissions);
      }
      if (data.streak) {
        setStreakData(data.streak);
      }
    };

    socket.on("activityUpdated", handleActivityUpdate);

    return () => {
      socket.off("activityUpdated", handleActivityUpdate);
    };
  }, [socket]);

  // Generate 365 calendar dates ending today
  const { dates, padding } = useMemo(() => {
    const tempDates = [];
    const today = new Date();
    
    // We go back 364 days to get 365 total days including today
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      tempDates.push(`${y}-${m}-${day}`);
    }

    // Calculate padding for first day of the week
    const firstDate = new Date(tempDates[0]);
    const startPadding = firstDate.getDay(); // 0 = Sunday, 1 = Monday etc.
    
    return { dates: tempDates, padding: startPadding };
  }, []);

  // Determine styling based on submission count
  const getColorClass = (count) => {
    if (!count || count === 0) return "bg-[#161b22] hover:bg-[#30363d]"; // dark grey
    if (count <= 2) return "bg-[#0e4429] hover:bg-[#0f5331]";           // dark green
    if (count <= 5) return "bg-[#006d32] hover:bg-[#00833c]";           // medium green
    if (count <= 8) return "bg-[#26a641] hover:bg-[#2cbe4b]";           // light green
    return "bg-[#39d353] hover:bg-[#47e061]";                           // brightest neon green
  };

  // Helper to format date label
  const formatDateLabel = (dateStr) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Calculate total submissions in the past year
  const totalSubmissions = useMemo(() => {
    return Object.values(dailySubmissions).reduce((sum, val) => sum + (val || 0), 0);
  }, [dailySubmissions]);

  // Count active days
  const activeDays = useMemo(() => {
    return Object.values(dailySubmissions).filter(val => val > 0).length;
  }, [dailySubmissions]);

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-6 text-gray-200 font-sans shadow-xl max-w-5xl mx-auto my-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#30363d] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{totalSubmissions.toLocaleString()}</span> submissions in the past year
          </h2>
          <p className="text-sm text-gray-400 mt-1">Real-time update active</p>
        </div>
        <div className="flex gap-6 text-sm text-gray-300">
          <div className="bg-[#161b22] px-4 py-2 rounded-xl border border-[#30363d]">
            <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Total Active Days</span>
            <span className="text-lg font-bold text-[#58a6ff]">{activeDays} days</span>
          </div>
          <div className="bg-[#161b22] px-4 py-2 rounded-xl border border-[#30363d]">
            <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Max Streak</span>
            <span className="text-lg font-bold text-[#ff9e22]">{streakData.longestStreak} days</span>
          </div>
          <div className="bg-[#161b22] px-4 py-2 rounded-xl border border-[#30363d] flex items-center gap-2">
            <div>
              <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold">Current Streak</span>
              <span className="text-lg font-bold text-[#ff5b5b]">{streakData.currentStreak} days</span>
            </div>
            <span className={`text-2xl ${streakData.currentStreak > 0 ? "animate-pulse" : "opacity-40"}`}>🔥</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-800">
        <div className="min-w-[760px] flex flex-col justify-center">
          
          {/* Heatmap Grid */}
          <div 
            className="grid grid-rows-7 grid-flow-col gap-[3px] select-none"
            style={{ gridAutoColumns: "10px" }}
          >
            {/* Pad the first week if the calendar starts mid-week */}
            {Array.from({ length: padding }).map((_, idx) => (
              <div key={`pad-${idx}`} className="w-[10px] h-[10px] bg-transparent" />
            ))}

            {/* Render actual day squares */}
            {dates.map((date) => {
              const count = dailySubmissions[date] || 0;
              return (
                <div
                  key={date}
                  className={`w-[10px] h-[10px] rounded-[2px] transition-all duration-300 transform hover:scale-125 cursor-pointer relative group ${getColorClass(count)}`}
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#21262d] text-xs text-white px-2 py-1.5 rounded-md border border-[#30363d] shadow-lg whitespace-nowrap z-50">
                    <span className="font-semibold">{count} submission{count !== 1 ? "s" : ""}</span> on {formatDateLabel(date)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Month labels below the grid */}
          <div className="flex justify-between text-xs text-gray-400 mt-3 px-1">
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>
      </div>

      {/* Grid Legend */}
      <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-400">
        <span>Less</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22]" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[#0e4429]" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[#006d32]" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[#26a641]" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[#39d353]" />
        <span>More</span>
      </div>
    </div>
  );
}
