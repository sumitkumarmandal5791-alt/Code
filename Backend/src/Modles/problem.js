const mongoose = require("mongoose")
const { Schema } = mongoose

const schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["easy", "medium", "hard"],
    },
    tags: [{
        type: String,
        trim: true,
        required: true
    }],
    visibleTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },
            explanation: {
                type: String,

            }
        }
    ],
    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],
    startCode: [
        {
            language: {
                type: String,
                required: true
            },
            initialCode: {
                type: String,
                required: true
            }
        }
    ],
    referenceSolution: [
        {
            language: {
                type: String,
                required: true
            },
            code: {
                type: String,
                required: true
            }
        }
    ],
    problemCreater: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

const Problem = mongoose.model("Problem", schema)
module.exports = Problem 