const mongoose = require("mongoose")
const { Schema } = mongoose

const videoSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    cloudinaryPublicId: {
        type: String,
        required: true
    },
    cloudinaryUrl: {
        type: String,
        required: true
    },
    secretUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    }

}, { timestamps: true })

const Video = mongoose.model("Video", videoSchema)
module.exports = Video
