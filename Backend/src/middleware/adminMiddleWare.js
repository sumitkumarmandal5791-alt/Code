const jwt = require("jsonwebtoken");
const redisClient = require("../config/Reddis")
const { User } = require("../Modles/user")

const validateAdminToken = async (req, res, next) => {
    try {
        // tems and condtion to verify token
        const { token } = req.cookies;
        if (!token)
            throw new Error("Unauthorized 1")

        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const { _id } = payload;

        if (payload.role != 'admin')
            throw new Error("Unauthorized 5")

        if (!_id)
            throw new Error("Unauthorized 2")

        const user = await User.findById(_id)

        if (!user)
            throw new Error("Unauthorized 6")

        //check in the database of reddis whether this 
        // token is blacklisted or not
        const blockListToken = await redisClient.exists(`token:${token}`)
        if (blockListToken)
            throw new Error("Unauthorized 3")

        req.user = user;
        //token verified ans it is valid user
        next()

    }
    catch (error) {
        res.status(400).send(error.message)
    }
}
module.exports = {
    validateAdminToken
}