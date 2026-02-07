import React, { useState, useEffect } from "react";
import axiosClinet from "../utils/axios";
import { Trash2, Search, AlertCircle, Loader2, Edit2, FileCode, Layers } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";

function UpdateProblem() {
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const { data } = await axiosClinet.get("admin/getAllProblem");
                setProblems(data);
                setFilteredProblems(data);
            } catch (error) {
                console.error("Error fetching problems:", error);
                toast.error("Failed to fetch problems");
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, []);

    useEffect(() => {
        const results = problems.filter(problem =>
            problem.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProblems(results);
    }, [searchTerm, problems]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this problem?")) return;

        const toastId = toast.loading("Deleting problem...");
        try {
            await axiosClinet.delete(`admin/delete/${id}`);
            setProblems((prevProblems) => prevProblems.filter((problem) => problem._id !== id));
            // Also update filtered list to reflect change immediately
            setFilteredProblems((prevFiltered) => prevFiltered.filter((problem) => problem._id !== id));
            toast.success("Problem deleted successfully", { id: toastId });
        } catch (error) {
            console.error("Error deleting problem:", error);
            toast.error("Failed to delete problem", { id: toastId });
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'hard': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-base-content/10 text-base-content/70 border-base-content/20';
        }
    };

    return (
        <div className="min-h-screen bg-base-200 font-sans text-base-content selection:bg-primary/20">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Layers className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight">Problem Management</h1>
                                <p className="text-base-content/60 font-medium">Create, update, and manage your coding challenges</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats or Actions could go here, for now just the search */}
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                            <Search className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-11 pr-4 py-3 bg-base-100/50 backdrop-blur-sm border-2 border-transparent focus:border-primary/50 rounded-2xl shadow-sm focus:shadow-lg focus:bg-base-100 transition-all outline-none"
                            placeholder="Search problems by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-base-100/80 backdrop-blur-md rounded-3xl shadow-xl border border-base-content/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-base-content/10 bg-base-200/50">
                                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-base-content/50">Details</th>
                                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-base-content/50">Tags</th>
                                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-base-content/50">Difficulty</th>
                                    <th className="py-5 px-6 text-right text-xs font-bold uppercase tracking-wider text-base-content/50">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-content/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
                                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                <span className="text-base-content/60 font-medium">Loading your library...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProblems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="bg-base-200 p-4 rounded-full">
                                                    <AlertCircle className="h-8 w-8 text-base-content/40" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-lg font-bold">No problems found</h3>
                                                    <p className="text-base-content/50 max-w-xs mx-auto mt-1">
                                                        We couldn't find any problems matching "{searchTerm}".
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProblems.map((problem) => (
                                        <tr
                                            key={problem._id}
                                            className="group hover:bg-base-200/50 transition-colors duration-200"
                                        >
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-base-300 flex items-center justify-center text-base-content/70 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                        <FileCode className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                            {problem.title}
                                                        </p>
                                                        {/* Optional: Add ID or other metadata here */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray(problem.tags) ? (
                                                        problem.tags.slice(0, 3).map((tag, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-base-300/50 text-base-content/70 border border-base-content/5"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-base-300 text-base-content/70">
                                                            Algorithm
                                                        </span>
                                                    )}
                                                    {problem.tags?.length > 3 && (
                                                        <span className="px-2 py-1 text-xs text-base-content/50">+{problem.tags.length - 3}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty || 'Medium'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="btn btn-sm btn-square btn-ghost hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => navigate(`/admin/update/${problem._id}`)}
                                                        title="Edit Problem"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-square btn-ghost hover:bg-error/10 hover:text-error transition-colors"
                                                        onClick={() => handleDelete(problem._id)}
                                                        title="Delete Problem"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-sm text-base-content/50 px-2">
                    <p>Total {problems.length} problems</p>
                    <p>Showing {filteredProblems.length} results</p>
                </div>
            </div>
        </div>
    );
}

export default UpdateProblem;

