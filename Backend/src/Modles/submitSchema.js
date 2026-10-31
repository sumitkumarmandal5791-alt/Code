const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { VERDICTS } = require("../utils/verdicts");

const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["java", "javascript", "cpp", "python"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "Running",
        VERDICTS.ACCEPTED,
        VERDICTS.WRONG_ANSWER,
        VERDICTS.COMPILE_ERROR,
        VERDICTS.RUNTIME_ERROR,
        VERDICTS.TIME_LIMIT_EXCEEDED,
        VERDICTS.MEMORY_LIMIT_EXCEEDED,
        VERDICTS.OUTPUT_LIMIT_EXCEEDED,
        VERDICTS.INTERNAL_ERROR,
        // Legacy fallbacks for historical DB records
        "Wrong",
        "Compilation Error",
      ],
      default: "pending",
    },
    verdict: {
      type: String,
      default: "",
    },
    runtime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    errorLine: {
      type: Number,
      default: null,
    },
    failedTestIndex: {
      type: Number,
      default: null,
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCasses: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    actualOutput: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, problemId: 1 });

const Submission = mongoose.model("submission", submissionSchema);
module.exports = Submission;
