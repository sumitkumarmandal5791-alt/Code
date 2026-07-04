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
        <Layout className="bg-[#fafaf9] dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors">
            <div className="relative overflow-hidden mb-8 p-6 md:p-8 rounded-2xl border border-red-500/10 dark:border-red-500/20 shadow-sm"
                 style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #f0fdf4 100%)' }}>
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{
                          backgroundImage: 'radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                      }} />
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Welcome back, <span className="text-red-600 capitalize">{user?.firstName || 'Developer'}</span>!
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 max-w-xl">
                        Sharpen your coding skills, practice daily challenges, and track your accomplishments on CodeBits.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {isFetching ? (
                    <div className="col-span-1 lg:col-span-4 flex justify-center py-20">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading problems...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Main Content: Problem List */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Filters Bar */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#121212] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-sm transition-colors">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search problems..."
                                        className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <select
                                        className="bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#202020] transition-all w-full sm:w-auto"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                    >
                                        <option value="all">Difficulty</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>

                                    <select
                                        className="bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#202020] transition-all w-full sm:w-auto"
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
                            <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm transition-colors">
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-[#181818]/60 border-b border-gray-100 dark:border-gray-850 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="col-span-1">Status</div>
                                    <div className="col-span-7 sm:col-span-6">Title</div>
                                    <div className="col-span-2">Difficulty</div>
                                    <div className="col-span-2 sm:col-span-3 text-right">Action</div>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-gray-850">
                                    {filteredProblems.map((problem) => {
                                        const isSolved = solvedIds.has(problem._id);
                                        return (
                                            <div
                                                key={problem._id}
                                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-[#1c1c1c]/30 transition-colors group"
                                            >
                                                <div className="col-span-1">
                                                    {isSolved ? (
                                                        <CheckCircle2 size={20} className="text-green-600" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-650"></div>
                                                    )}
                                                </div>
                                                <div className="col-span-7 sm:col-span-6">
                                                    <Link
                                                        to={`/problem-editor/${problem._id}`}
                                                        className="text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-500 font-semibold transition-colors block text-sm truncate"
                                                    >
                                                        {problem.title}
                                                    </Link>
                                                    {problem.tags && (
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                            {(Array.isArray(problem.tags) ? problem.tags : typeof problem.tags === 'string' ? problem.tags.split(',') : []).slice(0, 3).map(tag => (
                                                                <span key={tag} className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1a1a1a] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800 font-medium">
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
                                                <div className="col-span-2 sm:col-span-3 flex justify-end">
                                                    <Link to={`/problem-editor/${problem._id}`}>
                                                        <Button size="sm" variant="ghost" className="hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-300">
                                                            Solve <ChevronRight size={14} className="ml-1" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {filteredProblems.length === 0 && (
                                        <div className="p-12 text-center text-gray-400">
                                            <Filter size={40} className="mx-auto mb-3 opacity-40 text-gray-500" />
                                            <p className="text-sm font-medium">No problems found matching your filters.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Widgets */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Calendar Widget */}
                            <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-gray-800 rounded-xl p-6 shadow-sm relative overflow-hidden transition-colors">
                                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.05] pointer-events-none"
                                     style={{ background: 'radial-gradient(circle, #dc2626 0%, transparent 70%)' }} />
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-150 flex items-center gap-2 text-sm">
                                        <Calendar size={18} className="text-red-600" />
                                        Daily Challenge
                                    </h3>
                                    <Badge variant="easy">Easy</Badge>
                                </div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-205 mb-4">
                                    Build Array from Permutation
                                </p>
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/10">
                                    Solve Today
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

export default HomePage;