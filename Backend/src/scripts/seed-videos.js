const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from Backend/.env or current directory
const envPath = fs.existsSync(path.resolve(__dirname, "../../.env"))
  ? path.resolve(__dirname, "../../.env")
  : path.resolve(process.cwd(), ".env");

dotenv.config({ path: envPath });

const Problem = require("../Modles/problem");
const { parseYoutubeUrl } = require("../utils/youtubeParser");

/**
 * Normalizes title for robust comparison:
 * lowercase, trim, remove punctuation, collapse consecutive spaces.
 */
function normalizeTitle(title) {
  if (!title || typeof title !== "string") return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

async function seedVideos() {
  console.log("==========================================");
  console.log("       YouTube Video Solutions Seeder     ");
  console.log("==========================================");

  // 1. Locate data/video-solutions.json
  const possiblePaths = [
    path.resolve(process.cwd(), "data/video-solutions.json"),
    path.resolve(__dirname, "../../../data/video-solutions.json"),
    path.resolve(__dirname, "../../data/video-solutions.json"),
  ];

  let dataFilePath = possiblePaths.find((p) => fs.existsSync(p));

  if (!dataFilePath) {
    console.error("❌ Could not find data/video-solutions.json in any of:", possiblePaths);
    process.exit(1);
  }

  console.log(`📁 Reading data from: ${dataFilePath}`);
  const rawData = fs.readFileSync(dataFilePath, "utf8");
  const parsedData = JSON.parse(rawData);
  const problemEntries = parsedData.problems || [];

  console.log(`📋 Found ${problemEntries.length} entries in json file.`);

  // 2. Connect to MongoDB
  const connectionString = process.env.DB_CONNECT_STRING;
  if (!connectionString) {
    console.error("❌ DB_CONNECT_STRING is not defined in environment variables!");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(connectionString);
  console.log("✅ Connected to MongoDB successfully.\n");

  // 3. Fetch all problems in DB
  const existingProblems = await Problem.find({});
  console.log(`📚 Found ${existingProblems.length} questions in the database.`);

  // Map normalized title -> problem document
  const problemMap = new Map();
  for (const prob of existingProblems) {
    const key = normalizeTitle(prob.title);
    if (key) {
      problemMap.set(key, prob);
    }
  }

  let matchedCount = 0;
  let updatedCount = 0;
  let alreadyUpToDateCount = 0;
  const unmatched = [];
  const invalidUrls = [];

  for (const entry of problemEntries) {
    const entryName = entry.name || "";
    const normKey = normalizeTitle(entryName);
    const matchedProblem = problemMap.get(normKey);

    if (!matchedProblem) {
      unmatched.push(entryName);
      continue;
    }

    matchedCount++;

    const parsedVideo = parseYoutubeUrl(entry.video_solution);
    if (!parsedVideo || !parsedVideo.videoId) {
      invalidUrls.push({ name: entryName, url: entry.video_solution });
      continue;
    }

    // Check if already up-to-date (idempotent)
    const currentVideo = matchedProblem.video;
    const isUpToDate =
      currentVideo &&
      currentVideo.provider === "youtube" &&
      currentVideo.videoId === parsedVideo.videoId &&
      currentVideo.startTime === parsedVideo.startTime &&
      currentVideo.originalUrl === entry.video_solution;

    if (isUpToDate) {
      alreadyUpToDateCount++;
      console.log(`✔ [UNCHANGED] "${matchedProblem.title}" already has correct video.`);
    } else {
      matchedProblem.video = {
        provider: "youtube",
        videoId: parsedVideo.videoId,
        startTime: parsedVideo.startTime,
        channel: "takeUforward",
        originalUrl: entry.video_solution,
      };

      await matchedProblem.save();
      updatedCount++;
      console.log(
        `⚡ [UPDATED] "${matchedProblem.title}" -> videoId: ${parsedVideo.videoId}, startTime: ${parsedVideo.startTime}s`
      );
    }
  }

  // 4. Print clean summary
  console.log("\n==========================================");
  console.log("             SEEDING SUMMARY              ");
  console.log("==========================================");
  console.log(`Total JSON entries:      ${problemEntries.length}`);
  console.log(`Matched with questions:  ${matchedCount}`);
  console.log(`Updated in database:     ${updatedCount}`);
  console.log(`Already up-to-date:      ${alreadyUpToDateCount}`);
  console.log(`Unmatched entries:       ${unmatched.length}`);

  if (invalidUrls.length > 0) {
    console.log(`\n⚠️  Invalid YouTube URLs (${invalidUrls.length}):`);
    invalidUrls.forEach((u) => console.log(`   - ${u.name}: ${u.url}`));
  }

  if (unmatched.length > 0) {
    console.log("\n⚠️  Unmatched Question Names (no matching title in DB):");
    unmatched.forEach((name) => console.log(`   - "${name}"`));
    console.log("\n💡 Tip: Verify spelling/titles in DB or data/video-solutions.json to match them.");
  } else {
    console.log("\n🎉 All questions from video-solutions.json successfully matched!");
  }

  console.log("==========================================\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB.");
}

// If run directly
if (require.main === module) {
  seedVideos().catch((err) => {
    console.error("❌ Error running seed script:", err);
    process.exit(1);
  });
}

module.exports = {
  seedVideos,
  normalizeTitle,
};

