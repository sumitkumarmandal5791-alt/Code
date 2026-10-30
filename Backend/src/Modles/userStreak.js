const mongoose = require("mongoose");
const { Schema } = mongoose;

const userStreakSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Stored as "YYYY-MM-DD" in Asia/Kolkata timezone
    lastActiveDate: {
      type: String,
      default: null,
    },
    totalSolved: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalActiveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const UserStreak = mongoose.model("UserStreak", userStreakSchema);
module.exports = { UserStreak };

