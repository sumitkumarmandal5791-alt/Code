import React, { useState } from "react";
import {
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Database,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { VERDICTS } from "../utils/verdicts";
import Button from "./ui/Button";

export function normalizeVerdict(v) {
  if (!v) return "";
  const s = String(v).trim().toLowerCase().replace(/_/g, " ");
  if (s.includes("compile") || s.includes("compilation") || s.includes("syntax")) return VERDICTS.COMPILE_ERROR;
  if (s.includes("runtime") || s.includes("sigsegv") || s.includes("sigfpe") || s.includes("sigabrt") || s.includes("nzec") || s.includes("segmentation")) return VERDICTS.RUNTIME_ERROR;
  if (s.includes("time limit") || s.includes("tle")) return VERDICTS.TIME_LIMIT_EXCEEDED;
  if (s.includes("memory limit") || s.includes("mle") || s.includes("sigxfsz")) return VERDICTS.MEMORY_LIMIT_EXCEEDED;
  if (s.includes("output limit") || s.includes("ole")) return VERDICTS.OUTPUT_LIMIT_EXCEEDED;
  if (s.includes("wrong answer") || s === "wa") return VERDICTS.WRONG_ANSWER;
  if (s.includes("internal error")) return VERDICTS.INTERNAL_ERROR;
  if (s.includes("pending")) return VERDICTS.PENDING;
  if (s.includes("running")) return VERDICTS.RUNNING;
  if (s.includes("accept")) return VERDICTS.ACCEPTED;
  return v;
}

export function VerdictDisplay({ result, onJumpToLine, onRetry }) {
  const [copiedError, setCopiedError] = useState(false);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  if (!result) return null;

  const rawVerdict = result.verdict || result.status || "Unknown";
  let verdict = normalizeVerdict(rawVerdict);

  const errorLine = result.errorLine ?? result.line;
  const rawErrorMessage = result.errorMessage || result.errorDetails || result.message || "";

  // Auto-detect compile error if diagnostic markers exist
  if (verdict !== VERDICTS.COMPILE_ERROR && verdict !== VERDICTS.RUNTIME_ERROR) {
    if (rawErrorMessage && (/error:\s+expected/i.test(rawErrorMessage) || /Line \d+: Char \d+:/i.test(rawErrorMessage) || /error generated/i.test(rawErrorMessage))) {
      verdict = VERDICTS.COMPILE_ERROR;
    }
  }

  const isAccepted = verdict === VERDICTS.ACCEPTED || result.passed === true;
  const failedTestIndex = result.failedTestIndex;
  const totalTestCases = result.totalTestCases ?? result.totalCases ?? 1;
  const passedCases = result.testCasesPassed ?? result.passedTestCases ?? result.passedCases ?? 0;
  const casesList = Array.isArray(result.results)
    ? result.results
    : Array.isArray(result.cases)
    ? result.cases
    : [];

  const handleCopyError = async () => {
    if (!rawErrorMessage) return;
    try {
      await navigator.clipboard.writeText(rawErrorMessage);
      setCopiedError(true);
      setTimeout(() => setCopiedError(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const runtimeMs = Math.round((result.runtime ?? result.runTime ?? 0) * 1000);
  const memoryMb = ((result.memory ?? 0) / 1024).toFixed(2);

  // ═══════════════════════════════════════════════════════════════════
  // 1. COMPILE ERROR (Matches LeetCode's exact layout from screenshot)
  // ═══════════════════════════════════════════════════════════════════
  if (verdict === VERDICTS.COMPILE_ERROR) {
    return (
      <div className="space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f87171]">
            Compile Error
          </h2>
          {errorLine && onJumpToLine && (
            <button
              onClick={() => onJumpToLine(errorLine)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#f87171] text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
            >
              <FileCode size={13} />
              <span>Jump to Line {errorLine}</span>
            </button>
          )}
        </div>

        {/* LeetCode Dark Error Card with Top-Right Copy Button */}
        <div className="relative rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 p-4 sm:p-5 shadow-lg">
          <button
            onClick={handleCopyError}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Copy error"
          >
            {copiedError ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          <pre className="text-[#f87171] font-mono text-[13px] leading-relaxed select-text whitespace-pre-wrap pr-10 overflow-x-auto">
            {rawErrorMessage || "1 error generated."}
          </pre>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. RUNTIME ERROR (Matches LeetCode's exact layout)
  // ═══════════════════════════════════════════════════════════════════
  if (verdict === VERDICTS.RUNTIME_ERROR) {
    return (
      <div className="space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f87171]">
              Runtime Error
            </h2>
            {result.signal && (
              <span className="text-xs font-mono text-gray-400">({result.signal})</span>
            )}
          </div>
          {errorLine && onJumpToLine && (
            <button
              onClick={() => onJumpToLine(errorLine)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#f87171] text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
            >
              <FileCode size={13} />
              <span>Jump to Line {errorLine}</span>
            </button>
          )}
        </div>

        {/* LeetCode Dark Error Card */}
        <div className="relative rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 p-4 sm:p-5 shadow-lg">
          <button
            onClick={handleCopyError}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Copy error"
          >
            {copiedError ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          <pre className="text-[#f87171] font-mono text-[13px] leading-relaxed select-text whitespace-pre-wrap pr-10 overflow-x-auto">
            {rawErrorMessage || "Process exited with abnormal termination signal."}
          </pre>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. TIME LIMIT EXCEEDED (LeetCode layout)
  // ═══════════════════════════════════════════════════════════════════
  if (verdict === VERDICTS.TIME_LIMIT_EXCEEDED) {
    return (
      <div className="space-y-3 font-sans">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f87171]">
            Time Limit Exceeded
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            Passed {passedCases} / {totalTestCases} testcases
          </span>
        </div>

        <div className="rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 p-4 sm:p-5 space-y-3 shadow-lg">
          <div className="text-xs text-gray-300 font-medium">
            Your code ran longer than the allowed time limit (&gt; 2.000s) on testcase #{ (failedTestIndex ?? 0) + 1 }.
          </div>

          {result.input && (
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Last Executed Input
              </span>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-gray-200 break-all whitespace-pre-wrap">
                {result.input}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-[11px] text-gray-400 space-y-1">
            <span className="text-gray-300 font-bold block">Optimization Hint:</span>
            <p>• Check for infinite loops (e.g., <code>while</code> loops where loop variables are not modified).</p>
            <p>• Optimize algorithm time complexity (e.g., reduce O(N²) to O(N log N) or O(N) using HashMaps or two-pointer techniques).</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. MEMORY / OUTPUT LIMIT EXCEEDED
  // ═══════════════════════════════════════════════════════════════════
  if (verdict === VERDICTS.MEMORY_LIMIT_EXCEEDED || verdict === VERDICTS.OUTPUT_LIMIT_EXCEEDED) {
    return (
      <div className="space-y-3 font-sans">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f87171]">
          {verdict}
        </h2>
        <div className="rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 p-4 sm:p-5 shadow-lg font-mono text-xs text-[#f87171]">
          {rawErrorMessage || (verdict === VERDICTS.MEMORY_LIMIT_EXCEEDED ? "Memory limit exceeded (> 256MB)." : "Output limit exceeded (> 1MB stdout).")}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. INTERNAL JUDGE ERROR
  // ═══════════════════════════════════════════════════════════════════
  if (verdict === VERDICTS.INTERNAL_ERROR) {
    return (
      <div className="space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-300">
            Internal Error
          </h2>
          {onRetry && (
            <Button size="sm" variant="secondary" onClick={onRetry} className="gap-1.5 text-xs">
              <RotateCcw size={13} />
              <span>Retry Execution</span>
            </Button>
          )}
        </div>
        <div className="rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 p-4 sm:p-5 text-xs text-gray-300 shadow-lg space-y-2">
          <p>The code execution sandbox encountered a temporary issue. This is not a problem with your code.</p>
          <p className="text-gray-400 text-[11px]">Click "Retry Execution" above to re-submit.</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6. WRONG ANSWER (LeetCode's classic 3-card block)
  // ═══════════════════════════════════════════════════════════════════
  if (verdict === VERDICTS.WRONG_ANSWER) {
    return (
      <div className="space-y-4 font-sans">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f87171]">
            Wrong Answer
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            {passedCases} / {totalTestCases} testcases passed
          </span>
        </div>

        {/* 3-Block Comparison */}
        {result.input !== null && result.expectedOutput !== null ? (
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Input
              </span>
              <div className="p-3 rounded-xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 font-mono text-xs break-all text-gray-200 whitespace-pre-wrap">
                {result.input || "<empty input>"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-bold text-[#f87171] uppercase tracking-wider block mb-1">
                  Output
                </span>
                <div className="p-3 rounded-xl bg-[#282828] dark:bg-[#1a1a1a] border border-red-500/20 font-mono text-xs break-all text-[#f87171] font-semibold whitespace-pre-wrap min-h-[46px]">
                  {result.actualOutput !== undefined && result.actualOutput !== null && result.actualOutput !== ""
                    ? result.actualOutput
                    : "<no output>"}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Expected
                </span>
                <div className="p-3 rounded-xl bg-[#282828] dark:bg-[#1a1a1a] border border-emerald-500/20 font-mono text-xs break-all text-emerald-400 font-semibold whitespace-pre-wrap min-h-[46px]">
                  {result.expectedOutput || "<empty output>"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 p-4 sm:p-5 text-xs text-gray-300 space-y-2">
            <span className="text-[#f87171] font-bold block">Hidden Testcase Failed</span>
            <p>Your code returned an incorrect output on hidden testcase #{ (failedTestIndex ?? 0) + 1 }.</p>
            <p className="text-[11px] text-gray-400">Inputs and expected outputs for hidden testcases are masked to prevent hardcoding.</p>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 7. ACCEPTED (LeetCode's clean success layout)
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-500">
          Accepted
        </h2>
        <span className="text-xs text-emerald-500/90 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          All {totalTestCases} testcases passed
        </span>
      </div>

      {/* Runtime & Memory Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Runtime</span>
          <span className="text-lg font-mono font-bold text-gray-100">{runtimeMs} ms</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Memory</span>
          <span className="text-lg font-mono font-bold text-gray-100">{memoryMb} MB</span>
        </div>
      </div>

      {/* Sample Testcases Tabs (if sample run) */}
      {casesList.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Testcases
            </span>
            <div className="flex items-center gap-1.5">
              {casesList.map((r, idx) => {
                const passed = r.is_correct || r.status_id === 3 || r.status === "Accepted" || r.passed === true;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCaseIdx(idx)}
                    className={`px-2.5 py-1 text-xs rounded-xl font-mono font-bold border transition-all cursor-pointer ${
                      selectedCaseIdx === idx
                        ? passed
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-rose-500/20 border-rose-500/40 text-rose-400"
                        : "border-gray-200 dark:border-white/10 text-gray-500 hover:bg-white/5"
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {casesList[selectedCaseIdx] && (
            <div className="p-3.5 rounded-2xl bg-[#282828] dark:bg-[#1a1a1a] border border-white/5 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center text-[11px] pb-1 border-b border-white/5">
                <span className="font-bold text-emerald-400">✓ Passed</span>
                <span className="text-gray-400">{casesList[selectedCaseIdx].time ? `${casesList[selectedCaseIdx].time}s` : ""}</span>
              </div>

              {casesList[selectedCaseIdx].input && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Input:</span>
                  <div className="text-gray-200 break-all">{casesList[selectedCaseIdx].input}</div>
                </div>
              )}

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Output:</span>
                <div className="text-emerald-400 font-semibold break-all">
                  {casesList[selectedCaseIdx].stdout || casesList[selectedCaseIdx].actualOutput || "<no output>"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerdictDisplay;
