const moment = require("moment-timezone");
const { User } = require("../Modles/user");

/**
 * Calculates updated streak state based on timezone-aware submission dates
 * @param {Object} user - The mongoose user document
 * @param {string} userTimezone - Timezone name (e.g. "Asia/Kolkata")
 * @returns {Object} Object indicating new current/longest streak, last active date, and if updated
 */
function calculateUpdatedStreak(user, userTimezone) {
  const localToday = moment().tz(userTimezone).format("YYYY-MM-DD");
  const localYesterday = moment().tz(userTimezone).subtract(1, "day").format("YYYY-MM-DD");

  let current = user.streak?.currentStreak ?? 0;
  let longest = user.streak?.longestStreak ?? 0;
  const lastActive = user.streak?.lastActiveDate;

  if (lastActive === localToday) {
    // Already did submission today, streak count stays the same
    return { current, longest, lastActiveDate: localToday, updated: false };
  }

  if (lastActive === localYesterday) {
    // Extended streak
    current += 1;
  } else {
    // Streak broken/reset to 1
    current = 1;
  }

  if (current > longest) {
    longest = current;
  }

  return {
    current,
    longest,
    lastActiveDate: localToday,
    updated: true
  };
}

/**
 * Validates if the user's streak is still valid or if it has broken, resetting it to 0 if needed.
 * Emits socket update if there's a change.
 * @param {string} userId - User identifier
 * @param {Object} io - Socket.io instance
 */
async function checkAndResetStreak(userId, io) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.streak || !user.streak.lastActiveDate) return;

    const tz = user.streak.timezone || "UTC";
    const localToday = moment().tz(tz).format("YYYY-MM-DD");
    const localYesterday = moment().tz(tz).subtract(1, "day").format("YYYY-MM-DD");
    const lastActive = user.streak.lastActiveDate;

    // If last active was before yesterday, the streak is broken (reset to 0)
    if (lastActive !== localToday && lastActive !== localYesterday) {
      user.streak.currentStreak = 0;
      await user.save();

      if (io) {
        io.to(`user:${userId}`).emit("activityUpdated", {
          streak: user.streak,
          dailySubmissions: Object.fromEntries(user.dailySubmissions || new Map()),
          updatedDate: localToday,
          updatedCount: 0
        });
      }
    }
  } catch (error) {
    console.error("Error in checkAndResetStreak:", error);
  }
}

module.exports = {
  calculateUpdatedStreak,
  checkAndResetStreak
};
