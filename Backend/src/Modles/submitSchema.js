const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ["java", "javascript", "cpp", "python"]
    },
    status: {
        type: String,
        enum: ["pending", "Accepted", "Wrong", "Compilation Error"],
        default: 'pending'
    },
    runtime: {
        type: Number,
        default: 0
    },
    memory: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String,
        default: ''
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    totalTestCasses: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

// indexin kar rahe hai taaki query jaldi laga sake
submissionSchema.index({ userId: 1, problemId: 1 })

const Submission = mongoose.model("submission", submissionSchema)
module.exports = Submission
