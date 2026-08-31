const Problem = require("../Modles/problem")
const Submission = require("../Modles/submitSchema")
const { getLanguageId, submitTokens, submitTestCase } = require("../utils/languagecode")



const userCodeSubmit = async (req, res) => {
    try {
        const userId = req.user._id
        const problemId = req.params.id

        const { code, language } = req.body;

        if (!userId || !code || !language)
            throw new Error("All fields are required")

        const problem = await Problem.findById(problemId);
        const { hiddenTestCases } = problem;

        //code jo user bheja hia submit kar do
        const submitToDb = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "pending",
            totalTestCasses: hiddenTestCases.length

        })
        const LanguageId = getLanguageId(language)

        const toSubmitJudge = hiddenTestCases.map((testCase, indx) => {
            return {
                source_code: code,
                language_id: LanguageId,
                stdin: testCase.input,
                expected_output: testCase.output,
            }
        })

        const response = await submitTestCase(toSubmitJudge);

        const resultToken = response.map((value) => value.token)

        const result = await submitTokens(resultToken)

        // const passedTestCases = result.filter((value) => value.status_id === 3).length;
        let passedTestCases = 0;
        let runTime = 0;
        let memory = 0;
        let status = 'Accepted'
        let errorMessage = null;
        for (const val of result) {
            if (val.status_id == 3) {
                passedTestCases++;
                runTime = runTime + parseFloat(val.time);
                memory = Math.max(val.memory, memory);
            }
            else {
                if (val.status_id === 4) {
                    status = 'Compilation Error'
                    errorMessage = val.stderr;
                }
                else {
                    status = 'Wrong';
                    errorMessage = val.stderr;
                }
            }
        }

        submitToDb.status = status;
        submitToDb.testCasesPassed = passedTestCases;
        submitToDb.runtime = runTime;
        submitToDb.memory = memory;
        submitToDb.errorMessage = errorMessage;
        await submitToDb.save();

        // Increment submissions count for today
        const moment = require("moment-timezone");
        const { calculateUpdatedStreak } = require("../utils/streakHelper");
        const user = req.user;
        const tz = user.streak?.timezone || "UTC";
        const localToday = moment().tz(tz).format("YYYY-MM-DD");

        if (!user.dailySubmissions) {
            user.dailySubmissions = new Map();
        }
        const currentCount = user.dailySubmissions.get(localToday) || 0;
        user.dailySubmissions.set(localToday, currentCount + 1);

        // Update streak
        const streakResult = calculateUpdatedStreak(user, tz);
        user.streak.currentStreak = streakResult.current;
        user.streak.longestStreak = streakResult.longest;
        user.streak.lastActiveDate = streakResult.lastActiveDate;

        // problem id ko user skima ke problemsolved me agar vo nahi hai to;
        if (status === 'Accepted' && !user.problemSolved.includes(problemId)) {
            user.problemSolved.push(problemId);
        }

        await user.save();

        // Emit real-time updates to all connected instances for this user
        if (req.io) {
            req.io.to(`user:${user._id}`).emit("activityUpdated", {
                streak: user.streak,
                dailySubmissions: Object.fromEntries(user.dailySubmissions),
                updatedDate: localToday,
                updatedCount: currentCount + 1
            });
        }

        return res.status(201).send(submitToDb);

    }
    catch (error) {
        res.status(400).send(error.message)
    }
}

const runCode = async (req, res) => {
    try {

        const userId = req.user._id
        const problemId = req.params.id

        const { code, language } = req.body;

        if (!userId || !code || !language)
            throw new Error("All fields are required")

        const problem = await Problem.findById(problemId);
        const { visibleTestCases } = problem;


        const LanguageId = getLanguageId(language)

        const toSubmitJudge = visibleTestCases.map((testCase, indx) => {
            return {
                source_code: code,
                language_id: LanguageId,
                stdin: testCase.input,
                expected_output: testCase.output,
            }
        })

        const response = await submitTestCase(toSubmitJudge);

        const resultToken = response.map((value) => value.token)

        const result = await submitTokens(resultToken)

        // const passedTestCases = result.filter((value) => value.status_id === 3).length;
        let passedTestCases = 0;
        let runTime = 0;
        let memory = 0;
        let status = 'Accepted'
        let errorMessage = null;
        for (const val of result) {
            if (val.status_id == 3) {
                passedTestCases++;
                runTime = runTime + parseFloat(val.time);
                memory = Math.max(val.memory, memory);
            }
            else {
                if (val.status_id === 4) {
                    status = 'Compilation Error'
                    errorMessage = val.stderr;
                }
                else {
                    status = 'Wrong';
                    errorMessage = val.stderr;
                }
            }
        }

        return res.status(200).json({
            status,
            results: result,
            passedTestCases,
            totalTestCases: visibleTestCases.length,
            runTime,
            memory,
            errorMessage
        });

    }
    catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })
    }

}

const getSubmitCode = async (req, res) => {
    try {
        const userId = req.user._id
        const problemId = req.params.id

        const submit = await Submission.find({ userId, problemId }).sort({ _id: -1 })

        return res.status(200).json(submit)
    }
    catch (error) {
        console.log(error.message)
    }

}

module.exports = { userCodeSubmit, runCode, getSubmitCode }