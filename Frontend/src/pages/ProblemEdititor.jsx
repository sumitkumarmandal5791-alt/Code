import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import Editor from '@monaco-editor/react';
import axiosClinet from "../utils/axios";
import { Code2, Play, Send, RotateCcw, CheckCircle2, AlertCircle, Clock, Database, Terminal } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import toast from 'react-hot-toast';
import AI from './AI';
import ReactMarkdown from 'react-markdown';

function ProblemEditor() {
    const params = useParams();
    const problemId = params.id;

    // Problem State
    const [problem, setProblem] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibleTestCases, setVisibleTestCases] = useState([]);
    const [tags, setTags] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [submitCode, setSubmitCode] = useState([]);
    const [hiddenTestCases, setHiddenTestCases] = useState([]);

    // Editor State
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);
    const [activeTab, setActiveTab] = useState('description');
    const [referenceSolution, setReferenceSolution] = useState(null);

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [submissionsHistory, setSubmissionsHistory] = useState([]);

    const editorRef = useRef(null);
    const consolePanelRef = useRef(null);

    const languages = [
        { id: 'javascript', name: 'JavaScript' },
        { id: 'java', name: 'Java' },
        { id: 'cpp', name: 'C++' }
    ];

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const { data } = await axiosClinet.get(`admin/ProblemBy/${problemId}`);
                setProblem(data);
                setTitle(data?.title);
                setDescription(data?.description);
                setVisibleTestCases(data?.visibleTestCases || []);
                setTags(data?.tags);
                setDifficulty(data?.difficulty);
                setHiddenTestCases(data?.hiddenTestCases || []);

                // Initialize code with starter code for default language
                const starter = data?.startCode?.find(sc => sc.language.toLowerCase() === language);
                if (starter) {
                    setCode(starter.initialCode);
                }
            } catch (error) {
                console.error("Error fetching problem:", error);
                toast.error("Failed to load problem details");
            }
        };
        if (problemId) fetchProblem();
    }, [problemId]);

    // Update code when language changes
    useEffect(() => {
        if (problem?.startCode) {
            const starter = problem.startCode.find(sc => sc.language.toLowerCase() === language);
            if (starter) {
                setCode(starter.initialCode);
            } else {
                setCode('// No starter code available for this language');
            }
        }
    }, [language, problem]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setConsoleOutput(null);
        setActiveTab('console');
        if (consolePanelRef.current) {
            consolePanelRef.current.resize(50);
        }

        try {
            const { data } = await axiosClinet.post(`/users/runCode/${problemId}`, {
                code,
                language
            });

            setConsoleOutput(data);
            if (data.status === 'Accepted') {
                toast.success('Code executed successfully!');
            } else {
                toast.error(`Execution failed: ${data.status}`);
            }
        } catch (error) {
            console.error("Run code error:", error);
            toast.error(error.response?.data || "Failed to run code");
            setConsoleOutput({ error: error.message });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setSubmissionResult(null);

        try {
            const { data } = await axiosClinet.post(`/users/submit/${problemId}`, {
                code,
                language
            });

            setSubmissionResult(data);
            getSubmitCode(); // Refresh history
            if (data.status === 'Accepted') {
                toast.success('Solution Accepted!');
            } else {
                toast.error(`Submission: ${data.status}`);
            }
            setActiveTab('submission');
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to submit solution");
        } finally {
            setIsRunning(false);
        }
    };

    useEffect(() => {
        getSubmitCode();
    }, []);

    const getSubmitCode = async () => {
        try {
            const { data } = await axiosClinet.get(`/users/getsubmit/${problemId}`);
            setSubmissionsHistory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to fetch past submissions");
        }
    };

    const getReferenceSolution = () => {
        if (!problem?.referenceSolution) return "No reference solution available.";
        const sol = problem.referenceSolution.find(s => s.language.toLowerCase() === language);
        return sol ? sol.code : "No reference solution for this language.";
    };

    // Style configs for premium colors
    // Premium dark mode: Deep obsidian black (#0d0d0d), dark card borders, clean monospace elements.
    // Premium light mode: Soft warm white (#faf8f6), light warm borders, comfortable text color that doesn't kill the eye.
    const darkThemeStyles = {
        bg: 'bg-[#0d0d0d] text-gray-200',
        headerBg: 'bg-[#121212] border-[#222222]',
        tabBg: 'bg-[#121212] border-[#222222]',
        contentBg: 'bg-[#0d0d0d]',
        cardBg: 'bg-[#151515] border-[#252525]',
        border: 'border-[#222222]',
        separator: 'bg-[#222222] hover:bg-red-600',
        btnRun: 'bg-[#1c1c1e] hover:bg-[#2c2c2e] text-gray-300 border border-[#2c2c2e]',
        textMuted: 'text-gray-500',
        divider: 'border-gray-800'
    };

    const lightThemeStyles = {
        bg: 'bg-[#faf9f6] text-[#2c2c2a]',
        headerBg: 'bg-[#ffffff] border-[#e8e6e0]',
        tabBg: 'bg-[#ffffff] border-[#e8e6e0]',
        contentBg: 'bg-[#faf9f6]',
        cardBg: 'bg-[#ffffff] border-[#e8e6e0]',
        border: 'border-[#e8e6e0]',
        separator: 'bg-[#e8e6e0] hover:bg-red-500',
        btnRun: 'bg-[#f4f2ec] hover:bg-[#e9e6dd] text-[#4c4c4a] border border-[#e3e0d5]',
        textMuted: 'text-[#8a877e]',
        divider: 'border-gray-200'
    };

    const styles = isDarkMode ? darkThemeStyles : lightThemeStyles;

    return (

        <div className={`h-screen flex flex-col ${styles.bg}`}>
            {/* Header */}
            <div className={`h-14 border-b flex items-center justify-between px-4 ${styles.headerBg}`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-500/10 p-1.5 rounded-lg text-red-600">
                            <Code2 size={20} />
                        </div>
                        <h1 className="font-bold text-lg hidden md:block tracking-tight text-red-600">CodeBits</h1>
                    </div>
                    <div className="h-6 w-px bg-gray-300/40 mx-2"></div>
                    <h2 className="font-semibold text-sm truncate max-w-[200px] md:max-w-md">{title}</h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className={`p-2 rounded-lg transition-colors hover:bg-red-500/5`}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        title={isDarkMode ? "Light Mode" : "Dark Mode"}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>

                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-all text-xs ${isRunning ? 'opacity-50 cursor-not-allowed' : ''} ${styles.btnRun}`}
                        onClick={handleRunCode}
                        disabled={isRunning}
                    >
                        <Play size={14} />
                        Run
                    </button>

                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-semibold transition-all text-xs ${isRunning ? 'opacity-50 cursor-not-allowed' : ''} bg-red-600 hover:bg-red-700 text-white shadow-sm`}
                        onClick={handleSubmit}
                        disabled={isRunning}
                    >
                        <Send size={14} />
                        Submit
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow overflow-hidden">
                <Group orientation="horizontal">
                    {/* Left Panel: Description / Solutions */}
                    <Panel defaultSize={40} minSize={30}>
                        <div className="h-full flex flex-col">
                            <div className={`flex border-b ${styles.tabBg}`}>
                                {['description', 'solutions', 'submission', 'editorial', 'Ai'].map((tab) => (
                                    <button
                                        key={tab}
                                        className={`px-4 py-3 font-semibold text-xs transition-all border-b-2 capitalize ${activeTab === tab ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-red-500'}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab === 'Ai' ? 'AI Assistant' : tab}
                                    </button>
                                ))}
                            </div>

                            <div className={`flex-grow overflow-y-auto p-5 ${styles.contentBg}`}>
                                {activeTab === 'description' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h1 className="text-2xl font-bold tracking-tight mb-2">{title}</h1>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
                                                    ${difficulty === 'easy' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                                                        difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
                                                            'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                                                    {difficulty || 'Easy'}
                                                </span>
                                                {(Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',') : []).map(tag => (
                                                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Separation and Spacing for description components */}
                                            <div className="prose max-w-none dark:prose-invert">
                                                <div className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
                                                    Question Description
                                                </div>
                                                <div className="text-sm leading-relaxed prose prose-neutral dark:prose-invert max-w-none">
                                                    <ReactMarkdown>
                                                        {(() => {
                                                            // Split description to prevent Constraints from rendering inside it
                                                            const parts = description.split(/(?=###?\s*Constraints|Constraints:)/i);
                                                            return parts[0] || '';
                                                        })()}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className={styles.divider} />

                                        <div className="space-y-5">
                                            <div className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                                Examples & Instructions
                                            </div>
                                            {visibleTestCases.map((testCase, index) => (
                                                <div key={index} className={`rounded-xl p-4 border transition-all ${styles.cardBg}`}>
                                                    <h3 className="font-bold text-xs uppercase tracking-wider text-red-600 mb-3">Example {index + 1}:</h3>
                                                    <div className="space-y-2.5 text-xs font-mono">
                                                        <div className="flex gap-2 items-start">
                                                            <span className={styles.textMuted}>Input:</span>
                                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{testCase.input}</span>
                                                        </div>
                                                        <div className="flex gap-2 items-start">
                                                            <span className={styles.textMuted}>Output:</span>
                                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{testCase.output}</span>
                                                        </div>
                                                        {testCase.explanation && (
                                                            <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-800 mt-2">
                                                                <span className={`${styles.textMuted} block mb-1 text-[10px] uppercase font-sans tracking-wide`}>Explanation:</span>
                                                                <p className="text-gray-700 dark:text-gray-300 font-sans leading-relaxed">{testCase.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Constraints section moved to the bottom and styled beautifully */}
                                        {description.match(/(?=###?\s*Constraints|Constraints:)/i) && (
                                            <>
                                                <hr className={styles.divider} />
                                                <div className="space-y-3">
                                                    <div className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                                        Constraints & Limitations
                                                    </div>
                                                    <div className={`rounded-xl p-4 border ${styles.cardBg} bg-red-500/[0.01] border-red-500/10`}>
                                                        <div className="text-xs leading-relaxed prose prose-neutral dark:prose-invert max-w-none">
                                                            <ReactMarkdown>
                                                                {(() => {
                                                                    const match = description.match(/(###?\s*Constraints|Constraints:[\s\S]*)/i);
                                                                    // Remove the Constraints header text itself if needed, leaving only items
                                                                    const rawConstraints = match ? match[1] : '';
                                                                    return rawConstraints.replace(/###?\s*Constraints:?/i, '').trim();
                                                                })()}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'solutions' && (
                                    <div className="h-full flex flex-col">
                                        <h2 className="text-base font-bold mb-4">Reference Solution</h2>
                                        <div className="flex-grow border rounded-lg overflow-hidden border-gray-200 dark:border-gray-800">
                                            <Editor
                                                height="100%"
                                                language={language}
                                                theme={isDarkMode ? 'vs-dark' : 'light'}
                                                value={getReferenceSolution()}
                                                options={{
                                                    readOnly: true,
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                    fontSize: 13,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'submission' && (
                                    <div className="h-full flex flex-col">
                                        {submissionResult ? (
                                            /* Single Submission Details View */
                                            <div className="space-y-6">
                                                <button
                                                    onClick={() => setSubmissionResult(null)}
                                                    className="text-xs text-red-600 hover:text-red-500 font-semibold flex items-center gap-1 mb-2"
                                                >
                                                    ← Back to all submissions
                                                </button>

                                                <div className={`p-4 rounded-xl border ${submissionResult.status === 'Accepted' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {submissionResult.status === 'Accepted' ? <CheckCircle2 className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                                                        <h2 className={`text-lg font-bold ${submissionResult.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {submissionResult.status}
                                                        </h2>
                                                    </div>

                                                    {submissionResult.status === 'Accepted' && (
                                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                                            <div className={`p-3 rounded-lg border ${styles.cardBg}`}>
                                                                <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Clock size={12} /> Runtime</div>
                                                                <div className="text-base font-mono font-bold">{Math.round(submissionResult.runtime * 1000) || 0}ms</div>
                                                            </div>
                                                            <div className={`p-3 rounded-lg border ${styles.cardBg}`}>
                                                                <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Database size={12} /> Memory</div>
                                                                <div className="text-base font-mono font-bold">{(submissionResult.memory / 1024).toFixed(2)} MB</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {submissionResult.errorMessage && (
                                                        <div className="p-3 rounded-lg mt-4 font-mono text-xs text-red-500 bg-red-500/5 border border-red-500/10 whitespace-pre-wrap">
                                                            {atob(submissionResult.errorMessage || '')}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="text-sm font-semibold">Test Cases</h3>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {Array.from({ length: submissionResult.totalTestCases || 0 }).map((_, i) => (
                                                            <div key={i} className={`h-8 w-8 rounded flex items-center justify-center text-xs font-bold 
                                                         ${i < submissionResult.testCasesPassed ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                                                                {i + 1}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Passed {submissionResult.testCasesPassed || 0} of {hiddenTestCases.length || 0} test cases
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Submissions History List View */
                                            <div className="space-y-4">
                                                <h2 className="text-base font-bold">Submission History</h2>
                                                {submissionsHistory.length === 0 ? (
                                                    <div className="text-center text-gray-400 py-10 text-xs">
                                                        No Submission yet
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {submissionsHistory.map((sub, idx) => (
                                                            <div
                                                                key={sub._id || idx}
                                                                onClick={() => setSubmissionResult(sub)}
                                                                className={`p-3.5 rounded-xl border cursor-pointer hover:border-red-500/40 transition-colors flex items-center justify-between ${styles.cardBg}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={sub.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}>
                                                                        {sub.status === 'Accepted' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                                    </div>
                                                                    <div>
                                                                        <div className={`font-semibold text-sm ${sub.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {sub.status}
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                                                            {new Date(sub.createdAt || Date.now()).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right text-xs text-gray-500">
                                                                    <div>Language: {sub.language}</div>
                                                                    {sub.status === 'Accepted' && (
                                                                        <div>Runtime: {Math.round(sub.runtime * 1000) || 0}ms</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'Ai' && (
                                    <AI isDarkMode={isDarkMode}></AI>
                                )}
                            </div>
                        </div>
                    </Panel>

                    <Separator className={`w-1 transition-colors ${styles.separator}`} />

                    {/* Right Panel: Editor + Console */}
                    <Panel defaultSize={60}>
                        <Group orientation="vertical">
                            <Panel defaultSize={70}>
                                <div className="h-full flex flex-col">
                                    <div className={`flex items-center justify-between px-4 py-2 border-b ${styles.headerBg}`}>
                                        <div className="flex items-center gap-2">
                                            <Code2 size={16} className="text-red-500" />
                                            <span className="text-xs font-semibold">Code</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <select
                                                className={`text-xs bg-transparent border-none focus:ring-0 cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                            >
                                                {languages.map(lang => (
                                                    <option key={lang.id} value={lang.id} className="dark:bg-[#121212]">{lang.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Reset to starter code"
                                                onClick={() => {
                                                    if (confirm("Reset code to default?")) {
                                                        const starter = problem?.startCode?.find(sc => sc.language.toLowerCase() === language);
                                                        if (starter) setCode(starter.initialCode);
                                                    }
                                                }}
                                            >
                                                <RotateCcw size={13} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <Editor
                                            height="100%"
                                            language={language}
                                            value={code}
                                            theme={isDarkMode ? 'vs-dark' : 'light'}
                                            onChange={(value) => setCode(value || '')}
                                            onMount={handleEditorDidMount}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 13,
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                            }}
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <Separator className={`h-1 transition-colors ${styles.separator}`} />

                            <Panel defaultSize={30} minSize={10} collapsible ref={consolePanelRef}>
                                <div className={`h-full flex flex-col ${styles.contentBg}`}>
                                    <div className={`flex items-center px-4 py-2 border-b gap-2 ${styles.headerBg}`}>
                                        <Terminal size={14} className="text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-500">Console</span>
                                    </div>
                                    <div className="flex-grow p-4 overflow-y-auto font-mono text-xs">
                                        {!consoleOutput && !isRunning && (
                                            <div className="text-gray-400 italic">Run your code to see output here...</div>
                                        )}

                                        {isRunning && (
                                            <div className="flex items-center gap-2 text-red-500 font-semibold">
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Running code...
                                            </div>
                                        )}

                                        {consoleOutput && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className={`flex items-center gap-2 font-bold text-sm ${consoleOutput.status === 'Accepted' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                                                        {consoleOutput.status === 'Accepted' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                        {consoleOutput.status}
                                                    </div>
                                                </div>

                                                {consoleOutput.results && consoleOutput.results.length > 0 ? (
                                                    <div className="space-y-4 mt-2">
                                                        {consoleOutput.results.map((res, idx) => {
                                                            const testCase = visibleTestCases[idx] || {};
                                                            const isCorrect = res.status_id === 3 || res.status?.id === 3 || res.status === 'Accepted';

                                                            return (
                                                                <div key={idx} className={`p-4 rounded-xl border transition-all ${styles.cardBg} ${isCorrect ? 'border-green-500/10' : 'border-red-500/10'}`}>
                                                                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                                                                        <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                                                            Case {idx + 1}: {typeof res.status === 'object' ? res.status.description : (res.status || (isCorrect ? 'Accepted' : 'Failed'))}
                                                                        </span>
                                                                        <span>{res.time}s | {res.memory}KB</span>
                                                                    </div>

                                                                    <div className="space-y-2 text-xs font-mono">
                                                                        {testCase.input && (
                                                                            <div className="flex gap-2">
                                                                                <span className={`${styles.textMuted} w-16 flex-shrink-0`}>Input:</span>
                                                                                <span className="text-gray-800 dark:text-gray-200">{testCase.input}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex gap-2">
                                                                            <span className={`${styles.textMuted} w-16 flex-shrink-0`}>Output:</span>
                                                                            <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                                                                {(() => {
                                                                                    const val = res.stdout || '';
                                                                                    try {
                                                                                        // If backend sent plain text, return it. If it happens to be base64, attempt decoding.
                                                                                        if (val && !/^[A-Za-z0-9+/]*={0,2}$/.test(val.trim())) return val;
                                                                                        return val ? atob(val.trim()) : <span className="italic opacity-50">Empty</span>;
                                                                                    } catch {
                                                                                        return val;
                                                                                    }
                                                                                })()}
                                                                            </span>
                                                                        </div>
                                                                        {testCase.output && (
                                                                            <div className="flex gap-2">
                                                                                <span className={`${styles.textMuted} w-16 flex-shrink-0`}>Expected:</span>
                                                                                <span className="text-green-600 dark:text-green-500 font-semibold">{testCase.output}</span>
                                                                            </div>
                                                                        )}

                                                                        {/* Status-based error box */}
                                                                        {!isCorrect && (
                                                                            <div className="mt-2.5 p-2.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-600 space-y-1">
                                                                                <div className="font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                                                                    <AlertCircle size={10} />
                                                                                    {(() => {
                                                                                        const sid = res.status_id || res.status?.id;
                                                                                        if (sid === 5) return 'Time Limit Exceeded (TLE)';
                                                                                        if (sid === 6) return 'Compilation Error';
                                                                                        if (sid >= 7 && sid <= 12) return 'Runtime Error';
                                                                                        if (sid === 13) return 'Internal Error';
                                                                                        if (sid === 14) return 'Exec Format Error';
                                                                                        return 'Wrong Answer';
                                                                                    })()}
                                                                                </div>
                                                                                {(res.stderr || res.compile_output || res.message) && (
                                                                                    <div className="text-[11px] font-mono whitespace-pre-wrap opacity-90 break-words mt-1">
                                                                                        {(() => {
                                                                                            const rawErr = res.stderr || res.compile_output || res.message || '';
                                                                                            try {
                                                                                                if (rawErr && !/^[A-Za-z0-9+/]*={0,2}$/.test(rawErr.trim())) return rawErr;
                                                                                                return atob(rawErr.trim());
                                                                                            } catch {
                                                                                                return rawErr;
                                                                                            }
                                                                                        })()}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : consoleOutput.errorMessage ? (
                                                    <div className="p-3.5 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 font-semibold text-xs whitespace-pre-wrap">
                                                        {consoleOutput.errorMessage}

                                                    </div>
                                                ) : (
                                                    <div className="p-3.5 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 font-semibold text-xs">
                                                        Compilation / Runtime Failure: Check code structure or syntax.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>
        </div>


    );
}

export default ProblemEditor;
