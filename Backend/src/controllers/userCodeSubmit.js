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
        //problem id ko user skima ke problemsolved me agar vo nahi hai to;

        if (!req.user.problemSolved.includes(problemId)) {
            req.user.problemSolved.push(problemId);


            await req.user.save();
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
        console.log(error.message)
    }

}

const getSubmitCode = async (req, res) => {
    try {
        const userId = req.user._id
        const problemId = req.params.id
        console.log(userId, problemId);
        const submit = await Submission.find({ userId, problemId }).sort({ _id: -1 })
        return res.status(200).json(submit)
    }
    catch (error) {
        console.log(error.message)
    }

}

module.exports = { userCodeSubmit, runCode, getSubmitCode }