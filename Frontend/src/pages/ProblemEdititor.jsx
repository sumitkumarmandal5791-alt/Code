import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import Editor from '@monaco-editor/react';
import axiosClinet from "../utils/axios";
import { Code2, Play, Send, RotateCcw, CheckCircle2, AlertCircle, Clock, Database, Terminal } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import toast from 'react-hot-toast';
import AI from './AI';
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
    const [isDarkMode, setIsDarkMode] = useState(true);
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
        setActiveTab('console'); // Switch to console view on run in the bottom panel context if we had one, but here we just show it
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
            // setSubmissionResult(data) // Don't auto-set result, default to list view
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

    return (
        <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-[#1a1a1a] text-gray-100' : 'bg-white text-gray-900'}`}>
            {/* Header */}
            <div className={`h-14 border-b flex items-center justify-between px-4 ${isDarkMode ? 'bg-[#282828] border-[#3e3e3e]' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#3e3e3e] p-1.5 rounded-lg text-yellow-500">
                            <Code2 size={20} />
                        </div>
                        <h1 className="font-bold text-lg hidden md:block">LeetCode</h1>
                    </div>
                    <div className="h-6 w-px bg-gray-600 mx-2"></div>
                    <h2 className="font-medium truncate max-w-[200px] md:max-w-md">{title}</h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#3e3e3e] text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>

                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-colors ${isRunning ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-[#3e3e3e] hover:bg-[#4e4e4e] text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        onClick={handleRunCode}
                        disabled={isRunning}
                    >
                        <Play size={16} />
                        Run
                    </button>

                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-colors ${isRunning ? 'opacity-50 cursor-not-allowed' : ''} bg-green-600 hover:bg-green-700 text-white`}
                        onClick={handleSubmit}
                        disabled={isRunning}
                    >
                        <Send size={16} />
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
                            <div className={`flex border-b ${isDarkMode ? 'bg-[#282828] border-[#3e3e3e]' : 'bg-white border-gray-200'}`}>
                                <button
                                    className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'description' ? 'border-blue-500 text-blue-500' : 'border-transparent hover:text-blue-400'}`}
                                    onClick={() => setActiveTab('description')}
                                >
                                    Description
                                </button>
                                <button
                                    className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'solutions' ? 'border-blue-500 text-blue-500' : 'border-transparent hover:text-blue-400'}`}
                                    onClick={() => setActiveTab('solutions')}
                                >
                                    Solutions
                                </button>
                                <button
                                    className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'submission' ? 'border-blue-500 text-blue-500' : 'border-transparent hover:text-blue-400'}`}
                                    onClick={() => setActiveTab('submission')}
                                >
                                    Submissions
                                </button>
                                <button
                                    className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'editorial' ? 'border-blue-500 text-blue-500' : 'border-transparent hover:text-blue-400'}`}
                                    onClick={() => setActiveTab('editorial')}
                                >
                                    Editorial
                                </button>
                                <button
                                    className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'Ai' ? 'border-blue-500 text-blue-500' : 'border-transparent hover:text-blue-400'}`}
                                    onClick={() => setActiveTab('Ai')}
                                >
                                    Ai
                                </button>
                            </div>

                            <div className={`flex-grow overflow-y-auto p-4 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                                {activeTab === 'description' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h1 className="text-2xl font-bold mb-2">{title}</h1>
                                            <div className="flex gap-2 mb-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                                    ${difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                                                        difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                                            'bg-red-900/30 text-red-400'}`}>
                                                    {difficulty || 'Easy'}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                                    {tags}
                                                </span>
                                            </div>
                                            <div className="prose prose-invert max-w-none">
                                                <p className="whitespace-pre-wrap">{description}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {visibleTestCases.map((testCase, index) => (
                                                <div key={index} className={`rounded-lg p-4 ${isDarkMode ? 'bg-[#282828]' : 'bg-gray-100'}`}>
                                                    <h3 className="font-bold text-sm mb-2">Example {index + 1}:</h3>
                                                    <div className="space-y-2 text-sm font-mono">
                                                        <div>
                                                            <span className="text-gray-500">Input:</span> {testCase.input}
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Output:</span> {testCase.output}
                                                        </div>
                                                        {testCase.explanation && (
                                                            <div>
                                                                <span className="text-gray-500">Explanation:</span> {testCase.explanation}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'solutions' && (
                                    <div className="h-full flex flex-col">
                                        <h2 className="text-xl font-bold mb-4">Reference Solution</h2>
                                        <div className="flex-grow border rounded-lg overflow-hidden border-gray-700">
                                            <Editor
                                                height="100%"
                                                language={language}
                                                theme={isDarkMode ? 'vs-dark' : 'light'}
                                                value={getReferenceSolution()}
                                                options={{
                                                    readOnly: true,
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                    fontSize: 14,
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
                                                    className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 mb-2"
                                                >
                                                    ← Back to all submissions
                                                </button>

                                                <div className={`p-4 rounded-lg border ${submissionResult.status === 'Accepted' ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {submissionResult.status === 'Accepted' ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                                                        <h2 className={`text-xl font-bold ${submissionResult.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                                            {submissionResult.status}
                                                        </h2>
                                                    </div>

                                                    {submissionResult.status === 'Accepted' && (
                                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                                            <div className="bg-[#282828] p-3 rounded-lg">
                                                                <div className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Clock size={12} /> Runtime</div>
                                                                <div className="text-lg font-mono">{Math.round(submissionResult.runtime * 1000) || 0}ms</div>
                                                            </div>
                                                            <div className="bg-[#282828] p-3 rounded-lg">
                                                                <div className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Database size={12} /> Memory</div>
                                                                <div className="text-lg font-mono">{(submissionResult.memory / 1024).toFixed(2)} MB</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {submissionResult.errorMessage && (
                                                        <div className="bg-[#282828] p-3 rounded-lg mt-4 font-mono text-sm text-red-400 whitespace-pre-wrap">
                                                            {atob(submissionResult.errorMessage || '')}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="font-bold">Test Cases</h3>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {Array.from({ length: submissionResult.totalTestCases || 0 }).map((_, i) => (
                                                            <div key={i} className={`h-8 w-8 rounded flex items-center justify-center text-sm font-bold 
                                                        ${i < submissionResult.testCasesPassed ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                                                                {i + 1}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Passed {submissionResult.testCasesPassed || 0} of {hiddenTestCases.length || 0} test cases
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Submissions History List View */
                                            <div className="space-y-4">
                                                <h2 className="text-lg font-bold">Submission History</h2>
                                                {submissionsHistory.length === 0 ? (
                                                    <div className="text-center text-gray-500 py-10">
                                                        No Submission yet
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {submissionsHistory.map((sub, idx) => (
                                                            <div
                                                                key={sub._id || idx}
                                                                onClick={() => setSubmissionResult(sub)}
                                                                className={`p-3 rounded-lg border cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-between
                                                                    ${isDarkMode ? 'bg-[#282828] border-[#3e3e3e]' : 'bg-white border-gray-200'}
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={sub.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}>
                                                                        {sub.status === 'Accepted' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                                    </div>
                                                                    <div>
                                                                        <div className={`font-medium ${sub.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                                                            {sub.status}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
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

                                {activeTab == 'Ai' && (
                                    <AI></AI>
                                )}


                            </div>
                        </div>
                    </Panel>

                    <Separator className="w-1 bg-[#3e3e3e] hover:bg-blue-500 transition-colors" />

                    {/* Right Panel: Editor + Console */}
                    <Panel defaultSize={60}>
                        <Group orientation="vertical">
                            <Panel defaultSize={70}>
                                <div className="h-full flex flex-col">
                                    <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode ? 'bg-[#282828] border-[#3e3e3e]' : 'bg-white border-gray-200'}`}>
                                        <div className="flex items-center gap-2">
                                            <Code2 size={16} className="text-blue-500" />
                                            <span className="text-sm font-medium">Code</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <select
                                                className={`text-sm bg-[#282828] border-none focus:ring-0 cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                            >
                                                {languages.map(lang => (
                                                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                className="text-gray-500 hover:text-gray-300 transition-colors"
                                                title="Reset to starter code"
                                                onClick={() => {
                                                    if (confirm("Reset code to default?")) {
                                                        const starter = problem?.startCode?.find(sc => sc.language.toLowerCase() === language);
                                                        if (starter) setCode(starter.initialCode);
                                                    }
                                                }}
                                            >
                                                <RotateCcw size={14} />
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
                                                fontSize: 14,
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                            }}
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <Separator className="h-1 bg-[#3e3e3e] hover:bg-blue-500 transition-colors" />

                            <Panel defaultSize={30} minSize={10} collapsible ref={consolePanelRef}>
                                <div className={`h-full flex flex-col ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                                    <div className={`flex items-center px-4 py-2 border-b gap-2 ${isDarkMode ? 'bg-[#282828] border-[#3e3e3e]' : 'bg-white border-gray-200'}`}>
                                        <Terminal size={14} className="text-gray-400" />
                                        <span className="text-sm font-medium text-gray-300">Console</span>
                                    </div>
                                    <div className="flex-grow p-4 overflow-y-auto font-mono text-sm">
                                        {!consoleOutput && !isRunning && (
                                            <div className="text-gray-500 italic">Run your code to see output here...</div>
                                        )}

                                        {isRunning && (
                                            <div className="flex items-center gap-2 text-blue-400">
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Running code...
                                            </div>
                                        )}

                                        {consoleOutput && (
                                            <div className="space-y-4">
                                                <div className={`flex items-center gap-2 font-bold ${consoleOutput.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {consoleOutput.status === 'Accepted' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                    {consoleOutput.status}
                                                </div>

                                                {/* If there are specific test case results in 'results' array */}
                                                {consoleOutput.results && consoleOutput.results.length > 0 ? (
                                                    <div className="space-y-4 mt-2">
                                                        {consoleOutput.results.map((res, idx) => (
                                                            <div key={idx} className="bg-[#282828] p-3 rounded-lg border border-gray-700">
                                                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                                    <span>Case {idx + 1}</span>
                                                                    <span>{res.time}s | {res.memory}KB</span>
                                                                </div>
                                                                {res.stdout && (
                                                                    <div className="mb-2">
                                                                        <div className="text-xs text-gray-500">Output:</div>
                                                                        <div className="text-gray-300">{atob(res.stdout || 'gdteuihxi')}</div>
                                                                    </div>
                                                                )}
                                                                {res.stderr && (
                                                                    <div>
                                                                        <div className="text-xs text-red-400">Error:</div>
                                                                        <div className="text-red-300">{atob(res.stderr || 'ndhdvdyhd')}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : consoleOutput.errorMessage ? (
                                                    <div className="bg-red-900/20 p-3 rounded-lg border border-red-700/50 text-red-300">
                                                        {consoleOutput.errorMessage}
                                                    </div>
                                                ) : null}
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

