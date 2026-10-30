const cron = require("node-cron");
const moment = require("moment-timezone");
const { UserStreak } = require("../Modles/userStreak");
const { emitToUser } = require("../sockets/emitter");
const { APP_TIMEZONE, getKolkataDates } = require("./activityService");

/**
 * Resets lapsed streaks to 0 for users whose last active date is older than yesterday.
 * Emits "streak:reset" event to currently connected users.
 */
async function resetLapsedStreaks() {
  const { today, yesterday } = getKolkataDates();
  console.log(`[Cron:StreakReset] Running daily streak reset for ${today} (cutoff: ${yesterday}) in ${APP_TIMEZONE}...`);

  try {
    // Find all users who had a current streak > 0 but did not solve anything yesterday or today
    const lapsedStreaks = await UserStreak.find({
      currentStreak: { $gt: 0 },
      lastActiveDate: { $nin: [today, yesterday] },
    });

    if (lapsedStreaks.length === 0) {
      console.log("[Cron:StreakReset] No lapsed streaks found.");
      return 0;
    }

    console.log(`[Cron:StreakReset] Found ${lapsedStreaks.length} lapsed streak(s) to reset.`);

    for (const doc of lapsedStreaks) {
      doc.currentStreak = 0;
      await doc.save();

      // Notify connected client instances/tabs in real time
      emitToUser(doc.user, "streak:reset", {
        currentStreak: 0,
        lastActiveDate: doc.lastActiveDate,
        totalSolved: doc.totalSolved,
        totalActiveDays: doc.totalActiveDays,
      });
    }

    console.log(`[Cron:StreakReset] Successfully reset ${lapsedStreaks.length} streak(s).`);
    return lapsedStreaks.length;
  } catch (error) {
    console.error("[Cron:StreakReset] Error executing streak reset cron:", error);
    return 0;
  }
}

/**
 * Initializes the node-cron scheduler at 00:05 AM in Asia/Kolkata timezone
 */
function initializeStreakCron() {
  // Schedule: 00:05 AM daily in Asia/Kolkata timezone
  cron.schedule(
    "5 0 * * *",
    async () => {
      await resetLapsedStreaks();
    },
    {
      scheduled: true,
      timezone: APP_TIMEZONE,
    }
  );

  console.log(`[Scheduler] Daily streak reset cron scheduled at 00:05 AM (${APP_TIMEZONE}).`);
}

module.exports = {
  initializeStreakCron,
  resetLapsedStreaks,
};

