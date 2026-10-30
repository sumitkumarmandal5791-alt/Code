const express = require("express");
const activityRouter = express.Router();
const { validateToken } = require("../middleware/userMiddleware");
const { getUserHeatmap, getUserStreakSummary } = require("../services/activityService");

/**
 * GET /api/activity/heatmap?year=YYYY
 * Returns array of days with activity [{ date, count }] and streak summary
 */
activityRouter.get("/heatmap", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const year = req.query.year ? parseInt(req.query.year, 10) : null;

    if (req.query.year && (isNaN(year) || year < 2000 || year > 2100)) {
      return res.status(400).json({ error: "Invalid year parameter." });
    }

    const data = await getUserHeatmap(userId, year);
    return res.status(200).json(data);
  } catch (error) {
    console.error("[ActivityRoute:heatmap] Error:", error);
    return res.status(500).json({ error: error.message || "Failed to load heatmap activity." });
  }
});

/**
 * GET /api/activity/streak
 * Returns summary only { currentStreak, longestStreak, totalSolved, totalActiveDays, lastActiveDate }
 */
activityRouter.get("/streak", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const summary = await getUserStreakSummary(userId);
    return res.status(200).json(summary);
  } catch (error) {
    console.error("[ActivityRoute:streak] Error:", error);
    return res.status(500).json({ error: error.message || "Failed to load streak summary." });
  }
});

module.exports = activityRouter;

