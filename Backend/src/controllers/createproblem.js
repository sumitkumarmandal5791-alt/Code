const Problem = require("../Modles/problem");
const { User } = require("../Modles/user");
const Submission = require("../Modles/submitSchema");
const Video = require("../Modles/videoSchema");
const { getLanguageId } = require("../utils/languagecode");
const { submitTestCase, submitTokens } = require("../utils/languagecode");
const { checkUserVideoAccess } = require("../services/accessService");
const pricing = require("../config/pricing");

const waiting = (timer) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timer);
    });
};

const createProblem = async (req, res) => {
    const { title, description, tags, visibleTestCases, hiddenTestCases, referenceSolution } = req.body;

    if (!title) throw new Error("Title is required");
    if (!description) throw new Error("Description is required");
    if (!tags) throw new Error("Tags are required");
    if (!visibleTestCases) throw new Error("visibleTestCases are required");
    if (!hiddenTestCases) throw new Error("hiddenTestCases are required");
    if (!referenceSolution) throw new Error("referenceSolution is required");

    const errorCode = [
        { id: 3, description: "Accepted" },
        { id: 4, description: "Wrong Answer" },
        { id: 5, description: "Time Limit Exceeded" },
        { id: 6, description: "Compilation Error" },
        { id: 7, description: "Runtime Error (SIGSEGV)" },
        { id: 8, description: "Runtime Error (SIGXFSZ)" },
        { id: 9, description: "Runtime Error (SIGFPE)" },
        { id: 10, description: "Runtime Error (SIGABRT)" },
        { id: 11, description: "Runtime Error (NZEC)" },
        { id: 12, description: "Runtime Error (Other)" },
        { id: 13, description: "Internal Error" },
        { id: 14, description: "Exec Format Error" }
    ];

    try {
        for (const element of referenceSolution) {
            const languageId = getLanguageId(element.language);

            const submissions = visibleTestCases.map((testCase) => {
                return {
                    source_code: element.code,
                    language_id: languageId,
                    stdin: testCase.input,
                    expected_output: testCase.output,
                };
            });

            if (!submissions)
                throw new Error("undefined submission");

            const result = await submitTestCase(submissions);
            const resultToken = result.map((value) => value.token);
            const testResult = await submitTokens(resultToken);

            for (const test of testResult) {
                const statusId = Number(test.status.id);

                if (statusId !== 3) {
                    const err = errorCode.find(
                        (ele) => Number(ele.id) === statusId
                    );

                    if (!err) {
                        return res
                            .status(400)
                            .send("Unknown Judge0 status_id: " + test.status_id);
                    }
                    return res.status(400).send(err.description);
                }
            }
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreater: req.user._id,
        });

        return res.status(200).send("Problem Created Successfully");
    } catch (error) {
        res.status(300).send(error.message);
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;

    const { title, description, tags, visibleTestCases, hiddenTestCases, referenceSolution } = req.body;

    try {
        if (!title) throw new Error("Title is required");
        if (!description) throw new Error("Description is required");
        if (!tags) throw new Error("Tags are required");
        if (!visibleTestCases) throw new Error("visibleTestCases are required");
        if (!hiddenTestCases) throw new Error("hiddenTestCases are required");
        if (!referenceSolution) throw new Error("referenceSolution is required");

        if (!id) {
            return res.status(400).send("Invalid ID");
        }

        const dsaProblem = await Problem.findById(id);
        if (!dsaProblem) {
            return res.status(404).send("Problem not found");
        }

        for (const element of referenceSolution) {
            const languageId = getLanguageId(element.language);

            const submissions = visibleTestCases.map((testCase) => {
                return {
                    source_code: element.code,
                    language_id: languageId,
                    stdin: testCase.input,
                    expected_output: testCase.output,
                };
            });

            if (!submissions)
                throw new Error("undefined submission");

            const result = await submitTestCase(submissions);
            const resultToken = result.map((value) => value.token);
            const testResult = await submitTokens(resultToken);

            for (const test of testResult) {
                if (test.status_id != 3)
                    return res.status(400).send(`Compilation/Runtime error in ${element.language} solution`);
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
        res.status(200).send(newProblem);
    } catch (error) {
        console.error("Update Problem Error:", error);
        res.status(400).send(error.message || "Problem update Failed");
    }
};

const DeleteProblem = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id)
            return res.status(400).send("id not found");

        const deletestatus = await Problem.findByIdAndDelete(id);

        if (!deletestatus) {
            return res.status(400).send("problem not found");
        }
        return res.status(200).send("Problem deleted sucessfully");
    } catch (error) {
        return res.status(400).send("Filed to delete");
    }
};

