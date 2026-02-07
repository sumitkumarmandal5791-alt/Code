const express = require("express")
const submitCodeRouter = express.Router();
const { validateToken } = require("../middleware/userMiddleware")
const { userCodeSubmit, runCode, getSubmitCode } = require("../controllers/userCodeSubmit")
const { submitRateLimmiter } = require("../middleware/SubmitRateLimmiter")

submitCodeRouter.post("/submit/:id", validateToken, submitRateLimmiter, userCodeSubmit)
submitCodeRouter.post("/runCode/:id", validateToken, submitRateLimmiter, runCode)
submitCodeRouter.get("/getsubmit/:id", validateToken, getSubmitCode)
module.exports = submitCodeRouter 
