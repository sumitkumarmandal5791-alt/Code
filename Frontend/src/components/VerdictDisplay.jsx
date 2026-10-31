import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Database,
  Terminal,
  FileCode,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { VERDICTS, VERDICT_CONFIG } from "../utils/verdicts";
import Button from "./ui/Button";

export function VerdictDisplay({ result, onJumpToLine, onRetry }) {
  const [copiedError, setCopiedError] = useState(false);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  if (!result) return null;

  const verdict = result.verdict || result.status || "Unknown";
  const isAccepted = verdict === VERDICTS.ACCEPTED || result.passed === true;
  const config = VERDICT_CONFIG[verdict] || {
    color: "slate",
    label: verdict,
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const errorLine = result.errorLine ?? result.line;
  const errorMessage = result.errorMessage || result.errorDetails || result.message || "";
  const failedTestIndex = result.failedTestIndex;
  const totalTestCases = result.totalTestCases ?? result.totalCases;
  const passedCases = result.testCasesPassed ?? result.passedTestCases ?? result.passedCases;
  const casesList = Array.isArray(result.results)
    ? result.results
    : Array.isArray(result.cases)
    ? result.cases
    : [];

  const handleCopyError = async () => {
    if (!errorMessage) return;
    try {
      await navigator.clipboard.writeText(errorMessage);
      setCopiedError(true);
      setTimeout(() => setCopiedError(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  // Header icon by verdict
  const renderVerdictIcon = () => {
    switch (verdict) {
      case VERDICTS.ACCEPTED:
        return <CheckCircle2 size={22} className="text-emerald-500" />;
      case VERDICTS.COMPILE_ERROR:
        return <FileCode size={22} className="text-amber-500" />;
      case VERDICTS.RUNTIME_ERROR:
        return <AlertTriangle size={22} className="text-rose-500" />;
      case VERDICTS.TIME_LIMIT_EXCEEDED:
        return <Clock size={22} className="text-orange-500" />;
      case VERDICTS.MEMORY_LIMIT_EXCEEDED:
        return <Database size={22} className="text-purple-500" />;
      case VERDICTS.OUTPUT_LIMIT_EXCEEDED:
        return <Terminal size={22} className="text-yellow-500" />;
      case VERDICTS.INTERNAL_ERROR:
        return <AlertCircle size={22} className="text-slate-400" />;
      case VERDICTS.WRONG_ANSWER:
      default:
        return <XCircle size={22} className="text-rose-500" />;
    }
  };

  const runtimeMs = Math.round((result.runtime ?? result.runTime ?? 0) * 1000);
  const memoryMb = ((result.memory ?? 0) / 1024).toFixed(2);

  return (
    <div className="space-y-4 font-sans">
      {/* ─── Top Verdict Banner ─── */}
      <div
        className={`p-4 rounded-2xl border ${
          isAccepted
            ? "bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            : verdict === VERDICTS.COMPILE_ERROR
            ? "bg-amber-500/[0.08] border-amber-500/30 text-amber-600 dark:text-amber-400"
            : verdict === VERDICTS.TIME_LIMIT_EXCEEDED
            ? "bg-orange-500/[0.08] border-orange-500/30 text-orange-600 dark:text-orange-400"
            : verdict === VERDICTS.MEMORY_LIMIT_EXCEEDED
            ? "bg-purple-500/[0.08] border-purple-500/30 text-purple-600 dark:text-purple-400"
            : verdict === VERDICTS.INTERNAL_ERROR
            ? "bg-slate-500/[0.08] border-slate-500/30 text-slate-600 dark:text-slate-300"
            : "bg-rose-500/[0.08] border-rose-500/30 text-rose-600 dark:text-rose-400"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {renderVerdictIcon()}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">{verdict}</h3>
                {result.signal && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-rose-500/20 text-rose-600 dark:text-rose-300">
                    {result.signal}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isAccepted
                  ? `All ${totalTestCases || "sample"} test cases passed successfully.`
                  : failedTestIndex !== undefined && failedTestIndex >= 0
                  ? `Failed on testcase ${failedTestIndex + 1} of ${totalTestCases || 1}`
                  : errorMessage
                  ? "Execution failed with error"
                  : "Submission finished with verdict"}
              </p>
            </div>
          </div>

          {/* Error Line Quick Jump */}
          {errorLine && onJumpToLine && (
            <button
              onClick={() => onJumpToLine(errorLine)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCode size={13} />
              <span>Jump to Line {errorLine}</span>
            </button>
          )}

          {/* Internal Error Retry */}
          {verdict === VERDICTS.INTERNAL_ERROR && onRetry && (
            <Button size="sm" variant="secondary" onClick={onRetry} className="gap-1.5 text-xs">
              <RotateCcw size={13} />
              <span>Retry Execution</span>
            </Button>
          )}
        </div>

        {/* Runtime & Memory Metrics */}
        {(runtimeMs > 0 || Number(memoryMb) > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-black/5 dark:border-white/10 text-xs">
            <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Runtime</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {runtimeMs} ms
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Memory</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {memoryMb} MB
              </span>
            </div>
            {totalTestCases && (
              <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/5 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Passed</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {passedCases ?? (isAccepted ? totalTestCases : failedTestIndex ?? 0)} / {totalTestCases}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── COMPILE ERROR DIAGNOSTICS ─── */}
      {verdict === VERDICTS.COMPILE_ERROR && errorMessage && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Compiler Diagnostics
            </span>
            <button
              onClick={handleCopyError}
              className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
            >
              {copiedError ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copiedError ? "Copied" : "Copy Log"}</span>
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-900 text-gray-200 font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed whitespace-pre-wrap">
            {errorMessage}
          </div>
          <p className="text-[11px] text-gray-400 italic">
            Tip: Check the compiler output for missing semicolons, unmatched braces, or misspelled variable and function names.
          </p>
        </div>
      )}

      {/* ─── RUNTIME ERROR DETAILS ─── */}
      {verdict === VERDICTS.RUNTIME_ERROR && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Runtime Error Trace
            </span>
            {errorMessage && (
              <button
                onClick={handleCopyError}
                className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedError ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedError ? "Copied" : "Copy Trace"}</span>
              </button>
            )}
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-900 text-rose-300 font-mono text-xs overflow-x-auto border border-rose-950/50 leading-relaxed whitespace-pre-wrap">
            {errorMessage || "Process terminated abnormally."}
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/70 dark:border-white/5 text-xs text-gray-600 dark:text-gray-400">
            <strong className="text-gray-800 dark:text-gray-200">Common Causes:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
              <li><strong>SIGSEGV:</strong> Array out-of-bounds access, null pointer dereference, or infinite recursion stack overflow.</li>
              <li><strong>SIGFPE:</strong> Division by zero or integer modulo by zero.</li>
              <li><strong>NZEC:</strong> Unhandled exception thrown (e.g. KeyError, IndexError, TypeError) or non-zero exit code.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ─── TIME LIMIT EXCEEDED HINT ─── */}
      {verdict === VERDICTS.TIME_LIMIT_EXCEEDED && (
        <div className="p-4 rounded-2xl bg-orange-500/[0.05] border border-orange-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold">
            <Clock size={16} />
            <span>Time Limit Exceeded (&gt; 2.0s per test case)</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Your algorithm took longer than the allowed CPU time limit on testcase #{ (result.failedTestIndex ?? 0) + 1 }.
          </p>
          <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-orange-500/10 text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
            <strong className="text-gray-700 dark:text-gray-200">Optimization Checklist:</strong>
            <p>1. Check for infinite loops (e.g. <code>while</code> condition that never updates its pointer).</p>
            <p>2. Analyze time complexity. An O(N²) solution on N = 10⁵ takes ~10¹⁰ ops (seconds). Try reducing to O(N log N) or O(N).</p>
            <p>3. Use fast I/O or efficient data structures (HashMaps, Two Pointers, Prefix Sums).</p>
          </div>
        </div>
      )}

      {/* ─── MEMORY LIMIT EXCEEDED HINT ─── */}
      {verdict === VERDICTS.MEMORY_LIMIT_EXCEEDED && (
        <div className="p-4 rounded-2xl bg-purple-500/[0.05] border border-purple-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold">
            <Database size={16} />
            <span>Memory Limit Exceeded (&gt; 256 MB)</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Your program allocated more memory than the sandbox allows.
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Tip: Avoid holding large multi-dimensional arrays, deep recursion without base cases, or unbounded object creation.
          </p>
        </div>
      )}

      {/* ─── OUTPUT LIMIT EXCEEDED HINT ─── */}
      {verdict === VERDICTS.OUTPUT_LIMIT_EXCEEDED && (
        <div className="p-4 rounded-2xl bg-yellow-500/[0.05] border border-yellow-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold">
            <Terminal size={16} />
            <span>Output Limit Exceeded (&gt; 1 MB stdout)</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Your program printed too much text to standard output. Check for debug print/console.log statements inside loops.
          </p>
        </div>
      )}

      {/* ─── INTERNAL JUDGE ERROR ─── */}
      {verdict === VERDICTS.INTERNAL_ERROR && (
        <div className="p-4 rounded-2xl bg-slate-500/[0.05] border border-slate-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
            <AlertCircle size={16} />
            <span>Judge Sandbox Unavailable</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            The code execution sandbox encountered a temporary internal error. Your code was not rejected. Please click Retry to submit again.
          </p>
        </div>
      )}

      {/* ─── WRONG ANSWER: 3-BLOCK COMPARISON ─── */}
      {verdict === VERDICTS.WRONG_ANSWER && (
        <div className="space-y-3">
          {result.input !== null && result.expectedOutput !== null ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Input
                </label>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 font-mono text-xs break-all text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {result.input || "<empty input>"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1">
                    Your Output
                  </label>
                  <div className="p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 font-mono text-xs break-all text-rose-600 dark:text-rose-400 font-semibold whitespace-pre-wrap min-h-[46px]">
                    {result.actualOutput !== undefined && result.actualOutput !== null && result.actualOutput !== ""
                      ? result.actualOutput
                      : "<no output>"}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">
                    Expected Output
                  </label>
                  <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 font-mono text-xs break-all text-emerald-600 dark:text-emerald-400 font-semibold whitespace-pre-wrap min-h-[46px]">
                    {result.expectedOutput || "<empty output>"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/15 text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                <XCircle size={15} />
                <span>Hidden Testcase Failed</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Your code produced an incorrect answer on hidden testcase #{ (result.failedTestIndex ?? 0) + 1 }.
                Inputs and expected outputs for hidden testcases are masked to prevent hardcoding.
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Tip: Test edge cases such as empty inputs, negative numbers, single-element arrays, duplicate values, and maximum/minimum bounds.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── SAMPLE RUN: INTERACTIVE TESTCASE TABS (if casesList exists) ─── */}
      {casesList.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Sample Testcases
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
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400"
                        : "border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {casesList[selectedCaseIdx] && (
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center text-[11px] pb-1 border-b border-gray-200/60 dark:border-white/5">
                <span
                  className={`font-bold ${
                    casesList[selectedCaseIdx].is_correct || casesList[selectedCaseIdx].status_id === 3 || casesList[selectedCaseIdx].passed === true
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {casesList[selectedCaseIdx].is_correct || casesList[selectedCaseIdx].status_id === 3 || casesList[selectedCaseIdx].passed === true
                    ? "✓ Passed"
                    : "✗ Failed"}
                </span>
                <span className="text-gray-400">
                  {casesList[selectedCaseIdx].time ? `${casesList[selectedCaseIdx].time}s` : ""}
                </span>
              </div>

              {casesList[selectedCaseIdx].input && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Input:</span>
                  <div className="text-gray-800 dark:text-gray-200 break-all">
                    {casesList[selectedCaseIdx].input}
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Your Output:</span>
                <div className="text-gray-800 dark:text-gray-200 break-all">
                  {casesList[selectedCaseIdx].stdout || casesList[selectedCaseIdx].actualOutput || "<no output>"}
                </div>
              </div>

              {(casesList[selectedCaseIdx].expected_output || casesList[selectedCaseIdx].expectedOutput) && (
                <div>
                  <span className="text-emerald-500 block text-[10px] uppercase font-bold">Expected Output:</span>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold break-all">
                    {casesList[selectedCaseIdx].expected_output || casesList[selectedCaseIdx].expectedOutput}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerdictDisplay;
