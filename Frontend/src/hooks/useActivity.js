import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import axiosClient from "../utils/axios";
import { useSocket, useSocketStatus } from "../context/SocketContext";

export const useActivity = (year = null) => {
  const socket = useSocket();
  const { reconnectEvent } = useSocketStatus();

  const [heatmap, setHeatmap] = useState([]);
  const [summary, setSummary] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalSolved: 0,
    totalActiveDays: 0,
    lastActiveDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentlyUpdatedDate, setRecentlyUpdatedDate] = useState(null);

  const prevStreakRef = useRef(0);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = year ? `/api/activity/heatmap?year=${year}` : "/api/activity/heatmap";
      const response = await axiosClient.get(url);

      const data = response.data;
      setHeatmap(data.heatmap || []);
      if (data.summary) {
        setSummary(data.summary);
        prevStreakRef.current = data.summary.currentStreak || 0;
      }
    } catch (err) {
      console.error("[useActivity] Fetch error:", err);
      setError(err.response?.data?.error || err.message || "Failed to load activity heatmap");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // On socket reconnect, refetch to prevent missing events
  useEffect(() => {
    if (reconnectEvent > 0) {
      console.log("[useActivity] Socket reconnected. Refetching heatmap...");
      fetchActivity();
    }
  }, [reconnectEvent, fetchActivity]);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleActivityUpdate = (payload) => {
      console.log("[useActivity] Real-time activity:update received:", payload);
      const { date, solvedCount, currentStreak, longestStreak, totalSolved, totalActiveDays } = payload;

      // 1. Update heatmap state atomically without full refetch
      setHeatmap((prev) => {
        const index = prev.findIndex((item) => item.date === date);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { date, count: solvedCount };
          return updated;
        } else {
          return [...prev, { date, count: solvedCount }].sort((a, b) =>
            a.date.localeCompare(b.date)
          );
        }
      });

      // 2. Trigger cell highlight animation
      setRecentlyUpdatedDate(date);
      setTimeout(() => setRecentlyUpdatedDate(null), 3000);

      // 3. Update summary metrics
      setSummary((prev) => ({
        ...prev,
        currentStreak: currentStreak ?? prev.currentStreak,
        longestStreak: longestStreak ?? prev.longestStreak,
        totalSolved: totalSolved ?? prev.totalSolved,
        totalActiveDays: totalActiveDays ?? prev.totalActiveDays,
        lastActiveDate: date,
      }));

      // 4. Toast notification on streak increase
      if (currentStreak > prevStreakRef.current) {
        toast.success(`🔥 Streak extended: ${currentStreak} day${currentStreak > 1 ? "s" : ""}!`, {
          duration: 4000,
        });
      } else {
        toast.success("Problem Accepted! Activity updated live.", {
          icon: "🚀",
          duration: 3000,
        });
      }
      prevStreakRef.current = currentStreak;
    };

    const handleStreakReset = (payload) => {
      console.log("[useActivity] Real-time streak:reset received:", payload);
      setSummary((prev) => ({
        ...prev,
        currentStreak: 0,
      }));
      prevStreakRef.current = 0;
    };

    socket.on("activity:update", handleActivityUpdate);
    socket.on("streak:reset", handleStreakReset);

    // Backward-compat for existing activityUpdated
    socket.on("activityUpdated", fetchActivity);

    return () => {
      socket.off("activity:update", handleActivityUpdate);
      socket.off("streak:reset", handleStreakReset);
      socket.off("activityUpdated", fetchActivity);
    };
  }, [socket, fetchActivity]);

  return {
    heatmap,
    summary,
    loading,
    error,
    recentlyUpdatedDate,
    refetch: fetchActivity,
  };
};

export default useActivity;

