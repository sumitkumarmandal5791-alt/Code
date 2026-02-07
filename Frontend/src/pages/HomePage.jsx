import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Link } from "react-router";
import axiosClinet from "../utils/axios";
import Layout from "../components/Layout";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Search, Filter, CheckCircle2, ChevronRight, Calendar, Loader2 } from "lucide-react";

function HomePage() {
    const { user } = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter states
    const [difficulty, setDifficulty] = useState('all');
    const [status, setStatus] = useState('all');
    const [isFetching, setIsFetching] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            setIsFetching(true);
            try {
                const { data } = await axiosClinet.get("admin/getAllProblem");
                setProblems(data);

                if (user) {
                    const { data: solvedData } = await axiosClinet.get(`admin/getAllSolvedProblem`);
                    setSolvedProblems(solvedData?.user?.problemSolved || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [user]);

    // Derived state for filtering

    const solvedIds = new Set(solvedProblems?.map(p => p._id));

    const filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficulty === 'all' || problem.difficulty.toLowerCase() === difficulty.toLowerCase();

        const isSolved = solvedIds.has(problem._id);
        const matchesStatus = status === 'all' ||
            (status === 'solved' && isSolved) ||
            (status === 'unsolved' && !isSolved);

        return matchesSearch && matchesDifficulty && matchesStatus;
    });

    return (
        <Layout>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {isFetching ? (
                    <div className="col-span-1 lg:col-span-4 flex justify-center py-20">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="text-gray-400">Loading problems...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Main Content: Problem List */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Filters Bar */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#2a2a2a] p-4 rounded-xl border border-gray-700">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search questions..."
                                        className="w-full bg-[#1a1a1a] border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <select
                                        className="bg-[#1a1a1a] border border-gray-600 text-gray-300 text-sm px-3 py-2 rounded-lg focus:outline-none cursor-pointer hover:border-blue-500 transition-colors w-full md:w-auto"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                    >
                                        <option value="all">Difficulty</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>

                                    <select
                                        className="bg-[#1a1a1a] border border-gray-600 text-gray-300 text-sm px-3 py-2 rounded-lg focus:outline-none cursor-pointer hover:border-blue-500 transition-colors w-full md:w-auto"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="all">Status</option>
                                        <option value="solved">Solved</option>
                                        <option value="unsolved">Unsolved</option>
                                    </select>
                                </div>
                            </div>

                            {/* Problem Table */}
                            <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#252525] border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <div className="col-span-1">Status</div>
                                    <div className="col-span-6">Title</div>
                                    <div className="col-span-2">Difficulty</div>
                                    <div className="col-span-3 text-right">Action</div>
                                </div>

                                <div className="divide-y divide-gray-700/50">
                                    {filteredProblems.map((problem) => {
                                        const isSolved = solvedIds.has(problem._id);
                                        return (
                                            <div
                                                key={problem._id}
                                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#323232] transition-colors group"
                                            >
                                                <div className="col-span-1">
                                                    {isSolved ? (
                                                        <CheckCircle2 size={20} className="text-green-500" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full border border-gray-600 group-hover:border-gray-500"></div>
                                                    )}
                                                </div>
                                                <div className="col-span-6">
                                                    <Link
                                                        to={`/problem-editor/${problem._id}`}
                                                        className="text-gray-200 hover:text-blue-400 font-medium transition-colors block text-sm truncate"
                                                    >
                                                        {problem.title}
                                                    </Link>
                                                    {problem.tags && (
                                                        <div className="flex gap-2 mt-1">
                                                            {(Array.isArray(problem.tags) ? problem.tags : typeof problem.tags === 'string' ? problem.tags.split(',') : []).slice(0, 3).map(tag => (
                                                                <span key={tag} className="text-[12px] text-gray-400 bg-[1a1a19] px-1.5 py-0.5 rounded border border-gray-700">
                                                                    {tag.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <Badge variant={problem.difficulty} className="w-16 justify-center capitalize">
                                                        {problem.difficulty}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-3 flex justify-end">
                                                    <Link to={`/problem-editor/${problem._id}`}>
                                                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Solve <ChevronRight size={16} />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {filteredProblems.length === 0 && (
                                        <div className="p-12 text-center text-gray-500">
                                            <Filter size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No problems found matching your filters.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Widgets */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Calendar Widget */}
                            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#202020] border border-gray-700 rounded-xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Calendar size={18} className="text-blue-500" />
                                        Daily Challenge
                                    </h3>
                                    <Badge variant="easy">Easy</Badge>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">
                                    Build Array from Permutation
                                </p>
                                <Button className="w-full">Solve Today</Button>
                            </div>

                            {/* Progress Widget */}
                            <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6 shadow-xl">
                                <h3 className="font-bold text-white mb-4">Your Progress</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Easy</span>
                                        <span className="text-white font-medium">
                                            {solvedProblems.filter(p => p.difficulty === 'easy').length}
                                            <span className="text-gray-600"> / {problems.filter(p => p.difficulty === 'easy').length}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                        <div
                                            className="bg-green-500 h-1.5 rounded-full"
                                            style={{ width: `${(problems.length > 0) ? (solvedProblems.filter(p => p.difficulty === 'easy').length / problems.filter(p => p.difficulty === 'easy').length) * 100 : 0}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Medium</span>
                                        <span className="text-white font-medium">
                                            {solvedProblems.filter(p => p.difficulty === 'medium').length}
                                            <span className="text-gray-600"> / {problems.filter(p => p.difficulty === 'medium').length}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                        <div
                                            className="bg-yellow-500 h-1.5 rounded-full"
                                            style={{ width: `${(problems.length > 0) ? (solvedProblems.filter(p => p.difficulty === 'medium').length / problems.filter(p => p.difficulty === 'medium').length) * 100 : 0}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Hard</span>
                                        <span className="text-white font-medium">
                                            {solvedProblems.filter(p => p.difficulty === 'hard').length}
                                            <span className="text-gray-600"> / {problems.filter(p => p.difficulty === 'hard').length}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                        <div
                                            className="bg-red-500 h-1.5 rounded-full"
                                            style={{ width: `${(problems.length > 0) ? (solvedProblems.filter(p => p.difficulty === 'hard').length / problems.filter(p => p.difficulty === 'hard').length) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
export default HomePage;