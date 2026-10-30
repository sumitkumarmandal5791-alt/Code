/**
 * Simulation & Backfill Seed Script for LeetCode Activity Heatmap & Streaks
 * Usage: node src/scripts/seedActivity.js [userEmail]
 */

const mongoose = require("mongoose");
const moment = require("moment-timezone");
require("dotenv").config({ path: ".env" });

const { main } = require("../Modles/schema");
const { User } = require("../Modles/user");
const { Problem } = require("../Modles/problem");
const { DailyActivity } = require("../Modles/dailyActivity");
const { UserStreak } = require("../Modles/userStreak");
const { APP_TIMEZONE } = require("../services/activityService");

async function seedUserActivity() {
  await main();
  console.log("Connected to MongoDB database.");

  const emailArg = process.argv[2];
  let targetUser;

  if (emailArg) {
    targetUser = await User.findOne({ emailId: emailArg });
  } else {
    targetUser = await User.findOne();
  }

  if (!targetUser) {
    console.error("No user found to seed activity for. Please register a user first or pass an email.");
    process.exit(1);
  }

  console.log(`Seeding activity for user: ${targetUser.emailId} (${targetUser._id})`);

  // Clear existing activity and streak for fresh seed
  await DailyActivity.deleteMany({ user: targetUser._id });
  await UserStreak.deleteMany({ user: targetUser._id });

  // Get a few problem IDs to reference
  const problems = await Problem.find().limit(20).select("_id");
  const problemIds = problems.map((p) => p._id);

  const now = moment().tz(APP_TIMEZONE);
  const totalDays = 365;
  let currentStreak = 0;
  let longestStreak = 0;
  let totalSolved = 0;
  let totalActiveDays = 0;
  let lastActiveDate = null;

  const activities = [];

  for (let i = totalDays; i >= 0; i--) {
    const dateObj = now.clone().subtract(i, "days");
    const dateStr = dateObj.format("YYYY-MM-DD");

    // Randomize activity: 65% chance of activity on any day
    const hasActivity = Math.random() < 0.65;

    if (hasActivity) {
      // 1 to 7 problems per active day
      const count = Math.floor(Math.random() * 5) + 1;
      const dayProblems = [];

      for (let c = 0; c < count; c++) {
        const randomProb = problemIds[Math.floor(Math.random() * problemIds.length)] || new mongoose.Types.ObjectId();
        if (!dayProblems.includes(randomProb)) {
          dayProblems.push(randomProb);
        }
      }

      activities.push({
        user: targetUser._id,
        date: dateStr,
        solvedCount: dayProblems.length,
        solvedProblems: dayProblems,
      });

      totalSolved += dayProblems.length;
      totalActiveDays += 1;
      lastActiveDate = dateStr;

      currentStreak += 1;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      // Streak broken
      currentStreak = 0;
    }
  }

  // Bulk insert daily activities
  await DailyActivity.insertMany(activities);
  console.log(`Inserted ${activities.length} daily activity records.`);

  // Create UserStreak
  await UserStreak.create({
    user: targetUser._id,
    currentStreak,
    longestStreak,
    totalSolved,
    totalActiveDays,
    lastActiveDate,
  });

  console.log("Created UserStreak record:", {
    currentStreak,
    longestStreak,
    totalSolved,
    totalActiveDays,
    lastActiveDate,
  });

  console.log("Seeding complete! You can now view the full LeetCode-style activity heatmap.");
  process.exit(0);
}

seedUserActivity().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

