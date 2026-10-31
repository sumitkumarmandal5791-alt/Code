/**
 * Robust YouTube URL parser using standard URL and URLSearchParams API.
 * Parses YouTube watch URLs, short URLs (youtu.be), embeds, and timestamps.
 *
 * @param {string} url - YouTube URL to parse
 * @returns {{ videoId: string, startTime: number } | null}
 */
function parseYoutubeUrl(url) {
  if (!url || typeof url !== "string") return null;

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  let videoId = null;

  if (host === "youtu.be" || host.endsWith(".youtu.be")) {
    const pathParts = parsed.pathname.replace(/^\/+/, "").split("/");
    videoId = pathParts[0] || null;
  } else if (
    host === "youtube.com" ||
    host.endsWith(".youtube.com")
  ) {
    if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || null;
    } else if (parsed.pathname.startsWith("/v/")) {
      videoId = parsed.pathname.split("/v/")[1]?.split("/")[0] || null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || null;
    } else {
      videoId = parsed.searchParams.get("v");
    }
  }

  if (!videoId || typeof videoId !== "string" || !videoId.trim()) {
    return null;
  }

  videoId = videoId.trim();

  // Parse timestamp (supports ?t=14286s, ?t=14286, ?start=120, or compound 1h20m30s)
  const rawTime = parsed.searchParams.get("t") || parsed.searchParams.get("start");
  let startTime = 0;

  if (rawTime) {
    const cleanedTime = rawTime.trim().toLowerCase();
    if (/^\d+s?$/.test(cleanedTime)) {
      startTime = parseInt(cleanedTime.replace(/s$/, ""), 10);
    } else {
      let totalSeconds = 0;
      const hours = cleanedTime.match(/(\d+)h/);
      const minutes = cleanedTime.match(/(\d+)m/);
      const seconds = cleanedTime.match(/(\d+)s/);
      if (hours) totalSeconds += parseInt(hours[1], 10) * 3600;
      if (minutes) totalSeconds += parseInt(minutes[1], 10) * 60;
      if (seconds) totalSeconds += parseInt(seconds[1], 10);
      startTime = totalSeconds;
    }
  }

  if (isNaN(startTime) || startTime < 0) {
    startTime = 0;
  }

  return {
    videoId,
    startTime,
  };
}

module.exports = {
  parseYoutubeUrl,
};

