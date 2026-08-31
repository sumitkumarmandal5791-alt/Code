require("dotenv").config();
const express = require("express");
const { main } = require("./src/config/database")
const app = express();
const userAuthRouter = require("./src/Routes/userAuth")
const problemRouter = require("./src/Routes/problemrotuer")
const submitCodeRouter = require("./src/Routes/submit")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const AI = require("./src/CHAT_GPT/callgemnini")
const videoRouter = require("./src/Routes/VideoRoute")
const chatRouter = require("./src/Routes/chatRoute")

const http = require("http");
const { Server } = require("socket.io");
const { checkAndResetStreak } = require("./src/utils/streakHelper");

const allowedOrigin = (process.env.NODE_ENV === "production" ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV)

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

// Parse cookie manually from socket handshake
io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie || "";
        const cookies = cookieHeader.split(';').reduce((acc, pair) => {
            const parts = pair.split('=');
            if (parts.length === 2) {
                acc[parts[0].trim()] = decodeURIComponent(parts[1].trim());
            }
            return acc;
        }, {});

        const token = cookies.token;
        if (!token) return next(new Error("Authentication error: No token found"));

        const jwt = require("jsonwebtoken");
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { _id } = payload;
        if (!_id) return next(new Error("Authentication error: Invalid token"));

        socket.userId = _id;
        next();
    } catch (err) {
        return next(new Error("Authentication error: " + err.message));
    }
});

io.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    // Lazy verification check on connection
    checkAndResetStreak(socket.userId, io);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
    });
});

// Make io accessible in express requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))




app.use(express.json());
app.use(cookieParser());


app.use("/user", userAuthRouter)
app.use("/admin", problemRouter)
app.use("/users", submitCodeRouter)
app.use("/ai", AI)
app.use("/video", videoRouter)
app.use("/chat", chatRouter)



const InitalizeConnection = async () => {
    try {
        await main();
        console.log("CONNECTED TO DATABASE")
        server.listen(process.env.PORT, () => {
            console.log("Server is Listening at Port Number:" + process.env.PORT)
        })

    }
    catch (error) {
        console.log("DATABASE CONNECTION FAILED" + error.message);

    }
}

InitalizeConnection();
