const moment = require("moment-timezone");
const { DailyActivity } = require("../Modles/dailyActivity");
const { UserStreak } = require("../Modles/userStreak");
const { emitToUser } = require("../sockets/emitter");

const APP_TIMEZONE = "Asia/Kolkata";

/**
 * Returns current and yesterday's date strings in Asia/Kolkata timezone (YYYY-MM-DD)
 */
function getKolkataDates() {
  const now = moment().tz(APP_TIMEZONE);
  const today = now.format("YYYY-MM-DD");
  const yesterday = now.clone().subtract(1, "day").format("YYYY-MM-DD");
  return { today, yesterday };
}

/**
 * Computes real-time effective streak at read time so it never displays stale numbers
 */
function computeEffectiveStreak(streakDoc, todayStr, yesterdayStr) {
  if (!streakDoc || !streakDoc.lastActiveDate) {
    return 0;
  }
  if (streakDoc.lastActiveDate === todayStr || streakDoc.lastActiveDate === yesterdayStr) {
    return streakDoc.currentStreak;
  }
  return 0;
}

/**
 * Service function to process an Accepted problem submission
 * Enforces counting rules:
 * - Only the first time a problem is Accepted counts towards activity & streak
 * - Atomic upsert on DailyActivity
 * - Streak progression logic
 * - Real-time Socket.IO emission to the user's room
 *
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} problemId
 * @param {string|ObjectId} submissionId
 */
async function recordAcceptedProblem(userId, problemId, submissionId) {
  const { today: todayStr, yesterday: yesterdayStr } = getKolkataDates();

  // Rule: Check if user has ALREADY solved this problem prior to today/submission
  const alreadySolved = await DailyActivity.exists({
    user: userId,
    solvedProblems: problemId,
  });

  if (alreadySolved) {
    // Re-solving an already accepted problem does not increment count or streak
    const existingStreak = await getUserStreakSummary(userId);
    return {
      counted: false,
      reason: "Problem already solved previously",
      streak: existingStreak,
    };
  }

  // Atomic upsert on DailyActivity for today
  // Try to update an existing record if problem is not in solvedProblems
  let activity = await DailyActivity.findOneAndUpdate(
    {
      user: userId,
      date: todayStr,
      solvedProblems: { $ne: problemId },
    },
    {
      $addToSet: { solvedProblems: problemId },
      $inc: { solvedCount: 1 },
    },
    { new: true }
  );

  // If document didn't exist for today, upsert it safely
  if (!activity) {
    try {
      activity = await DailyActivity.findOneAndUpdate(
        { user: userId, date: todayStr },
        {
          $setOnInsert: {
            user: userId,
            date: todayStr,
            solvedCount: 1,
            solvedProblems: [problemId],
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      // Handle rare race condition where document was inserted concurrently
      activity = await DailyActivity.findOne({ user: userId, date: todayStr });
    }
  }

  // Update UserStreak
  let streak = await UserStreak.findOne({ user: userId });
  if (!streak) {
    streak = new UserStreak({
      user: userId,
      currentStreak: 0,
      longestStreak: 0,
      totalSolved: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
    });
  }

  streak.totalSolved += 1;

  if (streak.lastActiveDate === todayStr) {
    // Already active today; streak length does not increment again
  } else if (streak.lastActiveDate === yesterdayStr) {
    // Consecutive active day!
    streak.currentStreak += 1;
    streak.totalActiveDays += 1;
    streak.lastActiveDate = todayStr;
  } else {
    // Streak broken or starting fresh
    streak.currentStreak = 1;
    streak.totalActiveDays += 1;
    streak.lastActiveDate = todayStr;
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  await streak.save();

  // Socket.IO real-time emission to private user room
  emitToUser(userId, "activity:update", {
    date: todayStr,
    solvedCount: activity?.solvedCount || 1,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalSolved: streak.totalSolved,
    totalActiveDays: streak.totalActiveDays,
    problemId: problemId.toString(),
  });

  return {
    counted: true,
    activity,
    streak: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalSolved: streak.totalSolved,
      totalActiveDays: streak.totalActiveDays,
      lastActiveDate: streak.lastActiveDate,
    },
  };
}

/**
 * Retrieves the user streak summary with real-time effective streak computed
 * @param {string|ObjectId} userId
 */
async function getUserStreakSummary(userId) {
  const { today, yesterday } = getKolkataDates();

  let streak = await UserStreak.findOne({ user: userId });
  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSolved: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
    };
  }

  const effectiveStreak = computeEffectiveStreak(streak, today, yesterday);

  return {
    currentStreak: effectiveStreak,
    longestStreak: streak.longestStreak,
    totalSolved: streak.totalSolved,
    totalActiveDays: streak.totalActiveDays,
    lastActiveDate: streak.lastActiveDate,
  };
}

/**
 * Retrieves heatmap activity and summary
 * @param {string|ObjectId} userId
 * @param {number|string} year (optional, defaults to last 365 days or given year)
 */
async function getUserHeatmap(userId, year) {
  const streakSummary = await getUserStreakSummary(userId);

  const filter = { user: userId, solvedCount: { $gt: 0 } };

  if (year && !isNaN(year)) {
    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;
    filter.date = { $gte: startOfYear, $lte: endOfYear };
  } else {
    // Last 365 days in Asia/Kolkata
    const startDate = moment().tz(APP_TIMEZONE).subtract(365, "days").format("YYYY-MM-DD");
    filter.date = { $gte: startDate };
  }

  const activities = await DailyActivity.find(filter)
    .select("date solvedCount -_id")
    .sort({ date: 1 })
    .lean();

  const heatmap = activities.map((item) => ({
    date: item.date,
    count: item.solvedCount,
  }));

  return {
    heatmap,
    summary: streakSummary,
  };
}

module.exports = {
  APP_TIMEZONE,
  getKolkataDates,
  computeEffectiveStreak,
  recordAcceptedProblem,
  getUserStreakSummary,
  getUserHeatmap,
};