const getProblemById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).send("ID not provided");
        }

        let dsaProblem;
        if (req.user?.role === 'admin') {
            dsaProblem = await Problem.findById(id);
        } else {
            dsaProblem = await Problem.findById(id).select(
                '_id title description difficulty tags visibleTestCases referenceSolution startCode video'
            );
        }

        if (!dsaProblem) {
            return res.status(404).send("Problem not found");
        }

        const problemObj = dsaProblem.toObject ? dsaProblem.toObject() : { ...dsaProblem };
        const hasAttachedVideo = Boolean(problemObj.video && problemObj.video.videoId);
        problemObj.hasVideo = hasAttachedVideo;

        // Check if user has purchased access to this video solution
        const userId = req.user?._id;
        const accessStatus = await checkUserVideoAccess(userId, id);

        if (accessStatus.hasAccess || req.user?.role === 'admin') {
            problemObj.hasAccess = true;
            problemObj.accessType = accessStatus.accessType;
        } else {
            problemObj.hasAccess = false;
            problemObj.isLocked = hasAttachedVideo;
            // STRIP videoId and raw URL from response for unpaid users
            problemObj.video = null;
            problemObj.videoPreview = {
                hasVideo: hasAttachedVideo,
                channel: dsaProblem.video?.channel || "takeUforward",
                price: dsaProblem.videoPrice || pricing.PER_VIDEO_PRICE,
                allAccessPrice: pricing.ALL_ACCESS_PRICE,
            };
        }

        return res.status(200).json(problemObj);
    } catch (error) {
        console.error("getProblemById error:", error);
        return res.status(500).send("Server Error in getProblemById");
    }
};

const getAllProblem = async (req, res) => {
    try {
        const dsaProblem = await Problem.find({}).select('_id title tags difficulty video');

        if (!dsaProblem) {
            return res.status(404).send("No problems found");
        }

        const formatted = dsaProblem.map((p) => {
            const obj = p.toObject ? p.toObject() : p;
            return {
                _id: obj._id,
                title: obj.title,
                tags: obj.tags,
                difficulty: obj.difficulty,
                hasVideo: Boolean(obj.video && obj.video.videoId),
                video: obj.video,
            };
        });

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("getAllProblem error:", error);
        return res.status(500).send("Server Error in getAllProblem");
    }
};

const getAllProblemSolved = async (req, res) => {
    try {
        const userId = req.user._id;

        const count = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title tags difficulty video"
        });

        const reply = {
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            problemSolved: count.problemSolved,
            role: req.user.role,
            _id: req.user._id
        };

        return res.status(200).json({
            user: reply,
            message: "Valid User"
        });
    } catch (error) {
        return res.status(500).send("Server Error in getAllProblemSolved: " + error.message);
    }
};

const allSubmitCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;

        const ans = await Submission.find({ userId, problemId });
        if (ans.length === 0)
            return res.status(200).send([]);
        return res.status(200).send(ans);
    } catch (error) {
        return res.status(500).send("Server Error in allSubmitCode: " + error.message);
    }
};

module.exports = {
    createProblem,
    updateProblem,
    DeleteProblem,
    getProblemById,
    getAllProblem,
    getAllProblemSolved,
    allSubmitCode
};
