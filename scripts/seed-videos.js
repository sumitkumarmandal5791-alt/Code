/**
 * Root convenience runner for seeding video solutions
 * Usage: node scripts/seed-videos.js
 */
const { seedVideos } = require("../Backend/src/scripts/seed-videos");

seedVideos().catch((err) => {
  console.error("❌ Error running seed script:", err);
  process.exit(1);
});

