const UserAccess = require("../Modles/userAccess");
const { User } = require("../Modles/user");

/**
 * Checks whether a user has access to a specific problem's video solution.
 * Access is granted if:
 * 1. User is an admin
 * 2. User has purchased the "all_access" pass (lifetime or active subscription)
 * 3. User has purchased the specific problem video solution
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {string|mongoose.Types.ObjectId} problemId
 * @returns {Promise<{ hasAccess: boolean, accessType: "admin"|"all_access"|"problem"|"none" }>}
 */
async function checkUserVideoAccess(userId, problemId) {
  if (!userId) {
    return { hasAccess: false, accessType: "none" };
  }

  // 1. Admin check
  const user = await User.findById(userId).select("role");
  if (user && user.role === "admin") {
    return { hasAccess: true, accessType: "admin" };
  }

  // 2. Check for All-Access pass
  const allAccess = await UserAccess.findOne({
    userId,
    itemType: "all_access",
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });

  if (allAccess) {
    return { hasAccess: true, accessType: "all_access" };
  }

  // 3. Check for specific problem video access
  if (problemId) {
    const problemAccess = await UserAccess.findOne({
      userId,
      itemType: "problem",
      itemId: problemId,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (problemAccess) {
      return { hasAccess: true, accessType: "problem" };
    }
  }

  return { hasAccess: false, accessType: "none" };
}

/**
 * Idempotently grants access to a user for an item.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.userId
 * @param {"problem"|"all_access"} params.itemType
 * @param {string|mongoose.Types.ObjectId|null} params.itemId
 * @param {string} params.orderId
 * @param {string} params.paymentId
 * @param {Date|null} [params.expiresAt=null]
 * @returns {Promise<UserAccess>}
 */
async function grantAccess({ userId, itemType, itemId, orderId, paymentId, expiresAt = null }) {
  const query = {
    userId,
    itemType,
    itemId: itemId || null,
  };

  const update = {
    $setOnInsert: {
      userId,
      itemType,
      itemId: itemId || null,
      grantedAt: new Date(),
    },
    $set: {
      orderId,
      paymentId,
      expiresAt,
    },
  };

  const options = {
    upsert: true,
    new: true,
  };

  const record = await UserAccess.findOneAndUpdate(query, update, options);
  return record;
}

module.exports = {
  checkUserVideoAccess,
  grantAccess,
};

