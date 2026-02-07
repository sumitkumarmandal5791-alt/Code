const redisClient = require("../config/Reddis");


const submitRateLimmiter = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        //ye key hai jo user id and problem id ko combine karke banega
        const key = `submit:${userId}:${problemId}`;
        //check karega ki key exist karti hai ya nahi
        const count = await redisClient.exists(key);

        if (count) {
            return res.status(400).send("You have already submitted this problem");
        }
        //
        await redisClient.set(key, "cooldown_active", {
            EX: 10,//expire after 10 sec
            NX: true//only set if not exists
        });

        next();
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}

// const submitRateLimmiter = async (req, res, next) => {

//     try {
//         const userId = req.user._id;
//         const key = `coolDown${userId}`;

//         const count = redisClient.exists(key);

//         if (count)
//             return res.status(400).send("wait for some time")

//         redisClient.set(key, 'coolDown', {
//             EX: 10,
//             NX: true;
//         })
//         next();
//     }
//     catch (error) {

//     }

// }

module.exports = {
    submitRateLimmiter
}
