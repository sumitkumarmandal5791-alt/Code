const { VERDICTS, JUDGE0_STATUS } = require("./verdicts");

const MAX_OUTPUT_LENGTH = 10 * 1024; // 10 KB cap

/**
 * Normalizes string for fair comparison (trims trailing whitespace, normalizes CRLF)
 */
function normalizeOutput(str) {
  if (typeof str !== "string") return "";
  return str.replace(/\r\n/g, "\n").trim();
}

/**
 * Safely decodes string from Judge0 (handles base64 or plain text)
 */
function decodeText(val) {
  if (!val) return "";
  if (typeof val !== "string") return String(val);
  const cleaned = val.replace(/\s+/g, "");
  // Check if string looks like valid base64
  if (cleaned && /^[A-Za-z0-9+/]+={0,2}$/.test(cleaned) && cleaned.length % 4 === 0) {
    try {
      const decoded = Buffer.from(cleaned, "base64").toString("utf8");
      // Verify decoded contains printable characters
      if (/^[\s\x20-\x7E\u00A0-\uFFFF]*$/.test(decoded)) {
        return decoded;
      }
    } catch {
      return val;
    }
  }
  return val;
}

/**
 * Truncate long outputs
 */
function truncateOutput(text, maxLen = MAX_OUTPUT_LENGTH) {
  if (!text) return { text: "", truncated: false };
  if (text.length > maxLen) {
    return {
      text: text.slice(0, maxLen) + "\n... [Output truncated to 10 KB]",
      truncated: true,
    };
  }
  return { text, truncated: false };
}

/**
 * Formats compiler output into clean LeetCode-style diagnostics:
 * "main.cpp:17:33: error: ..." -> "Line 17: Char 33: error: ..."
 */
function formatLeetCodeDiagnostics(rawText, lineOffset = 0) {
  if (!rawText) return "";
  let text = String(rawText);

  // Strip temporary Linux sandbox directory paths
  text = text.replace(/\/tmp\/[a-zA-Z0-9_\-\.\/]+/g, "solution.cpp");
  text = text.replace(/\/usr\/[a-zA-Z0-9_\-\.\/]+/g, "");

  // Convert "main.cpp:17:33:" or "solution.cpp:17:33:" into "Line 17: Char 33:"
  text = text.replace(/(?:main|solution|[a-zA-Z0-9_-]+)\.(cpp|c|cc|cxx|h|hpp|java|js|py):(\d+):(\d+):/gi, (match, ext, line, col) => {
    const adjustedLine = Math.max(1, parseInt(line, 10) - lineOffset);
    return `Line ${adjustedLine}: Char ${col}:`;
  });

  // Convert "main.cpp:17:" into "Line 17:"
  text = text.replace(/(?:main|solution|[a-zA-Z0-9_-]+)\.(cpp|c|cc|cxx|h|hpp|java|js|py):(\d+):/gi, (match, ext, line) => {
    const adjustedLine = Math.max(1, parseInt(line, 10) - lineOffset);
    return `Line ${adjustedLine}:`;
  });

  return text.trim();
}

/**
 * Clean compiler / error line numbers and sanitize internal file paths
 */
function extractErrorLineAndMessage(errorOutput, language = "cpp", lineOffset = 0) {
  if (!errorOutput) return { line: null, cleanMessage: "" };

  let line = null;
  const cleaned = errorOutput
    .replace(/\/tmp\/[a-zA-Z0-9_-]+\/?/g, "")
    .replace(/[a-zA-Z0-9_\-\\/]+\.(cpp|java|js|py):/g, "");

  // Match line patterns: "line 12", ":12:4:", "Line 12:"
  const lineMatch =
    errorOutput.match(/:(\d+):\d+:/) ||
    errorOutput.match(/line (\d+)/i) ||
    errorOutput.match(/Line (\d+)/);

  if (lineMatch && lineMatch[1]) {
    const rawLine = parseInt(lineMatch[1], 10);
    line = Math.max(1, rawLine - lineOffset);
  }

  // Extract clean summary message
  let cleanMessage = cleaned.trim();
  if (language === "python") {
    const lines = cleanMessage.split("\n").filter(Boolean);
    if (lines.length > 0) {
      cleanMessage = lines[lines.length - 1]; // Last line of Python traceback
    }
  } else if (cleanMessage.length > 500) {
    cleanMessage = cleanMessage.slice(0, 500) + "...";
  }

  return { line, cleanMessage };
}

/**
 * Classifies a single testcase result from Judge0
 */
