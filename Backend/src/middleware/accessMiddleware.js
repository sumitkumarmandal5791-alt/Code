const { checkUserVideoAccess } = require("../services/accessService");

/**
 * Middleware that verifies if the logged-in user has purchased access
 * to the video solution for the requested problem.
 */
async function requireVideoAccess(req, res, next) {
  try {
    const userId = req.user?._id;
    const problemId = req.params.problemId || req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    if (!problemId) {
      return res.status(400).json({ error: "Problem ID is required." });
    }

    const { hasAccess, accessType } = await checkUserVideoAccess(userId, problemId);

    if (!hasAccess) {
      return res.status(403).json({
        error: "Access denied. Please purchase the video solution or an all-access pass to view.",
        isLocked: true,
        problemId,
      });
    }

    req.accessType = accessType;
    next();
  } catch (error) {
    console.error("[requireVideoAccess] Error:", error);
    return res.status(500).json({ error: "Failed to verify video access permissions." });
  }
}

module.exports = {
  requireVideoAccess,
};

