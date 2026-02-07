
require("dotenv").config();
const express = require("express");
const { main } = require("./src/config/database")
const app = express();
const userAuthRouter = require("./src/Routes/userAuth")
const problemRouter = require("./src/Routes/problemrotuer")
const redisClient = require("./src/config/Reddis")
const submitCodeRouter = require("./src/Routes/submit")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const AI = require("./src/CHAT_GPT/callgemnini")
const videoRouter = require("./src/Routes/VideoRoute")

const allowedOrigin=process.env.NODE_ENV==="production"?process.env.CROS_ORIGIN_PROD:process.env.CROS_ORIGIN_DEV

app.use(cors({
    origin: [allowedOrigin, process.env.CLOUD_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
//cors issue resolve



app.use(express.json());
app.use(cookieParser());


app.use("/user", userAuthRouter)
app.use("/admin", problemRouter)
app.use("/users", submitCodeRouter)
app.use("/ai", AI)
app.use("/video", videoRouter)



const InitalizeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()])
        console.log("CONNECTED TO DATABASE")
        app.listen(process.env.PORT, () => {
            console.log("Server is Listening at Port Number:" + process.env.PORT)
        })

    }
    catch (error) {
        console.log("DATABASE CONNECTION FAILED" + error.message);

    }
}

InitalizeConnection();