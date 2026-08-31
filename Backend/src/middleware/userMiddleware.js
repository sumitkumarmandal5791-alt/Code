const jwt = require("jsonwebtoken");
const { User } = require("../Modles/user")

const validateToken = async (req, res, next) => {
    try {
        // tems and condtion to verify token
        const { token } = req.cookies;
        if (!token)
            throw new Error("Unauthorized 1")

        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const { _id } = payload;

        if (!_id)
            throw new Error("Unauthorized 2")

        const user = await User.findById(_id)

        if (!user)
            throw new Error("Unauthorized 2")

        //user ko varify kare ke baad usse related saare info ko req.user me store kar diya hai 
        //taki user se related koi bhi information mil skae
        req.user = user;
        //token verified ans it is valid user
        next()

    }
    catch (error) {
        res.status(400).send(error.message)
    }
}
module.exports = {
    validateToken
}