function classifySingleCase(rawCase, expectedOutput = "", isHidden = false, language = "cpp", lineOffset = 0) {
  const statusId = rawCase.status_id || rawCase.status?.id || JUDGE0_STATUS.INTERNAL_ERROR;
  const rawStdout = decodeText(rawCase.stdout);
  const rawStderr = decodeText(rawCase.stderr);
  const rawCompileOutput = decodeText(rawCase.compile_output);
  const rawMessage = decodeText(rawCase.message);

  const timeSeconds = parseFloat(rawCase.time || 0);
  const runtimeMs = Math.round(timeSeconds * 1000);
  const memoryKb = parseInt(rawCase.memory || 0, 10);

  // 1. Output limit check
  if (rawStdout.length > 1024 * 1024) {
    return {
      verdict: VERDICTS.OUTPUT_LIMIT_EXCEEDED,
      message: "Output Limit Exceeded: Standard output exceeded 1 MB limit.",
      errorDetails: "Stdout cap exceeded.",
      runtimeMs,
      memoryKb,
      actualOutput: "",
      expectedOutput: "",
      passed: false,
    };
  }

  // 2. COMPILE_ERROR (Compiler output or Python/Node SyntaxError)
  const isSyntaxOrCompileError =
    statusId === JUDGE0_STATUS.COMPILATION_ERROR ||
    (rawCompileOutput && rawCompileOutput.trim().length > 0) ||
    (rawStderr && (/SyntaxError:/i.test(rawStderr) || /IndentationError:/i.test(rawStderr) || /error:\s+expected/i.test(rawStderr)));

  if (isSyntaxOrCompileError) {
    const errorSource = (rawCompileOutput && rawCompileOutput.trim().length > 0) ? rawCompileOutput : rawStderr;
    const { line, cleanMessage } = extractErrorLineAndMessage(errorSource, language, lineOffset);
    const formattedDiagnostics = formatLeetCodeDiagnostics(errorSource, lineOffset);
    return {
      verdict: VERDICTS.COMPILE_ERROR,
      message: formattedDiagnostics || cleanMessage || "Compilation Error: Please check your syntax.",
      errorDetails: formattedDiagnostics || errorSource,
      line,
      runtimeMs,
      memoryKb,
      actualOutput: "",
      expectedOutput: "",
      passed: false,
    };
  }

  // 3. TIME_LIMIT_EXCEEDED
  if (statusId === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED || (rawMessage && rawMessage.includes("Time Limit Exceeded"))) {
    return {
      verdict: VERDICTS.TIME_LIMIT_EXCEEDED,
      message: "Time Limit Exceeded: Your solution exceeded the allowed execution time limit.",
      errorDetails: rawMessage || "Time Limit Exceeded",
      runtimeMs,
      memoryKb,
      actualOutput: isHidden ? "" : rawStdout,
      expectedOutput: isHidden ? "" : expectedOutput,
      passed: false,
    };
  }

  // 4. MEMORY_LIMIT_EXCEEDED
  if (
    statusId === JUDGE0_STATUS.SIGXFSZ ||
    rawStderr.includes("std::bad_alloc") ||
    rawStderr.includes("MemoryError") ||
    rawStderr.includes("heap out of memory")
  ) {
    return {
      verdict: VERDICTS.MEMORY_LIMIT_EXCEEDED,
      message: "Memory Limit Exceeded: Your solution exceeded the allowed memory limit.",
      errorDetails: rawStderr || "Out of memory",
      runtimeMs,
      memoryKb,
      actualOutput: "",
      expectedOutput: "",
      passed: false,
    };
  }

  // 5. RUNTIME_ERROR (SIGSEGV, SIGFPE, SIGABRT, NZEC, etc.)
  if (
    (statusId >= JUDGE0_STATUS.SIGSEGV && statusId <= JUDGE0_STATUS.OTHER_RUNTIME_ERROR) ||
    statusId === JUDGE0_STATUS.EXEC_FORMAT_ERROR ||
    rawStderr.trim().length > 0
  ) {
    let friendlyReason = "Runtime Error";
    if (statusId === JUDGE0_STATUS.SIGSEGV) friendlyReason = "Segmentation Fault (Invalid memory access)";
    else if (statusId === JUDGE0_STATUS.SIGFPE) friendlyReason = "Arithmetic Exception (Division by zero)";
    else if (statusId === JUDGE0_STATUS.SIGABRT) friendlyReason = "Aborted (Failed assertion or exception)";
    else if (statusId === JUDGE0_STATUS.NZEC) friendlyReason = "Non-Zero Exit Code (Uncaught Exception)";

    const { line, cleanMessage } = extractErrorLineAndMessage(rawStderr, language, lineOffset);
    const formattedDiagnostics = formatLeetCodeDiagnostics(rawStderr, lineOffset);

    const fullMessage = formattedDiagnostics
      ? (formattedDiagnostics.includes(friendlyReason) ? formattedDiagnostics : `${friendlyReason}: ${formattedDiagnostics}`)
      : (cleanMessage ? `${friendlyReason}: ${cleanMessage}` : friendlyReason);

    return {
      verdict: VERDICTS.RUNTIME_ERROR,
      message: fullMessage,
      errorDetails: formattedDiagnostics || rawStderr || friendlyReason,
      line,
      runtimeMs,
      memoryKb,
      actualOutput: isHidden ? "" : rawStdout,
      expectedOutput: isHidden ? "" : expectedOutput,
      passed: false,
    };
  }

  // 6. INTERNAL_ERROR
  if (statusId === JUDGE0_STATUS.INTERNAL_ERROR) {
    return {
      verdict: VERDICTS.INTERNAL_ERROR,
      message: "Something went wrong on our side. Please try again.",
      errorDetails: "Judge sandbox internal failure",
      runtimeMs,
      memoryKb,
      actualOutput: "",
      expectedOutput: "",
      passed: false,
    };
  }

  // 7. ACCEPTED vs WRONG_ANSWER
  const isMatch = normalizeOutput(rawStdout) === normalizeOutput(expectedOutput);
  if (statusId === JUDGE0_STATUS.ACCEPTED && isMatch) {
    return {
      verdict: VERDICTS.ACCEPTED,
      message: "Accepted",
      errorDetails: "",
      runtimeMs,
      memoryKb,
      actualOutput: isHidden ? "" : rawStdout,
      expectedOutput: isHidden ? "" : expectedOutput,
      passed: true,
    };
  }

  // Otherwise Wrong Answer
  return {
    verdict: VERDICTS.WRONG_ANSWER,
    message: "Wrong Answer",
    errorDetails: "",
    runtimeMs,
    memoryKb,
    actualOutput: isHidden ? "" : rawStdout,
    expectedOutput: isHidden ? "" : expectedOutput,
    passed: false,
  };
}

