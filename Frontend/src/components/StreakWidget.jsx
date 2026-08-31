import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";

export function StreakWidget() {
  const socket = useSocket();
  const reduxUser = useSelector((state) => state.auth?.user || state.slicers?.user);

  const [streak, setStreak] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (reduxUser?.streak) {
      setStreak(reduxUser.streak.currentStreak || 0);
    }
  }, [reduxUser]);

  // Handle socket real-time events
  useEffect(() => {
    if (!socket) return;

    const handleActivityUpdate = (data) => {
      if (data.streak) {
        const newStreak = data.streak.currentStreak || 0;
        
        // Trigger particle animation if the streak increased or a new activity was logged
        if (newStreak > streak || (data.updatedCount > 0 && newStreak > 0)) {
          triggerCelebration();
        }
        setStreak(newStreak);
      }
    };

    socket.on("activityUpdated", handleActivityUpdate);

    return () => {
      socket.off("activityUpdated", handleActivityUpdate);
    };
  }, [socket, streak]);

  const triggerCelebration = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 2000);

    // Generate confetti-like particle effects
    const newParticles = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 10,
      size: Math.random() * 6 + 4,
      delay: Math.random() * 0.5,
      color: ["#ff3e3e", "#ff8a3d", "#ffd23d", "#4cd964"][Math.floor(Math.random() * 4)],
      angle: Math.random() * 360,
      distance: Math.random() * 40 + 20
    }));

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const isActive = streak > 0;

  return (
    <div className="relative flex items-center gap-2 bg-[#161b22] border border-[#30363d] px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:border-orange-500/50 hover:shadow-orange-950/20 hover:shadow-2xl select-none group">
      
      {/* Particle Effect Containers */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none animate-ping z-50"
          style={{
            left: `${p.left}%`,
            top: "20%",
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `translate(${Math.cos(p.angle) * p.distance}px, ${Math.sin(p.angle) * p.distance}px)`,
            transition: "transform 1.5s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1.5s ease",
            opacity: 0
          }}
        />
      ))}

      {/* Glowing animated flame */}
      <div className="relative flex items-center justify-center">
        {isActive && (
          <span className="absolute w-8 h-8 rounded-full bg-orange-600/30 blur-md animate-pulse" />
        )}
        
        <svg
          className={`w-6 h-6 transition-all duration-500 ${
            isActive 
              ? "text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-bounce" 
              : "text-gray-500 fill-gray-500 opacity-60"
          } ${animate ? "scale-150 rotate-12" : ""}`}
          viewBox="0 0 24 24"
        >
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        </svg>
      </div>

      {/* Streak Count Text */}
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Streak</span>
        <span className={`text-base font-black leading-none mt-0.5 transition-colors duration-300 ${
          isActive ? "text-orange-500" : "text-gray-400"
        }`}>
          {streak} {streak === 1 ? "day" : "days"}
        </span>
      </div>

      {/* Hover Information Box */}
      <div className="absolute top-full mt-2 right-0 hidden group-hover:block bg-[#21262d] text-xs text-gray-200 px-3 py-2 rounded-lg border border-[#30363d] shadow-2xl whitespace-nowrap z-50">
        {isActive ? (
          <p className="font-semibold text-orange-400">🔥 Your streak is active! Keep it up!</p>
        ) : (
          <p>Solve a problem today to ignite your streak!</p>
        )}
      </div>
    </div>
  );
}
