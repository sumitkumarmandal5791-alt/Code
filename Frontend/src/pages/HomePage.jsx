import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router";
import Layout from "../components/Layout";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import {
    Search,
    Filter,
    CheckCircle2,
    ChevronRight,
    Calendar,
    Sparkles,
    Shuffle,
    RotateCcw,
    SlidersHorizontal,
    TrendingUp,
    Video,
} from "lucide-react";
import useProblems from "../hooks/useProblems";

export function HomePage() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const { problems, solvedIds, allTags, loading, error, refetch } = useProblems();

    // Read filters from URL query parameters
    const urlSearch = searchParams.get("search") || "";
    const urlDifficulty = searchParams.get("difficulty") || "all";
    const urlStatus = searchParams.get("status") || "all";
    const urlTag = searchParams.get("tag") || "all";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);

    const [searchInput, setSearchInput] = useState(urlSearch);
    const [selectedDifficulty, setSelectedDifficulty] = useState(urlDifficulty);
    const [selectedStatus, setSelectedStatus] = useState(urlStatus);
    const [selectedTag, setSelectedTag] = useState(urlTag);
    const [currentPage, setCurrentPage] = useState(urlPage);
    const PAGE_SIZE = 15;

    // Debounce search input into URL params
    useEffect(() => {
        const handler = setTimeout(() => {
            const nextParams = new URLSearchParams(searchParams);
            if (searchInput.trim()) {
                nextParams.set("search", searchInput.trim());
            } else {
                nextParams.delete("search");
            }
            nextParams.set("page", "1");
            setSearchParams(nextParams, { replace: true });
        }, 250);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // Keep state in sync with URL
    const updateFilter = (key, value) => {
        const nextParams = new URLSearchParams(searchParams);
        if (value && value !== "all") {
            nextParams.set(key, value);
        } else {
            nextParams.delete(key);
        }
        nextParams.set("page", "1");
        setSearchParams(nextParams);

        if (key === "difficulty") setSelectedDifficulty(value);
        if (key === "status") setSelectedStatus(value);
        if (key === "tag") setSelectedTag(value);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearchInput("");
        setSelectedDifficulty("all");
        setSelectedStatus("all");
        setSelectedTag("all");
        setCurrentPage(1);
        setSearchParams(new URLSearchParams());
    };

    // Filtered Problems
    const filteredProblems = useMemo(() => {
        const query = (searchParams.get("search") || "").toLowerCase();
        const diff = searchParams.get("difficulty") || "all";
        const stat = searchParams.get("status") || "all";
        const tag = searchParams.get("tag") || "all";

        return problems.filter((problem) => {
            const matchesSearch =
                !query ||
                problem.title.toLowerCase().includes(query) ||
                (problem.tags &&
                    String(problem.tags).toLowerCase().includes(query));

            const matchesDiff =
                diff === "all" ||
                problem.difficulty?.toLowerCase() === diff.toLowerCase();

            const isSolved = solvedIds.has(problem._id);
            const matchesStatus =
                stat === "all" ||
                (stat === "solved" && isSolved) ||
                (stat === "unsolved" && !isSolved);

            const matchesTag =
                tag === "all" ||
                (problem.tags &&
                    (Array.isArray(problem.tags)
                        ? problem.tags.includes(tag)
                        : String(problem.tags).includes(tag)));

            return matchesSearch && matchesDiff && matchesStatus && matchesTag;
        });
    }, [problems, solvedIds, searchParams]);

    // Pagination
    const totalPages = Math.ceil(filteredProblems.length / PAGE_SIZE) || 1;
    const paginatedProblems = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredProblems.slice(start, start + PAGE_SIZE);
    }, [filteredProblems, currentPage]);

    // Pick Random Problem
    const handlePickRandom = () => {
        const candidates = filteredProblems.length > 0 ? filteredProblems : problems;
        if (candidates.length === 0) return;
        const unsolved = candidates.filter((p) => !solvedIds.has(p._id));
        const pool = unsolved.length > 0 ? unsolved : candidates;
        const randomProblem = pool[Math.floor(Math.random() * pool.length)];
        if (randomProblem?._id) {
            navigate(`/problem-editor/${randomProblem._id}`);
        }
    };

    // Daily Challenge Problem
    const dailyProblem = useMemo(() => {
        if (problems.length === 0) return null;
        // Deterministically pick daily problem based on current date
        const dayOfYear = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
        );
        return problems[dayOfYear % problems.length];
    }, [problems]);

    // Solved counts
    const solvedCounts = useMemo(() => {
        let easy = 0;
        let medium = 0;
        let hard = 0;
        problems.forEach((p) => {
            if (solvedIds.has(p._id)) {
                const d = p.difficulty?.toLowerCase();
                if (d === "easy") easy++;
                else if (d === "medium") medium++;
                else if (d === "hard") hard++;
            }
        });
        return { easy, medium, hard, total: solvedIds.size };
    }, [problems, solvedIds]);

    return (
        <Layout className="bg-[#fafaf9] dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors">
            {/* Top Welcome Banner */}
            <div
                className="relative overflow-hidden mb-8 p-6 md:p-8 rounded-3xl border border-red-500/10 dark:border-white/10 shadow-sm"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,242,242,0.8) 50%, rgba(240,253,244,0.6) 100%)",
                }}
            >
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                    }}
                />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                            Welcome back,{" "}
                            <span className="text-red-600 capitalize">
                                {user?.firstName || "Developer"}
                            </span>
                            !
                        </h1>
                        <p className="mt-1.5 text-xs sm:text-sm text-gray-600 max-w-xl">
                            Practice algorithms, master data structures, and prepare for top-tier technical interviews.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        size="default"
                        onClick={handlePickRandom}
                        className="flex items-center gap-2 shadow-md shadow-red-500/20"
                    >
                        <Shuffle size={14} />
                        <span>Pick Random</span>
                    </Button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 3-Column Problems Table */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm transition-colors">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                size={15}
                            />
                            <input
                                type="text"
                                placeholder="Search by title or tag..."
                                className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-xs"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Filter Selects */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                            {/* Difficulty */}
                            <select
                                className="bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer transition-all"
                                value={selectedDifficulty}
                                onChange={(e) => updateFilter("difficulty", e.target.value)}
                            >
                                <option value="all">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>

                            {/* Status */}
                            <select
                                className="bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer transition-all"
                                value={selectedStatus}
                                onChange={(e) => updateFilter("status", e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="solved">Solved</option>
                                <option value="unsolved">Unsolved</option>
                            </select>

                            {/* Tags Multi-Dropdown */}
                            {allTags.length > 0 && (
                                <select
                                    className="bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer transition-all max-w-[140px]"
                                    value={selectedTag}
                                    onChange={(e) => updateFilter("tag", e.target.value)}
                                >
                                    <option value="all">All Tags</option>
                                    {allTags.map((tag) => (
                                        <option key={tag} value={tag}>
                                            {tag}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {(urlSearch || urlDifficulty !== "all" || urlStatus !== "all" || urlTag !== "all") && (
                                <button
                                    onClick={clearAllFilters}
                                    title="Reset filters"
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Problem Table */}
                    <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-colors">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-gray-50/70 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
                            <div className="col-span-1">Status</div>
                            <div className="col-span-7 sm:col-span-6">Title &amp; Tags</div>
                            <div className="col-span-2">Difficulty</div>
                            <div className="col-span-2 sm:col-span-3 text-right">Action</div>
                        </div>

                        {/* Table Body */}
                        {loading ? (
                            <div className="divide-y divide-gray-100 dark:divide-white/5 p-4 space-y-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="flex items-center gap-4 py-2">
                                        <Skeleton className="w-5 h-5 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-7 w-20 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <p className="text-xs text-red-500 font-semibold mb-2">{error}</p>
                                <Button size="sm" variant="secondary" onClick={refetch}>
                                    Retry Loading
                                </Button>
                            </div>
                        ) : paginatedProblems.length === 0 ? (
                            <EmptyState
                                title="No matching problems"
                                description="We couldn't find any questions matching your current filters."
                                actionLabel="Clear Filters"
                                onAction={clearAllFilters}
                            />
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-white/5">
                                {paginatedProblems.map((problem, idx) => {
                                    const isSolved = solvedIds.has(problem._id);
                                    return (
                                        <div
                                            key={problem._id || idx}
                                            className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {/* Status */}
                                            <div className="col-span-1">
                                                {isSolved ? (
                                                    <span title="Solved">
                                                        <CheckCircle2
                                                            size={18}
                                                            className="text-emerald-500"
                                                        />
                                                    </span>
                                                ) : (
                                                    <div
                                                        title="Unsolved"
                                                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-700 group-hover:border-gray-400"
                                                    />
                                                )}
                                            </div>

                                            {/* Title & Tags */}
                                            <div className="col-span-7 sm:col-span-6 min-w-0">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <Link
                                                        to={`/problem-editor/${problem._id}`}
                                                        className="text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 font-bold transition-colors text-xs sm:text-sm truncate"
                                                    >
                                                        {problem.title}
                                                    </Link>
                                                    {(problem.hasVideo || Boolean(problem.video?.videoId)) && (
                                                        <span
                                                            title="Video Solution Available"
                                                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-semibold flex-shrink-0"
                                                        >
                                                            <Video size={11} className="fill-current" />
                                                            <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider">Video</span>
                                                        </span>
                                                    )}
                                                </div>
                                                {problem.tags && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(Array.isArray(problem.tags)
                                                            ? problem.tags
                                                            : String(problem.tags).split(",")
                                                        )
                                                            .slice(0, 3)
                                                            .map((t) => (
                                                                <span
                                                                    key={t}
                                                                    className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/[0.04] px-1.5 py-0.5 rounded font-medium"
                                                                >
                                                                    {t.trim()}
                                                                </span>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Difficulty */}
                                            <div className="col-span-2">
                                                <Badge variant={problem.difficulty}>
                                                    {problem.difficulty || "Easy"}
                                                </Badge>
                                            </div>

                                            {/* Action Button */}
                                            <div className="col-span-2 sm:col-span-3 flex justify-end">
                                                <Link to={`/problem-editor/${problem._id}`}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs group-hover:text-red-600 group-hover:bg-red-50 dark:group-hover:bg-red-950/20"
                                                    >
                                                        <span>Solve</span>
                                                        <ChevronRight size={13} className="ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500">
                                <span>
                                    Page {currentPage} of {totalPages} ({filteredProblems.length} problems)
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={currentPage <= 1}
                                        onClick={() => {
                                            setCurrentPage((p) => Math.max(1, p - 1));
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => {
                                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 1-Column Sidebar Widgets */}
                <aside aria-label="Coding Progress and Daily Challenge" className="lg:col-span-1 space-y-6">
                    {/* Daily Challenge Card */}
                    {dailyProblem && (
                        <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-colors">
                            <div
                                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] pointer-events-none"
                                style={{ background: "radial-gradient(circle, #dc2626 0%, transparent 70%)" }}
                            />
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs">
                                    <Calendar size={15} className="text-red-600" />
                                    <span>Daily Challenge</span>
                                </h3>
                                <Badge variant={dailyProblem.difficulty}>
                                    {dailyProblem.difficulty || "Easy"}
                                </Badge>
                            </div>

                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-4 line-clamp-2">
                                {dailyProblem.title}
                            </p>

                            <Link to={`/problem-editor/${dailyProblem._id}`} className="block">
                                <Button className="w-full text-xs font-bold shadow-md shadow-red-500/10">
                                    Solve Today
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Progress Overview Card */}
                    <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm transition-colors space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <TrendingUp size={14} className="text-emerald-500" />
                                <span>Solved Breakdown</span>
                            </h4>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                {solvedCounts.total} / {problems.length}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex">
                            <div
                                style={{ width: `${(solvedCounts.easy / Math.max(problems.length, 1)) * 100}%` }}
                                className="bg-emerald-500 h-full"
                                title={`Easy: ${solvedCounts.easy}`}
                            />
                            <div
                                style={{ width: `${(solvedCounts.medium / Math.max(problems.length, 1)) * 100}%` }}
                                className="bg-amber-500 h-full"
                                title={`Medium: ${solvedCounts.medium}`}
                            />
                            <div
                                style={{ width: `${(solvedCounts.hard / Math.max(problems.length, 1)) * 100}%` }}
                                className="bg-rose-500 h-full"
                                title={`Hard: ${solvedCounts.hard}`}
                            />
                        </div>

                        {/* Stats Rows */}
                        <div className="space-y-2 pt-1 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-emerald-500">Easy</span>
                                <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {solvedCounts.easy}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-amber-500">Medium</span>
                                <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {solvedCounts.medium}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-rose-500">Hard</span>
                                <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {solvedCounts.hard}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </Layout>
    );
}

export default HomePage;