/**
 * Main pure classification function across batch test cases
 *
 * @param {Array} rawResults - Array of Judge0 submission objects
 * @param {Array} testCases - Array of problem test case definitions [{ input, output }]
 * @param {Object} options - { isSubmit: boolean, isHidden: boolean, language: string, lineOffset: number }
 */
function classifyResult(rawResults = [], testCases = [], options = {}) {
  const { isSubmit = false, isHidden = false, language = "cpp", lineOffset = 0 } = options;

  if (!Array.isArray(rawResults) || rawResults.length === 0) {
    return {
      verdict: VERDICTS.INTERNAL_ERROR,
      message: "No execution response received from judge sandbox.",
      errorDetails: "Empty batch result",
      line: null,
      failedTestIndex: 0,
      input: "",
      expectedOutput: "",
      actualOutput: "",
      runtimeMs: 0,
      memoryKb: 0,
      passedCases: 0,
      totalCases: testCases.length,
      cases: [],
    };
  }

  let passedCases = 0;
  let maxRuntime = 0;
  let maxMemory = 0;
  let firstFailingResult = null;
  const processedCases = [];

  for (let i = 0; i < rawResults.length; i++) {
    const rawCase = rawResults[i];
    const tc = testCases[i] || {};
    const singleResult = classifySingleCase(rawCase, tc.output || "", isHidden, language, lineOffset);

    singleResult.index = i;
    singleResult.input = isHidden ? "" : tc.input || "";
    maxRuntime = Math.max(maxRuntime, singleResult.runtimeMs);
    maxMemory = Math.max(maxMemory, singleResult.memoryKb);

    if (singleResult.passed) {
      passedCases++;
    } else if (!firstFailingResult) {
      firstFailingResult = { ...singleResult, failedTestIndex: i };
      // On SUBMIT, stop at first failing test case
      if (isSubmit) {
        processedCases.push(singleResult);
        break;
      }
    }

    processedCases.push(singleResult);
  }

  // If all cases passed
  if (passedCases === testCases.length && testCases.length > 0) {
    return {
      verdict: VERDICTS.ACCEPTED,
      message: "All test cases passed successfully!",
      errorDetails: "",
      line: null,
      failedTestIndex: null,
      input: "",
      expectedOutput: "",
      actualOutput: "",
      runtimeMs: maxRuntime,
      memoryKb: maxMemory,
      passedCases,
      totalCases: testCases.length,
      cases: processedCases,
    };
  }

  // A test case failed: report the first failure
  const failure = firstFailingResult || processedCases[0];

  const cleanMessage =
    failure.verdict === VERDICTS.COMPILE_ERROR || failure.verdict === VERDICTS.INTERNAL_ERROR
      ? failure.message
      : isHidden
      ? `Failed on testcase ${failure.index + 1} of ${testCases.length}: ${failure.message}`
      : failure.message;

  return {
    verdict: failure.verdict,
    message: cleanMessage,
    errorDetails: failure.errorDetails,
    line: failure.line,
    failedTestIndex: failure.index,
    input: failure.input,
    expectedOutput: failure.expectedOutput,
    actualOutput: failure.actualOutput,
    runtimeMs: maxRuntime,
    memoryKb: maxMemory,
    passedCases,
    totalCases: testCases.length,
    cases: processedCases,
  };
}

module.exports = {
  classifyResult,
  classifySingleCase,
  normalizeOutput,
  decodeText,
};

