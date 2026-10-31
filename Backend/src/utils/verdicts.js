/**
 * Universal Online Judge Verdict Constants
 */
const VERDICTS = Object.freeze({
  PENDING: "Pending",
  RUNNING: "Running",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  COMPILE_ERROR: "Compile Error",
  RUNTIME_ERROR: "Runtime Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
  OUTPUT_LIMIT_EXCEEDED: "Output Limit Exceeded",
  INTERNAL_ERROR: "Internal Error",
});

const JUDGE0_STATUS = Object.freeze({
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  SIGSEGV: 7,
  SIGXFSZ: 8,
  SIGFPE: 9,
  SIGABRT: 10,
  NZEC: 11,
  OTHER_RUNTIME_ERROR: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
});

module.exports = {
  VERDICTS,
  JUDGE0_STATUS,
};

