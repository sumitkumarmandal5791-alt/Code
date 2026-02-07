const cloudinary = require('cloudinary').v2
const Problem = require("../Modles/problem")
const Video = require("../Modles/videoSchema")


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
//configure the cloddinary

const generateSignature = async (req, res) => {
    try {
        const userId = req.user._id;
        const { problemId } = req.params;
        console.log(problemId)
        const problem = await Problem.findById(problemId)

        if (!problem) {
            return res.status(404).json({ message: "Problem not found " })
        }

        //genetare a unique public key for the video
        const timeStamp = Math.round(new Date().getTime() / 1000);
        const publicKey = `leetcode-solution${problemId}_${userId}_${timeStamp}`

        //upload parameter
        const uploadParameter = {
            timestamp: timeStamp,
            public_id: publicKey,
        }

        const signature = cloudinary.utils.api_sign_request(uploadParameter, process.env.CLOUDINARY_API_SECRET)

        return res.json({
            signature,
            timeStamp,
            public_id: publicKey,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

const saveVideoMetaData = async (req, res) => {
    try {
        const {
            problemId,
            cloudinaryPublicId,
            cloudinaryUrl,
            secretUrl,
            duration
        } = req.body

        const userId = req.user._id;

        //vrify the upload wth the clouddinary 
        const cloddinaryResource = await cloudinary.api.resource(cloudinaryPublicId, { resource_type: "video" })

        if (!cloddinaryResource) {
            return res.status(400).json({ message: "Invalid video upload" })
        }


        //check if video already exixts for this problem and user
        const existingVideo = await Video.findOne({ problemId, userId, cloudinaryPublicId })

        if (existingVideo) {
            return res.status(400).json({ message: "Video already exists" })
        }

        const thumbnailUrl = cloudinary.url(cloddinaryResource.public_id, {
            resource_type: 'image',
            transformation: [
                {
                    width: 300,
                    height: 300,
                    crop: 'fill'
                },
                {
                    quality: 'auto'
                },
                {
                    start_offset: "auto"
                },
            ],
            format: 'jpg'
        })

        const video = await Video.create({
            problemId,
            userId,
            cloudinaryPublicId,
            cloudinaryUrl,
            secretUrl,
            thumbnailUrl,
            duration: cloddinaryResource.duration || duration
        })

        res.status(201).json({
            message: "Video solutin saved sucessfully",
            video
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

const deleteVideo = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.user._id;

        const video = await Video.findOneAndDelete({ problemId, userId })

        console.log(video)

        if (!video) {
            return res.status(404).json({ message: "Video not found" })
        }

        await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: "video", invalidate: true })
        return res.status(200).json({ message: "Video deleted successfully" })

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Video Not Found" })
    }
}

module.exports = { generateSignature, saveVideoMetaData, deleteVideo }