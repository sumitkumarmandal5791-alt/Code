import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import Editor from "@monaco-editor/react";
import axiosClient from "../utils/axios";
import {
    Code2,
    Play,
    Send,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    Clock,
    Database,
    Terminal,
    Maximize2,
    Minimize2,
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    PauseCircle,
    Eye,
    EyeOff,
    Keyboard,
    Copy,
    ArrowDownToLine,
    Check,
    FileCode,
    Sparkles,
    BookOpen,
    History,
    X,
    Plus,
    Video,
} from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import AI from "./AI";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { VerdictDisplay } from "../components/VerdictDisplay";
import VideoSolution from "../components/VideoSolution";
import { VERDICTS, VERDICT_CONFIG } from "../utils/verdicts";
import { triggerConfetti } from "../lib/confetti";
import { useTheme } from "../context/ThemeContext";

const LANGUAGES = [
    { id: "cpp", name: "C++" },
    { id: "java", name: "Java" },
    { id: "javascript", name: "JavaScript" },
];

export function ProblemEditor() {
    const { id: problemId } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // Problem State
    const [problem, setProblem] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibleTestCases, setVisibleTestCases] = useState([]);
    const [tags, setTags] = useState([]);
    const [difficulty, setDifficulty] = useState("easy");
    const [hiddenTestCases, setHiddenTestCases] = useState([]);
    const [allProblemIds, setAllProblemIds] = useState([]);

    // Workspace & Editor State
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem(`codebits_lang_${problemId}`) || "cpp";
    });
    const [code, setCode] = useState("");
    const [fontSize, setFontSize] = useState(13);
    const [tabSize, setTabSize] = useState(4);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Navigation & Layout State
    const [activeLeftTab, setActiveLeftTab] = useState("description"); // description | solutions | submissions | ai
    const [mobileTab, setMobileTab] = useState("description"); // description | code | console
    const [activeConsoleTab, setActiveConsoleTab] = useState("testcase"); // testcase | result
    const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
    const [customTestCases, setCustomTestCases] = useState([]);

    // Execution & Submissions State
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [submissionsHistory, setSubmissionsHistory] = useState([]);
    const [inspectingSubmission, setInspectingSubmission] = useState(null);
    const [copiedCode, setCopiedCode] = useState(false);

    // Practice Timer State
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [isTimerVisible, setIsTimerVisible] = useState(true);
    const [showShortcutHelp, setShowShortcutHelp] = useState(false);

    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const consolePanelRef = useRef(null);

    // Update Monaco editor error markers and gutter squiggles
    const updateEditorMarkers = useCallback((errorLine, errorMessage) => {
        if (!editorRef.current || !monacoRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        if (errorLine && Number(errorLine) > 0) {
            const line = Number(errorLine);
            const maxCol = model.getLineMaxColumn(line) || 100;
            monacoRef.current.editor.setModelMarkers(model, "judge", [
                {
                    startLineNumber: line,
                    startColumn: 1,
                    endLineNumber: line,
                    endColumn: maxCol,
                    message: errorMessage || "Compilation/Runtime Error",
                    severity: monacoRef.current.MarkerSeverity.Error,
                },
            ]);
            editorRef.current.revealLineInCenter(line);
        } else {
            monacoRef.current.editor.setModelMarkers(model, "judge", []);
        }
    }, []);

    // Clear Monaco editor markers
    const clearEditorMarkers = useCallback(() => {
        if (!editorRef.current || !monacoRef.current) return;
        const model = editorRef.current.getModel();
        if (model) {
            monacoRef.current.editor.setModelMarkers(model, "judge", []);
        }
    }, []);

    // Jump to specific line in Monaco editor
    const jumpToLine = useCallback((line) => {
        if (!editorRef.current || !line) return;
        const lineNum = Number(line);
        editorRef.current.revealLineInCenter(lineNum);
        editorRef.current.setPosition({ lineNumber: lineNum, column: 1 });
        editorRef.current.focus();
    }, []);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTimer = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Auto-save Code to LocalStorage
    const autoSaveKey = `codebits_code_${problemId}_${language}`;

    useEffect(() => {
        if (!code) return;
        const timeout = setTimeout(() => {
            localStorage.setItem(autoSaveKey, code);
            localStorage.setItem(`codebits_lang_${problemId}`, language);
        }, 500);
        return () => clearTimeout(timeout);
    }, [code, autoSaveKey, problemId, language]);

    // Unsaved changes warning
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty || isRunning || isSubmitting) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty, isRunning, isSubmitting]);

    // Fetch Problem Details & Catalog list for Prev/Next
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const [probRes, allRes] = await Promise.allSettled([
                    axiosClient.get(`admin/ProblemBy/${problemId}`),
                    axiosClient.get("admin/getAllProblem"),
                ]);

                if (probRes.status === "fulfilled") {
                    const data = probRes.value.data;
                    setProblem(data);
                    setTitle(data?.title || "");
                    setDescription(data?.description || "");
                    const initialCases = data?.visibleTestCases || [];
                    setVisibleTestCases(initialCases);
                    setCustomTestCases(initialCases.map((c) => ({ ...c })));
                    setTags(
                        Array.isArray(data?.tags)
                            ? data.tags
                            : typeof data?.tags === "string"
                            ? data.tags.split(",")
                            : []
                    );
                    setDifficulty(data?.difficulty || "easy");
                    setHiddenTestCases(data?.hiddenTestCases || []);

                    // Check saved code first, otherwise fall back to starter code
                    const savedCode = localStorage.getItem(`codebits_code_${problemId}_${language}`);
                    if (savedCode) {
                        setCode(savedCode);
                    } else {
                        const starter = data?.startCode?.find(
                            (sc) => sc.language.toLowerCase() === language
                        );
                        setCode(starter?.initialCode || "// Write your solution here\n");
                    }
                }

                if (allRes.status === "fulfilled" && Array.isArray(allRes.value.data)) {
                    setAllProblemIds(allRes.value.data.map((p) => p._id));
                }
            } catch (err) {
                console.error("Fetch problem error:", err);
                toast.error("Failed to load problem details");
            }
        };

        if (problemId) fetchProblem();
    }, [problemId]);

    // When language changes, restore language-specific saved or starter code
    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        clearEditorMarkers();
        const saved = localStorage.getItem(`codebits_code_${problemId}_${newLang}`);
        if (saved) {
            setCode(saved);
        } else {
            const starter = problem?.startCode?.find(
                (sc) => sc.language.toLowerCase() === newLang
            );
            setCode(starter?.initialCode || "// Write your solution here\n");
        }
    };

    // Prev / Next Navigation
    const currentProblemIndex = allProblemIds.indexOf(problemId);
    const prevProblemId = currentProblemIndex > 0 ? allProblemIds[currentProblemIndex - 1] : null;
    const nextProblemId =
        currentProblemIndex >= 0 && currentProblemIndex < allProblemIds.length - 1
            ? allProblemIds[currentProblemIndex + 1]
            : null;

    // Reset code to starter template
    const handleResetCode = () => {
        if (window.confirm("Reset editor to starter template? Your current edits for this language will be replaced.")) {
            const starter = problem?.startCode?.find(
                (sc) => sc.language.toLowerCase() === language
            );
            const defaultCode = starter?.initialCode || "// Write your solution here\n";
            setCode(defaultCode);
            clearEditorMarkers();
            localStorage.removeItem(autoSaveKey);
            setIsDirty(false);
            toast.success("Code reset to starter template");
        }
    };

    // Fetch past submission history
    const fetchSubmissions = useCallback(async () => {
        try {
            const { data } = await axiosClient.get(`/users/getsubmit/${problemId}`);
            setSubmissionsHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Submissions error:", err);
        }
    }, [problemId]);

    useEffect(() => {
        if (problemId) fetchSubmissions();
    }, [problemId, fetchSubmissions]);

    // Run Code against visible test cases
    const handleRunCode = async () => {
        if (isRunning || isSubmitting) return;
        setIsRunning(true);
        setConsoleOutput(null);
        clearEditorMarkers();
        setActiveConsoleTab("result");
        setMobileTab("console");

        if (consolePanelRef.current) {
            consolePanelRef.current.resize(45);
        }

        try {
            const { data } = await axiosClient.post(`/users/runCode/${problemId}`, {
                code,
                language,
            });

            setConsoleOutput(data);
            const verdict = data.verdict || data.status;

            if (verdict === VERDICTS.ACCEPTED || data.passed === true) {
                toast.success("Test cases executed successfully!");
            } else {
                toast.error(`Execution: ${verdict}`);
                if (data.errorLine) {
                    updateEditorMarkers(data.errorLine, data.errorMessage);
                }
            }
        } catch (err) {
            console.error("Run error:", err);
            const errorPayload = err.response?.data || {
                verdict: VERDICTS.INTERNAL_ERROR,
                status: VERDICTS.INTERNAL_ERROR,
                errorMessage: err.message || "Failed to execute code",
            };
            setConsoleOutput(errorPayload);
            toast.error(errorPayload.errorMessage || "Execution failed");
        } finally {
            setIsRunning(false);
        }
    };

    // Submit Solution against hidden test cases
    const handleSubmit = async () => {
        if (isRunning || isSubmitting) return;
        setIsSubmitting(true);
        setSubmissionResult(null);
        clearEditorMarkers();
        setActiveLeftTab("submissions");
        setMobileTab("description");

        try {
            const { data } = await axiosClient.post(`/users/submit/${problemId}`, {
                code,
                language,
            });

            setSubmissionResult(data);
            fetchSubmissions();
            const verdict = data.verdict || data.status;

            if (verdict === VERDICTS.ACCEPTED || data.passed === true) {
                triggerConfetti();
                toast.success("🎉 Solution Accepted!", { duration: 4000 });
            } else {
                toast.error(`Verdict: ${verdict}`);
                if (data.errorLine) {
                    updateEditorMarkers(data.errorLine, data.errorMessage);
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            const errorPayload = err.response?.data || {
                verdict: VERDICTS.INTERNAL_ERROR,
                status: VERDICTS.INTERNAL_ERROR,
                errorMessage: err.message || "Failed to submit code",
            };
            setSubmissionResult(errorPayload);
            toast.error(errorPayload.errorMessage || "Failed to submit code");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Keyboard Shortcuts (Ctrl+Enter = Run, Ctrl+Shift+Enter = Submit)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSubmit();
                } else {
                    handleRunCode();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [code, language, problemId]);

    // Reference Solution
    const referenceSolution = useMemo(() => {
        if (!problem?.referenceSolution) return "No reference solution available for this problem.";
        const sol = problem.referenceSolution.find(
            (s) => s.language?.toLowerCase() === language
        );
        return sol ? sol.code : "No reference solution available in " + language + ".";
    }, [problem, language]);

    // Copy past submission code
    const handleCopyCode = async (codeText) => {
        try {
            await navigator.clipboard.writeText(codeText);
            setCopiedCode(true);
            toast.success("Code copied to clipboard!");
            setTimeout(() => setCopiedCode(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    // Load past submission into editor
    const handleLoadIntoEditor = (pastCode, pastLang) => {
        if (pastLang && pastLang !== language) {
            setLanguage(pastLang);
        }
        setCode(pastCode);
        clearEditorMarkers();
        setIsDirty(true);
        setInspectingSubmission(null);
        setMobileTab("code");
        toast.success("Loaded submission into editor!");
    };

    // Relative Time Helper
    const formatRelativeTime = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div
            className={`h-screen flex flex-col overflow-hidden bg-[#faf9f6] dark:bg-[#0c0c0c] text-gray-900 dark:text-gray-100 transition-colors ${
                isFullscreen ? "fixed inset-0 z-50" : ""
            }`}
        >
            {/* Top Workspace Header Bar */}
            <header className="h-13 flex-shrink-0 border-b border-gray-200/80 dark:border-white/10 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-20">
                {/* Left: Brand + Problem Title + Prev/Next */}
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 group text-gray-900 dark:text-white"
                        title="Back to Problems"
                    >
                        <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <Code2 size={18} />
                        </div>
                    </Link>

                    {/* Prev / Next Buttons */}
                    <div className="flex items-center gap-1 border-l border-gray-200 dark:border-white/10 pl-3">
                        <button
                            disabled={!prevProblemId}
                            onClick={() => prevProblemId && navigate(`/problem-editor/${prevProblemId}`)}
                            title="Previous Problem"
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={!nextProblemId}
                            onClick={() => nextProblemId && navigate(`/problem-editor/${nextProblemId}`)}
                            title="Next Problem"
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <h1 className="text-xs sm:text-sm font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md text-gray-900 dark:text-white">
                        {title || "Loading problem..."}
                    </h1>
                </div>

                {/* Right: Timer + Run/Submit Group + Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Practice Session Timer */}
                    {isTimerVisible && (
                        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">
                            <Clock size={13} className="text-gray-400" />
                            <span>{formatTimer(timerSeconds)}</span>
                            <button
                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                                className="p-0.5 hover:text-red-500 text-gray-400 cursor-pointer"
                                title={isTimerRunning ? "Pause timer" : "Resume timer"}
                            >
                                {isTimerRunning ? <PauseCircle size={13} /> : <PlayCircle size={13} />}
                            </button>
                        </div>
                    )}

                    {/* Keyboard Shortcuts Dialog Trigger */}
                    <button
                        onClick={() => setShowShortcutHelp(true)}
                        title="Keyboard Shortcuts"
                        className="hidden sm:flex p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <Keyboard size={15} />
                    </button>

                    {/* Run Button */}
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleRunCode}
                        isLoading={isRunning}
                        disabled={isRunning || isSubmitting}
                        title="Run code against sample testcases (Ctrl+Enter)"
                        className="gap-1.5 text-xs font-bold"
                    >
                        <Play size={13} className="fill-current" />
                        <span>Run</span>
                    </Button>

                    {/* Submit Button */}
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={isRunning || isSubmitting}
                        title="Submit code against all testcases (Ctrl+Shift+Enter)"
                        className="gap-1.5 text-xs font-bold"
                    >
                        <Send size={13} />
                        <span>Submit</span>
                    </Button>
                </div>
            </header>

            {/* Mobile Tab Switcher (<1024px) */}
            <div className="flex lg:hidden border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] px-2">
                {[
                    { id: "description", label: "Description" },
                    { id: "code", label: "Code" },
                    { id: "console", label: "Output & Console" },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setMobileTab(t.id)}
                        className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors cursor-pointer ${
                            mobileTab === t.id
                                ? "border-red-600 text-red-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Main Content: Desktop Resizable Panels OR Mobile Stacked Views */}
            <main className="flex-1 overflow-hidden relative">
                <div className="h-full hidden lg:block">
                    <Group orientation="horizontal" autoSaveId="codebits_workspace_panels">
                        {/* ══════════ LEFT PANE: Description, Solutions, Submissions, AI ══════════ */}
                        <Panel defaultSize={42} minSize={25} className="flex flex-col h-full bg-white dark:bg-[#121212]">
                            {/* Left Pane Navigation Tabs */}
                            <nav className="flex items-center justify-between border-b border-gray-200/80 dark:border-white/10 px-2 bg-gray-50/50 dark:bg-white/[0.01]">
                                <div className="flex items-center gap-1">
                                    {[
                                        { id: "description", label: "Description", icon: BookOpen },
                                        { id: "solutions", label: "Solution", icon: FileCode },
                                        { id: "video", label: "Video Solution", icon: Video },
                                        { id: "submissions", label: "Submissions", icon: History },
                                        { id: "ai", label: "AI Tutor", icon: Sparkles },
                                    ].map((t) => {
                                        const Icon = t.icon;
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => setActiveLeftTab(t.id)}
                                                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                                                    activeLeftTab === t.id
                                                        ? "border-red-600 text-red-600 dark:text-red-500"
                                                        : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                                                }`}
                                            >
                                                <Icon size={14} />
                                                <span>{t.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </nav>

                            {/* Left Pane Content Body */}
                            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                                {activeLeftTab === "description" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                                                {title}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                <Badge variant={difficulty}>{difficulty}</Badge>
                                                {tags.map((t) => (
                                                    <span
                                                        key={t}
                                                        className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full"
                                                    >
                                                        {t.trim()}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Markdown Problem Description */}
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                                                <ReactMarkdown>{description}</ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Sample Visible Test Cases */}
                                        {visibleTestCases.length > 0 && (
                                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                    Examples
                                                </h3>
                                                {visibleTestCases.map((tc, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 space-y-2 text-xs font-mono"
                                                    >
                                                        <div className="font-bold text-gray-500 font-sans text-[11px]">
                                                            Example {idx + 1}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-gray-400 w-16 flex-shrink-0">Input:</span>
                                                            <span className="text-gray-800 dark:text-gray-200 break-all">{tc.input}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-gray-400 w-16 flex-shrink-0">Output:</span>
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold break-all">{tc.output}</span>
                                                        </div>
                                                        {tc.explanation && (
                                                            <p className="text-[11px] font-sans text-gray-500 pt-1 border-t border-dashed border-gray-200 dark:border-white/5">
                                                                <strong className="text-gray-400">Explanation: </strong>
                                                                {tc.explanation}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeLeftTab === "solutions" && (
                                    <div className="space-y-4 h-full flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                Reference Solution ({language})
                                            </h3>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleCopyCode(referenceSolution)}
                                                className="gap-1 text-xs"
                                            >
                                                {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                                <span>{copiedCode ? "Copied" : "Copy"}</span>
                                            </Button>
                                        </div>
                                        <div className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden min-h-[300px]">
                                            <Editor
                                                height="100%"
                                                language={language}
                                                value={referenceSolution}
                                                theme={isDark ? "vs-dark" : "light"}
                                                options={{
                                                    readOnly: true,
                                                    fontSize: 13,
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeLeftTab === "video" && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Video size={16} className="text-red-500" />
                                                    <span>Video Solution</span>
                                                </h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    Step-by-step algorithmic explanation and code walkthrough
                                                </p>
                                            </div>
                                            {problem?.video?.videoId && (
                                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                                                    Official
                                                </span>
                                            )}
                                        </div>
                                        <VideoSolution video={problem?.video} />
                                    </div>
                                )}

                                {activeLeftTab === "submissions" && (
                                    <div className="space-y-4">
                                        {/* Latest Submission Result Banner */}
                                        {submissionResult && (
                                            <VerdictDisplay
                                                result={submissionResult}
                                                onJumpToLine={jumpToLine}
                                                onRetry={handleSubmit}
                                            />
                                        )}

                                        {/* Submissions History Table */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                Submission History
                                            </h3>
                                            <button
                                                onClick={fetchSubmissions}
                                                className="text-xs text-red-600 hover:underline cursor-pointer"
                                            >
                                                Refresh
                                            </button>
                                        </div>

                                        {submissionsHistory.length === 0 ? (
                                            <div className="p-8 text-center text-xs text-gray-400">
                                                No submissions made yet for this problem.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {submissionsHistory.map((sub, idx) => {
                                                    const verdict = sub.verdict || sub.status || "Unknown";
                                                    const isAcc = verdict === VERDICTS.ACCEPTED;
                                                    const config = VERDICT_CONFIG[verdict] || {
                                                        badgeClass: isAcc ? "text-emerald-500" : "text-rose-500",
                                                    };
                                                    return (
                                                        <div
                                                            key={sub._id || idx}
                                                            onClick={() => setInspectingSubmission(sub)}
                                                            className="p-3 rounded-xl border border-gray-200/80 dark:border-white/5 hover:border-red-500/40 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between cursor-pointer transition-all"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                {isAcc ? (
                                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                                ) : (
                                                                    <AlertCircle size={16} className="text-rose-500" />
                                                                )}
                                                                <div>
                                                                    <div
                                                                        className={`text-xs font-bold ${
                                                                            isAcc ? "text-emerald-500" : "text-rose-500"
                                                                        }`}
                                                                    >
                                                                        {verdict}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-400">
                                                                        {formatRelativeTime(sub.createdAt)}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-right text-[11px] text-gray-500">
                                                                <div className="font-semibold capitalize">{sub.language}</div>
                                                                {isAcc && sub.runtime !== undefined && (
                                                                    <div>{Math.round((sub.runtime || 0) * 1000)}ms</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeLeftTab === "ai" && <AI isDarkMode={isDark} />}
                            </div>
                        </Panel>

                        {/* Drag Handle Separator */}
                        <Separator className="w-1.5 bg-gray-200 dark:bg-white/10 hover:bg-red-500 transition-colors cursor-col-resize" />

                        {/* ══════════ RIGHT PANE: Monaco Editor + Bottom Console ══════════ */}
                        <Panel defaultSize={58} minSize={30} className="flex flex-col h-full">
                            <Group orientation="vertical" autoSaveId="codebits_console_panels">
                                {/* Top Half: Monaco Code Editor */}
                                <Panel defaultSize={68} minSize={20} className="flex flex-col bg-white dark:bg-[#141414]">
                                    {/* Editor Controls Bar */}
                                    <div className="h-10 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200/80 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02]">
                                        <div className="flex items-center gap-3">
                                            {/* Language Selector */}
                                            <select
                                                value={language}
                                                onChange={(e) => handleLanguageChange(e.target.value)}
                                                className="bg-transparent text-xs font-bold text-gray-800 dark:text-gray-200 border-none focus:outline-none cursor-pointer"
                                            >
                                                {LANGUAGES.map((l) => (
                                                    <option key={l.id} value={l.id} className="dark:bg-[#1a1a1a]">
                                                        {l.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Font Size Selector */}
                                            <select
                                                value={fontSize}
                                                onChange={(e) => setFontSize(Number(e.target.value))}
                                                className="bg-transparent text-[11px] text-gray-500 border-none focus:outline-none cursor-pointer hidden sm:block"
                                                title="Font size"
                                            >
                                                <option value={12} className="dark:bg-[#1a1a1a]">12px</option>
                                                <option value={13} className="dark:bg-[#1a1a1a]">13px</option>
                                                <option value={14} className="dark:bg-[#1a1a1a]">14px</option>
                                                <option value={16} className="dark:bg-[#1a1a1a]">16px</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Reset to starter code */}
                                            <button
                                                onClick={handleResetCode}
                                                title="Reset code to default"
                                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                            >
                                                <RotateCcw size={13} />
                                            </button>

                                            {/* Fullscreen Toggle */}
                                            <button
                                                onClick={() => setIsFullscreen(!isFullscreen)}
                                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                            >
                                                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Monaco Editor Component */}
                                    <div className="flex-1 overflow-hidden">
                                        <Editor
                                            height="100%"
                                            language={language}
                                            value={code}
                                            theme={isDark ? "vs-dark" : "light"}
                                            onChange={(val) => {
                                                setCode(val || "");
                                                setIsDirty(true);
                                                clearEditorMarkers();
                                            }}
                                            onMount={(editor, monaco) => {
                                                editorRef.current = editor;
                                                monacoRef.current = monaco;
                                            }}
                                            options={{
                                                fontSize,
                                                tabSize,
                                                minimap: { enabled: false },
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                                                padding: { top: 12 },
                                            }}
                                        />
                                    </div>
                                </Panel>

                                {/* Console Resizable Separator */}
                                <Separator className="h-1.5 bg-gray-200 dark:bg-white/10 hover:bg-red-500 transition-colors cursor-row-resize" />

                                {/* Bottom Half: Console & Execution Output */}
                                <Panel defaultSize={32} minSize={15} ref={consolePanelRef} className="flex flex-col bg-white dark:bg-[#101010]">
                                    {/* Console Tabs */}
                                    <div className="h-9 flex-shrink-0 flex items-center justify-between px-3 border-b border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setActiveConsoleTab("testcase")}
                                                className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                                                    activeConsoleTab === "testcase"
                                                        ? "border-red-600 text-red-600 dark:text-red-500"
                                                        : "border-transparent text-gray-500 hover:text-gray-800"
                                                }`}
                                            >
                                                Testcase
                                            </button>
                                            <button
                                                onClick={() => setActiveConsoleTab("result")}
                                                className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                                                    activeConsoleTab === "result"
                                                        ? "border-red-600 text-red-600 dark:text-red-500"
                                                        : "border-transparent text-gray-500 hover:text-gray-800"
                                                }`}
                                            >
                                                Result
                                            </button>
                                        </div>

                                        <span className="text-[10px] font-mono text-gray-400">
                                            {isRunning ? "Running..." : "Console ready"}
                                        </span>
                                    </div>

                                    {/* Console Panel Body */}
                                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin font-mono text-xs">
                                        {activeConsoleTab === "testcase" && (
                                            <div className="space-y-3">
                                                {/* Case Selector Tabs */}
                                                <div className="flex items-center gap-2">
                                                    {customTestCases.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSelectedCaseIndex(idx)}
                                                            className={`px-3 py-1 text-xs rounded-xl font-semibold border transition-all cursor-pointer ${
                                                                selectedCaseIndex === idx
                                                                    ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                                                                    : "border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                                                            }`}
                                                        >
                                                            Case {idx + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Selected Case Editable Inputs */}
                                                {customTestCases[selectedCaseIndex] && (
                                                    <div className="space-y-2 pt-1">
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                                                                Input:
                                                            </label>
                                                            <textarea
                                                                rows={2}
                                                                value={customTestCases[selectedCaseIndex].input || ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setCustomTestCases((prev) => {
                                                                        const copy = [...prev];
                                                                        copy[selectedCaseIndex].input = val;
                                                                        return copy;
                                                                    });
                                                                }}
                                                                className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-red-500 font-mono"
                                                            />
                                                        </div>

                                                        {customTestCases[selectedCaseIndex].output && (
                                                            <div>
                                                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                                                                    Expected Output:
                                                                </label>
                                                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                                                    {customTestCases[selectedCaseIndex].output}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeConsoleTab === "result" && (
                                            <div>
                                                {isRunning ? (
                                                    <div className="flex items-center gap-2 text-red-500 py-6 justify-center font-sans font-semibold">
                                                        <span className="loading loading-spinner loading-sm" />
                                                        <span>Executing your code against test cases...</span>
                                                    </div>
                                                ) : !consoleOutput ? (
                                                    <div className="text-gray-400 py-8 text-center font-sans italic">
                                                        Click &quot;Run&quot; or press <kbd className="font-mono bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">Ctrl+Enter</kbd> to inspect output.
                                                    </div>
                                                ) : (
                                                    <VerdictDisplay
                                                        result={consoleOutput}
                                                        onJumpToLine={jumpToLine}
                                                        onRetry={handleRunCode}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                            </Group>
                        </Panel>
                    </Group>
                </div>

                {/* Mobile View: Render only active tab on small screens */}
                <div className="h-full block lg:hidden p-4 overflow-y-auto">
                    {mobileTab === "description" && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold">{title}</h2>
                            <div className="flex gap-2">
                                <Badge variant={difficulty}>{difficulty}</Badge>
                            </div>
                            <div className="prose prose-sm dark:prose-invert">
                                <ReactMarkdown>{description}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {mobileTab === "code" && (
                        <div className="h-[500px] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                theme={isDark ? "vs-dark" : "light"}
                                onChange={(val) => {
                                    setCode(val || "");
                                    setIsDirty(true);
                                    clearEditorMarkers();
                                }}
                                onMount={(editor, monaco) => {
                                    if (!editorRef.current) {
                                        editorRef.current = editor;
                                        monacoRef.current = monaco;
                                    }
                                }}
                                options={{ fontSize: 13, minimap: { enabled: false } }}
                            />
                        </div>
                    )}

                    {mobileTab === "console" && (
                        <div className="space-y-3 font-mono text-xs">
                            <h3 className="font-bold text-sm">Execution Verdict &amp; Output</h3>
                            {consoleOutput ? (
                                <VerdictDisplay
                                    result={consoleOutput}
                                    onJumpToLine={jumpToLine}
                                    onRetry={handleRunCode}
                                />
                            ) : (
                                <p className="text-gray-400 font-sans">Click &quot;Run&quot; above to execute code.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Inspect Past Submission Code Modal */}
            {inspectingSubmission && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setInspectingSubmission(null)}
                >
                    <div
                        className="w-full max-w-3xl bg-white dark:bg-[#151515] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>Submission Code</span>
                                    <Badge
                                        variant={
                                            (inspectingSubmission.verdict || inspectingSubmission.status) === VERDICTS.ACCEPTED
                                                ? "easy"
                                                : "hard"
                                        }
                                    >
                                        {inspectingSubmission.verdict || inspectingSubmission.status}
                                    </Badge>
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                                    <span>Submitted {new Date(inspectingSubmission.createdAt).toLocaleString()} in <strong className="capitalize text-gray-700 dark:text-gray-300">{inspectingSubmission.language}</strong></span>
                                    {inspectingSubmission.runtime !== undefined && (
                                        <span>• {Math.round(inspectingSubmission.runtime * 1000)}ms</span>
                                    )}
                                    {inspectingSubmission.memory !== undefined && inspectingSubmission.memory > 0 && (
                                        <span>• {((inspectingSubmission.memory || 0) / 1024).toFixed(2)} MB</span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => setInspectingSubmission(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Only show error message banner if submission actually failed */}
                        {(inspectingSubmission.verdict || inspectingSubmission.status) !== VERDICTS.ACCEPTED &&
                            inspectingSubmission.errorMessage && (
                                <div className="px-6 py-3 bg-rose-500/[0.08] border-b border-rose-500/20 text-rose-500 font-mono text-xs whitespace-pre-wrap max-h-36 overflow-y-auto">
                                    {inspectingSubmission.errorMessage}
                                </div>
                        )}

                        {/* Code Editor Area with explicit height & automatic layout */}
                        <div className="w-full h-[420px] bg-white dark:bg-[#121212] relative overflow-hidden">
                            <Editor
                                height="420px"
                                language={inspectingSubmission.language}
                                value={inspectingSubmission.code}
                                theme={isDark ? "vs-dark" : "light"}
                                options={{
                                    readOnly: true,
                                    fontSize: 13,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                                    lineNumbers: "on",
                                    renderLineHighlight: "all",
                                    padding: { top: 12, bottom: 12 },
                                    folding: true,
                                    domReadOnly: true,
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleCopyCode(inspectingSubmission.code)}
                                className="gap-1.5"
                            >
                                <Copy size={13} />
                                <span>Copy Code</span>
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                    handleLoadIntoEditor(
                                        inspectingSubmission.code,
                                        inspectingSubmission.language
                                    )
                                }
                                className="gap-1.5"
                            >
                                <ArrowDownToLine size={13} />
                                <span>Load into Editor</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Shortcuts Dialog */}
            {showShortcutHelp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setShowShortcutHelp(false)}
                >
                    <div
                        className="w-full max-w-sm bg-white dark:bg-[#151515] rounded-3xl border border-gray-200 dark:border-white/10 p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Keyboard size={16} className="text-red-500" />
                                <span>Keyboard Shortcuts</span>
                            </h3>
                            <button
                                onClick={() => setShowShortcutHelp(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                                <span className="text-gray-600 dark:text-gray-300">Run Code</span>
                                <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-white/10 font-mono font-bold">
                                    Ctrl + Enter
                                </kbd>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                                <span className="text-gray-600 dark:text-gray-300">Submit Code</span>
                                <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-white/10 font-mono font-bold">
                                    Ctrl + Shift + Enter
                                </kbd>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                                <span className="text-gray-600 dark:text-gray-300">Fullscreen Toggle</span>
                                <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-white/10 font-mono font-bold">
                                    F11
                                </kbd>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProblemEditor;
