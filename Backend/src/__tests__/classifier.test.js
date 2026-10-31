const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const {
  classifyResult,
  classifySingleCase,
  normalizeOutput,
  decodeText,
} = require("../utils/judgeClassifier");
const { VERDICTS, JUDGE0_STATUS } = require("../utils/verdicts");

describe("Online Judge Classifier Test Suite", () => {
  // Test 1: Syntax error (missing semicolon / bracket) -> COMPILE_ERROR with line number
  it("Scenario 1: maps Judge0 status 6 and compile_output to COMPILE_ERROR with line number", () => {
    const rawCase = {
      status_id: JUDGE0_STATUS.COMPILATION_ERROR,
      status: { id: 6, description: "Compilation Error" },
      compile_output: Buffer.from("solution.cpp:14:5: error: expected ';' before '}' token\n }").toString("base64"),
      stdout: null,
      stderr: null,
    };

    const result = classifySingleCase(rawCase, "42", false, "cpp", 0);
    assert.equal(result.verdict, VERDICTS.COMPILE_ERROR);
    assert.equal(result.line, 14);
    assert.ok(result.errorDetails.includes("expected ';'"));
    assert.equal(result.passed, false);
  });

  // Test 2: Runtime exception (NZEC / Python NameError) -> RUNTIME_ERROR
  it("Scenario 2: maps NZEC and exception traceback to RUNTIME_ERROR", () => {
    const rawCase = {
      status_id: JUDGE0_STATUS.NZEC,
      status: { id: 11, description: "Runtime Error (NZEC)" },
      stderr: "Traceback (most recent call last):\n  File \"solution.py\", line 7, in <module>\nNameError: name 'x' is not defined",
      stdout: "",
    };

    const result = classifySingleCase(rawCase, "42", false, "python", 0);
    assert.equal(result.verdict, VERDICTS.RUNTIME_ERROR);
    assert.equal(result.line, 7);
    assert.ok(result.message.includes("NameError"));
    assert.equal(result.passed, false);
  });

  // Test 3: Division by zero (SIGFPE) -> RUNTIME_ERROR with arithmetic exception
  it("Scenario 3: maps SIGFPE to RUNTIME_ERROR with Arithmetic Exception", () => {
    const rawCase = {
      status_id: JUDGE0_STATUS.SIGFPE,
      status: { id: 9, description: "Runtime Error (SIGFPE)" },
      stderr: "Floating point exception (core dumped)",
      stdout: "",
    };

    const result = classifySingleCase(rawCase, "42", false, "cpp", 0);
    assert.equal(result.verdict, VERDICTS.RUNTIME_ERROR);
    assert.ok(result.message.includes("Arithmetic Exception"));
    assert.equal(result.passed, false);
  });

  // Test 4: Infinite loop / timeout -> TIME_LIMIT_EXCEEDED
  it("Scenario 4: maps Judge0 status 5 to TIME_LIMIT_EXCEEDED", () => {
    const rawCase = {
      status_id: JUDGE0_STATUS.TIME_LIMIT_EXCEEDED,
      status: { id: 5, description: "Time Limit Exceeded" },
      time: "2.05",
      stdout: "",
      stderr: "",
    };

    const result = classifySingleCase(rawCase, "42", false, "cpp", 0);
    assert.equal(result.verdict, VERDICTS.TIME_LIMIT_EXCEEDED);
    assert.equal(result.passed, false);
    assert.ok(result.runtimeMs >= 2000);
  });

  // Test 5: Out of memory (std::bad_alloc / MemoryError) -> MEMORY_LIMIT_EXCEEDED
  it("Scenario 5: detects out-of-memory exceptions as MEMORY_LIMIT_EXCEEDED", () => {
    const rawCase = {
      status_id: JUDGE0_STATUS.OTHER_RUNTIME_ERROR,
      status: { id: 12, description: "Runtime Error (Other)" },
      stderr: "terminate called after throwing an instance of 'std::bad_alloc'\nwhat(): std::bad_alloc",
      stdout: "",
    };

    const result = classifySingleCase(rawCase, "42", false, "cpp", 0);
    assert.equal(result.verdict, VERDICTS.MEMORY_LIMIT_EXCEEDED);
    assert.equal(result.passed, false);
  });

  // Test 6: Endless output (>1MB) -> OUTPUT_LIMIT_EXCEEDED
  it("Scenario 6: detects output exceeding 1MB as OUTPUT_LIMIT_EXCEEDED", () => {
    const massiveStdout = "A".repeat(1024 * 1024 + 10);
    const rawCase = {
      status_id: JUDGE0_STATUS.ACCEPTED,
      stdout: massiveStdout,
      stderr: "",
    };

    const result = classifySingleCase(rawCase, "A", false, "cpp", 0);
    assert.equal(result.verdict, VERDICTS.OUTPUT_LIMIT_EXCEEDED);
    assert.equal(result.passed, false);
  });

  // Test 7: Output mismatch vs trailing whitespace -> WRONG_ANSWER vs ACCEPTED
  it("Scenario 7: distinguishes genuine output mismatch from trailing whitespace/CRLF", () => {
    // 7a: Trailing spaces / newline difference should be ACCEPTED
    const acceptedCase = {
      status_id: JUDGE0_STATUS.ACCEPTED,
      stdout: "42\r\n  \n",
    };
    const resA = classifySingleCase(acceptedCase, "42\n", false, "cpp", 0);
    assert.equal(resA.verdict, VERDICTS.ACCEPTED);
    assert.equal(resA.passed, true);

    // 7b: Real value mismatch should be WRONG_ANSWER
    const wrongCase = {
      status_id: JUDGE0_STATUS.ACCEPTED,
      stdout: "43\n",
    };
    const resB = classifySingleCase(wrongCase, "42\n", false, "cpp", 0);
    assert.equal(resB.verdict, VERDICTS.WRONG_ANSWER);
    assert.equal(resB.passed, false);
  });

  // Test 8: Judge0 unavailable / status 13 -> INTERNAL_ERROR
  it("Scenario 8: maps status 13 or empty batch results to INTERNAL_ERROR without blaming user", () => {
    const rawCase = {
      status_id: JUDGE0_STATUS.INTERNAL_ERROR,
      status: { id: 13, description: "Internal Error" },
      stderr: "",
      stdout: "",
    };

    const result = classifySingleCase(rawCase, "42", false, "cpp", 0);
    assert.equal(result.verdict, VERDICTS.INTERNAL_ERROR);
    assert.ok(result.message.includes("went wrong on our side"));
    assert.equal(result.passed, false);

    // Empty batch array
    const batchResult = classifyResult([], [{ input: "1", output: "2" }]);
    assert.equal(batchResult.verdict, VERDICTS.INTERNAL_ERROR);
  });

  // Test 9: Hidden testcase protection (never leaks input/output on hidden failure)
  it("Scenario 9: masks input, expectedOutput, and actualOutput when isHidden is true", () => {
    const rawResults = [
      { status_id: 3, stdout: "10\n" }, // Case 1 passes
      { status_id: 4, stdout: "15\n" }, // Case 2 fails
    ];
    const hiddenCases = [
      { input: "secret_1", output: "10" },
      { input: "secret_2_super_confidential", output: "20" },
    ];

    const classified = classifyResult(rawResults, hiddenCases, {
      isSubmit: true,
      isHidden: true,
      language: "cpp",
    });

    assert.equal(classified.verdict, VERDICTS.WRONG_ANSWER);
    assert.equal(classified.failedTestIndex, 1);
    // CRITICAL SECURITY ASSERTION: No hidden data leaked
    assert.equal(classified.input, "");
    assert.equal(classified.expectedOutput, "");
    assert.equal(classified.actualOutput, "");
    assert.ok(classified.message.includes("Failed on testcase 2 of 2"));
  });

  // Test 10: Wrapper line offset math (extracts and subtracts lineOffset correctly)
  it("Scenario 10: calculates user line number by subtracting wrapper line offset", () => {
    const rawCase = {
      status_id: JUDGE0_STATUS.COMPILATION_ERROR,
      compile_output: "wrapper.cpp:25:10: error: 'ans' was not declared in this scope",
    };

    // If wrapper injected 10 lines of header before user code, user error is line 15
    const result = classifySingleCase(rawCase, "output", false, "cpp", 10);
    assert.equal(result.verdict, VERDICTS.COMPILE_ERROR);
    assert.equal(result.line, 15);
  });
});

