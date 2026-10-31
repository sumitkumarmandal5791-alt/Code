const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const mongoose = require("mongoose");
const Submission = require("../Modles/submitSchema");
const { VERDICTS } = require("../utils/verdicts");

describe("Submission Schema Validation Test", () => {
  it("validates that VERDICTS.PENDING ('Pending') is accepted by the status enum", () => {
    const sub = new Submission({
      userId: new mongoose.Types.ObjectId(),
      problemId: new mongoose.Types.ObjectId(),
      code: "console.log('hello')",
      language: "javascript",
      status: VERDICTS.PENDING,
      verdict: VERDICTS.PENDING,
    });

    const error = sub.validateSync();
    assert.equal(error, undefined, "Expected no validation error for VERDICTS.PENDING");
  });

  it("validates all standard verdict enum values", () => {
    const statusesToTest = [
      VERDICTS.PENDING,
      VERDICTS.RUNNING,
      VERDICTS.ACCEPTED,
      VERDICTS.WRONG_ANSWER,
      VERDICTS.COMPILE_ERROR,
      VERDICTS.RUNTIME_ERROR,
      VERDICTS.TIME_LIMIT_EXCEEDED,
      VERDICTS.MEMORY_LIMIT_EXCEEDED,
      VERDICTS.OUTPUT_LIMIT_EXCEEDED,
      VERDICTS.INTERNAL_ERROR,
      "pending",
    ];

    for (const status of statusesToTest) {
      const sub = new Submission({
        userId: new mongoose.Types.ObjectId(),
        problemId: new mongoose.Types.ObjectId(),
        code: "int main() {}",
        language: "cpp",
        status: status,
      });

      const err = sub.validateSync();
      assert.equal(err, undefined, `Expected status '${status}' to be valid in schema`);
    }
  });
});

