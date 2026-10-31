/**
 * Universal Online Judge Verdict Constants (Frontend Mirror)
 */
export const VERDICTS = Object.freeze({
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

export const VERDICT_CONFIG = Object.freeze({
  [VERDICTS.ACCEPTED]: {
    color: "emerald",
    label: "Accepted",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  [VERDICTS.WRONG_ANSWER]: {
    color: "rose",
    label: "Wrong Answer",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  [VERDICTS.COMPILE_ERROR]: {
    color: "amber",
    label: "Compile Error",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  [VERDICTS.RUNTIME_ERROR]: {
    color: "rose",
    label: "Runtime Error",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  [VERDICTS.TIME_LIMIT_EXCEEDED]: {
    color: "orange",
    label: "Time Limit Exceeded",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  [VERDICTS.MEMORY_LIMIT_EXCEEDED]: {
    color: "purple",
    label: "Memory Limit Exceeded",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  [VERDICTS.OUTPUT_LIMIT_EXCEEDED]: {
    color: "yellow",
    label: "Output Limit Exceeded",
    badgeClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  },
  [VERDICTS.INTERNAL_ERROR]: {
    color: "slate",
    label: "Internal Error",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
});

export default VERDICTS;

