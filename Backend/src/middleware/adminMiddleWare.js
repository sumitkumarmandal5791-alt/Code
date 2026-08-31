const jwt = require("jsonwebtoken");
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