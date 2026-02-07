const express = require("express");
const videoRouter = express.Router();
const { generateSignature, saveVideoMetaData, deleteVideo } = require("../controllers/videoSection")



const { validateAdminToken } = require("../middleware/adminMiddleWare")
videoRouter.get("/create/:problemId", validateAdminToken, generateSignature);
videoRouter.post("/save", validateAdminToken, saveVideoMetaData);
videoRouter.delete("/delete/:problemId", validateAdminToken, deleteVideo);


module.exports = videoRouter