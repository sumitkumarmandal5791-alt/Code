const Problem = require("../Modles/problem");
const Submission = require("../Modles/submitSchema");
const { getLanguageId, submitTokens, submitTestCase } = require("../utils/languagecode");
const { classifyResult } = require("../utils/judgeClassifier");
const { VERDICTS } = require("../utils/verdicts");

const userCodeSubmit = async (req, res) => {
  let submitToDb = null;
  try {
    const userId = req.user._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !language) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const { hiddenTestCases = [] } = problem;

    // Record initial pending submission in DB
    submitToDb = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: VERDICTS.PENDING,
      verdict: VERDICTS.PENDING,
      totalTestCasses: hiddenTestCases.length,
      totalTestCases: hiddenTestCases.length,
    });

    const languageId = getLanguageId(language);

    const toSubmitJudge = hiddenTestCases.map((testCase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testCase.input,
      expected_output: testCase.output,
    }));

    // Dispatch batch to Judge0
    const response = await submitTestCase(toSubmitJudge);
    const resultTokens = response.map((value) => value.token);

    // Poll until complete
    const rawResults = await submitTokens(resultTokens);

    // Classify using single pure classifier
    const classified = classifyResult(rawResults, hiddenTestCases, {
      isSubmit: true,
      isHidden: true,
      language,
    });

    // Update submission record with classified verdict & telemetry
    submitToDb.status = classified.verdict;
    submitToDb.verdict = classified.verdict;
    submitToDb.testCasesPassed = classified.passedCases;
    submitToDb.runtime = classified.runtimeMs / 1000;
    submitToDb.memory = classified.memoryKb;
    submitToDb.errorMessage = classified.errorDetails || classified.message || "";
    submitToDb.errorLine = classified.line;
    submitToDb.failedTestIndex = classified.failedTestIndex;
    submitToDb.actualOutput = classified.actualOutput || "";

    await submitToDb.save();

    // Award solve and trigger streak ONLY when fully Accepted
    if (classified.verdict === VERDICTS.ACCEPTED) {
      const user = req.user;
      if (!user.problemSolved.includes(problemId)) {
        user.problemSolved.push(problemId);
        await user.save();
      }

      // Record in streak and daily activity system
      const { recordAcceptedProblem } = require("../services/activityService");
      await recordAcceptedProblem(user._id, problemId, submitToDb._id);
    }

    // Return HTTP 200 with complete classification payload
    return res.status(200).json({
      ...submitToDb.toObject(),
      ...classified,
      status: classified.verdict,
    });
  } catch (error) {
    console.error("[userCodeSubmit] Execution error:", error);
    if (submitToDb) {
      submitToDb.status = VERDICTS.INTERNAL_ERROR;
      submitToDb.verdict = VERDICTS.INTERNAL_ERROR;
      submitToDb.errorMessage = "Something went wrong on our side. Please try again.";
      await submitToDb.save().catch(() => {});
    }

    return res.status(200).json({
      verdict: VERDICTS.INTERNAL_ERROR,
      status: VERDICTS.INTERNAL_ERROR,
      message: "Something went wrong on our side. Please try again.",
      errorDetails: error.message,
      passedCases: 0,
      totalCases: 0,
    });
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !language) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const { visibleTestCases = [] } = problem;
    const languageId = getLanguageId(language);

    const toSubmitJudge = visibleTestCases.map((testCase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testCase.input,
      expected_output: testCase.output,
    }));

    // Dispatch batch to Judge0
    const response = await submitTestCase(toSubmitJudge);
    const resultTokens = response.map((value) => value.token);

    // Poll until complete
    const rawResults = await submitTokens(resultTokens);

    // Classify against visible test cases
    const classified = classifyResult(rawResults, visibleTestCases, {
      isSubmit: false,
      isHidden: false,
      language,
    });

    return res.status(200).json({
      status: classified.verdict,
      verdict: classified.verdict,
      passedTestCases: classified.passedCases,
      totalTestCases: visibleTestCases.length,
      runTime: classified.runtimeMs / 1000,
      memory: classified.memoryKb,
      errorMessage: classified.errorDetails || classified.message || "",
      line: classified.line,
      results: classified.cases,
      ...classified,
    });
  } catch (error) {
    console.error("[runCode] Execution error:", error);
    return res.status(200).json({
      status: VERDICTS.INTERNAL_ERROR,
      verdict: VERDICTS.INTERNAL_ERROR,
      message: "Something went wrong on our side. Please try again.",
      errorMessage: error.message,
      passedTestCases: 0,
      totalTestCases: 0,
      results: [],
    });
  }
};

const getSubmitCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;

    const submit = await Submission.find({ userId, problemId }).sort({ _id: -1 });
    return res.status(200).json(submit);
  } catch (error) {
    console.error("[getSubmitCode] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { userCodeSubmit, runCode, getSubmitCode };
