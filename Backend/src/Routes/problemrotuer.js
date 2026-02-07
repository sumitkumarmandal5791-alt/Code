const express = require("express");
const problemRouter = express.Router();
const { validateAdminToken } = require("../middleware/adminMiddleWare")
const { createProblem, updateProblem, DeleteProblem, getProblemById, getAllProblem, getAllProblemSolved, allSubmitCode } = require("../controllers/createproblem")
const { validateToken } = require("../middleware/userMiddleware")

problemRouter.post("/create", validateAdminToken, createProblem)
problemRouter.put("/update/:id", validateAdminToken, updateProblem)
problemRouter.delete("/delete/:id", validateAdminToken, DeleteProblem)


problemRouter.get("/problemBy/:id", validateToken, getProblemById)
problemRouter.get("/getAllProblem", validateToken, getAllProblem)
problemRouter.get("/getAllSolvedProblem", validateToken, getAllProblemSolved)
problemRouter.get("/submission/:id", validateToken, allSubmitCode)

module.exports = problemRouter 
