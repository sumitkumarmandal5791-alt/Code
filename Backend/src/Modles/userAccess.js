const mongoose = require("mongoose");
const { Schema } = mongoose;

const userAccessSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["problem", "all_access"],
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null, // null indicates lifetime access
    },
    orderId: {
      type: String,
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate access records and guarantee idempotency
userAccessSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

const UserAccess = mongoose.model("UserAccess", userAccessSchema);
module.exports = UserAccess;

