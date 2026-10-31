import React, { useState } from "react";
import { Play, ExternalLink, VideoOff, Youtube, Clock } from "lucide-react";

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
function formatTimestamp(seconds) {
  if (!seconds || seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Lazy-loading Video Solution component with official YouTube iframe embed.
 * Shows high-resolution thumbnail with play button until clicked.
 */
export function VideoSolution({
  videoId,
  startTime = 0,
  originalUrl,
  channel = "takeUforward",
  video, // supports passing either individual props or a video object
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract from video object if provided
  const vId = videoId || video?.videoId;
  const start = startTime ?? video?.startTime ?? 0;
  const origUrl =
    originalUrl ||
    video?.originalUrl ||
    (vId ? `https://www.youtube.com/watch?v=${vId}${start ? `&t=${start}s` : ""}` : "");
  const chName = channel || video?.channel || "takeUforward";

  // Empty state if no video available
  if (!vId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-4">
          <VideoOff size={28} />
        </div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
          No video available yet
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
          A video solution has not been attached for this problem yet. Check the reference solution or use the AI Tutor for guided hints.
        </p>
      </div>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${vId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${vId}?start=${start}&autoplay=1`;

  return (
    <div className="space-y-4 font-sans">
      {/* 16:9 Responsive Video / Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-gray-200/80 dark:border-white/10 shadow-lg group">
        {!isPlaying ? (
          <div
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center"
            title="Click to play video"
          >
            {/* Background Thumbnail Image */}
            <img
              src={thumbnailUrl}
              alt="Video solution thumbnail"
              className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
              loading="lazy"
            />

            {/* Gradient Overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 group-hover:from-black/60 transition-colors" />

            {/* Centered YouTube Play Button */}
            <div className="absolute flex flex-col items-center gap-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <Play size={32} className="fill-current ml-1" />
              </div>
              <span className="text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                Watch Video Solution
              </span>
            </div>

            {/* Timestamp Badge (if starting at specific point) */}
            {start > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-white font-mono text-[11px] font-semibold">
                <Clock size={12} className="text-red-400" />
                <span>Starts at {formatTimestamp(start)}</span>
              </div>
            )}
          </div>
        ) : (
          /* Official Lazy-Loaded YouTube Embed */
          <iframe
            src={embedUrl}
            title="YouTube video solution"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 rounded-2xl"
          />
        )}
      </div>

      {/* Attribution & Original Link Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 text-xs">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Youtube size={18} className="text-red-600 flex-shrink-0" />
          <span className="font-medium">
            Video by <strong className="text-gray-900 dark:text-white">Striver ({chName})</strong>
          </span>
        </div>

        {origUrl && (
          <a
            href={origUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline cursor-pointer"
          >
            <span>Watch on YouTube</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

export default VideoSolution;

