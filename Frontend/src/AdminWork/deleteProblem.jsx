import React, { useState, useEffect } from "react";
import axiosClinet from "../utils/axios";
import { Trash2, Search, AlertCircle, Loader2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

function DeleteProblem() {
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

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
            toast.success("Problem deleted successfully", { id: toastId });
        } catch (error) {
            console.error("Error deleting problem:", error);
            toast.error("Failed to delete problem", { id: toastId });
        }
    };

    return (
        <div className="min-h-screen bg-base-200 p-6 md:p-10">
            <Toaster position="top-right" />

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Manage Problems</h1>
                        <p className="text-base-content/60 mt-1">View and delete existing problems</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-base-content/40" />
                        </div>
                        <input
                            type="text"
                            className="input input-bordered w-full pl-10 bg-base-100"
                            placeholder="Search problems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            {/* head */}
                            <thead className="bg-base-300">
                                <tr>
                                    <th>Title</th>
                                    <th>Tags</th>
                                    <th>Difficulty</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-base-content/60">Loading problems...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProblems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertCircle className="h-10 w-10 text-base-content/30" />
                                                <span className="text-base-content/60">No problems found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProblems.map((problem) => (
                                        <tr key={problem._id} className="hover">
                                            <td className="font-medium text-lg">
                                                {problem.title}
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    {/* Mock tags if not present, or map them if they are an array */}
                                                    {Array.isArray(problem.tags) ? problem.tags.map((tag, i) => (
                                                        <span key={i} className="badge badge-ghost badge-sm">{tag}</span>
                                                    )) : <span className="badge badge-ghost badge-sm">Algorithm</span>}
                                                </div>
                                            </td>
                                            <td>
                                                {/* We use a difficulty badge, verifying if data exists, defaults to medium */}
                                                <div className={`badge ${problem.difficulty === 'Easy' ? 'badge-success' :
                                                        problem.difficulty === 'Hard' ? 'badge-error' : 'badge-warning'
                                                    } gap-2`}>
                                                    {problem.difficulty || 'Medium'}
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    className="btn btn-ghost btn-square text-error hover:bg-error/10"
                                                    onClick={() => handleDelete(problem._id)}
                                                    title="Delete Problem"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 text-sm text-base-content/50 text-center">
                    Showing {filteredProblems.length} of {problems.length} problems
                </div>
            </div>
        </div>
    );
}

export default DeleteProblem;
