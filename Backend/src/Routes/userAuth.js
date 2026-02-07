const express = require("express");
const authRouter = express.Router();
const { validateToken } = require("../middleware/userMiddleware")
const { Register, Login, Logout, adminRegister, deleteProfile } = require("../controllers/userAuthentication")
const { validateAdminToken } = require("../middleware/adminMiddleWare")
const { allSubmitCode } = require("../controllers/createproblem")
//register
authRouter.post("/register", Register)
//login
authRouter.post("/login", Login)
//logout
authRouter.post("/logout", validateToken, Logout)
//admin register


authRouter.post("/admin/register", validateAdminToken, adminRegister)
//get profile
//authRouter.get("/profile", Getprofile)
//delete profile
authRouter.delete("/delete", validateToken, deleteProfile)
authRouter.get("/check", validateToken, (req, res) => {
    const reply = {
        firstName: req.user.firstName,
        emailId: req.user.emailId,
        _id: req.user._id,
        role: req.user.role
    }
    res.status(200).json({
        user: reply,
        message: "User is verified"
    })

})
authRouter.get("/allSubmit/:id", validateToken, allSubmitCode)//not checked


module.exports = authRouter 
