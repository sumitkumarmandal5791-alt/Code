const mongoose = require("mongoose");
const { Schema } = mongoose;

const dailyActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Stored as "YYYY-MM-DD" in Asia/Kolkata timezone
    date: {
      type: String,
      required: true,
      index: true,
    },
    solvedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    solvedProblems: [
      {
        type: Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
  },
  { timestamps: true }
);

// Compound unique index to guarantee one document per user per day and quick range queries
dailyActivitySchema.index({ user: 1, date: 1 }, { unique: true });

const DailyActivity = mongoose.model("DailyActivity", dailyActivitySchema);
module.exports = { DailyActivity };

