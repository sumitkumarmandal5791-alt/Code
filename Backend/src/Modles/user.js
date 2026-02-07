const mongoose = require("mongoose")
const { Schema } = mongoose

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
        trim: true
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20,
        trim: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    age: {
        type: Number,
        min: 5,
        max: 60,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        unique: true,
        immutable: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["user", "admin"],
        default: "user"
    },
    problemSolved: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "Problem",
            unique: true
        }],

    }
}, { timestamps: true })



userSchema.post("findOneAndDelete", async function (userInfo) {
    if (userInfo) {
        await mongoose.model("Submission").deleteMany({ userId: userInfo._id })
    }
})

const User = mongoose.model("User", userSchema)
module.exports = { User }