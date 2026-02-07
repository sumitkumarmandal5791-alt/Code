import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosClient from "../utils/axios";
import { useNavigate, useParams } from "react-router";
import { Plus, Trash2, Code2, Eye, EyeOff, Save, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

// Schema Validation (Same as Create)
const problemSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    tags: z.string().min(1, "At least one tag is required"),
    visibleTestCases: z.array(z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required")
    })).min(1, "At least one visible test case is required"),
    hiddenTestCases: z.array(z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required")
    })).min(1, "At least one hidden test case is required"),
    referenceSolution: z.array(z.object({
        code: z.string().min(10, "Reference solution is required"),
        language: z.string().min(1, "Language is required")
    })).min(1, "At least one reference solution is required")
});

function UpdateProblemById() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            title: "",
            description: "",
            tags: "",
            visibleTestCases: [{ input: "", output: "" }],
            hiddenTestCases: [{ input: "", output: "" }],
            referenceSolution: [{ language: "cpp", code: "" }]
        }
    });

    const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({
        control,
        name: "visibleTestCases"
    });

    const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({
        control,
        name: "hiddenTestCases"
    });

    const { fields: solutionFields, append: appendSolution, remove: removeSolution } = useFieldArray({
        control,
        name: "referenceSolution"
    });

    // Fetch existing problem data
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const { data } = await axiosClient.get(`admin/problemBy/${id}`);

                // Transform data for form
                const formData = {
                    title: data.title,
                    description: data.description,
                    tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags,
                    visibleTestCases: data.visibleTestCases || [],
                    hiddenTestCases: data.hiddenTestCases || [],
                    referenceSolution: data.referenceSolution && data.referenceSolution.length > 0
                        ? data.referenceSolution
                        : [{ language: "cpp", code: "" }]
                };

                reset(formData);
                setFetching(false);
            } catch (err) {
                console.error("Error fetching problem:", err);
                toast.error("Failed to load problem details");
                setFetching(false);
                setError("Failed to load problem. Please try again.");
            }
        };

        if (id) {
            fetchProblem();
        }
    }, [id, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            // Transform data for backend
            const payload = {
                title: data.title,
                description: data.description,
                tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                visibleTestCases: data.visibleTestCases,
                hiddenTestCases: data.hiddenTestCases,
                referenceSolution: data.referenceSolution
            };

            await axiosClient.put(`/admin/update/${id}`, payload);
            toast.success("Problem updated successfully");
            navigate("/admin/update"); // Redirect to update list
        } catch (err) {
            console.error("Error updating problem:", err);
            setError(err.response?.data || "Failed to update problem");
            toast.error("Failed to update problem");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    <p>Loading problem details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-gray-100 p-6 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => navigate("/admin/update")} className="text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Update Problem</h1>
                        </div>
                        <p className="text-gray-400 text-sm ml-7">Modify existing challenge details and test cases.</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <span>⚠️ {typeof error === 'string' ? error : "An error occurred"}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Basic Info Card */}
                    <div className="bg-[#262626] rounded-2xl border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl shadow-black/20">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-white border-b border-gray-800 pb-4">
                            <Code2 className="w-5 h-5 text-blue-500" /> Basic Information
                        </h2>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Problem Title</label>
                                <input
                                    {...register("title")}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-white placeholder-gray-600"
                                    placeholder="e.g., Two Sum"
                                />
                                {errors.title && <p className="text-red-400 text-xs mt-2">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description (Markdown)</label>
                                <textarea
                                    {...register("description")}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl min-h-[140px] focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none font-mono text-sm text-gray-300 placeholder-gray-600"
                                    placeholder="Describe the problem statement, constraints, and examples..."
                                />
                                {errors.description && <p className="text-red-400 text-xs mt-2">{errors.description.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                                <input
                                    {...register("tags")}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-white placeholder-gray-600"
                                    placeholder="Array, DP, String (comma separated)"
                                />
                                {errors.tags && <p className="text-red-400 text-xs mt-2">{errors.tags.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Visible Test Cases Card */}
                    <div className="bg-[#262626] rounded-2xl border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl shadow-black/20">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                                <Eye className="w-5 h-5 text-green-500" /> Visible Test Cases
                            </h2>
                            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Public</span>
                        </div>

                        <div className="space-y-4">
                            {visibleFields.map((field, index) => (
                                <div key={field.id} className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-start bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Input</label>
                                        <textarea
                                            {...register(`visibleTestCases.${index}.input`)}
                                            className="w-full px-3 py-2 bg-[#262626] border border-gray-700 rounded-lg focus:ring-1 focus:ring-green-500 outline-none font-mono text-xs min-h-[80px] text-gray-300"
                                            placeholder="Input data"
                                        />
                                        {errors.visibleTestCases?.[index]?.input && <p className="text-red-400 text-xs mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Expected Output</label>
                                        <textarea
                                            {...register(`visibleTestCases.${index}.output`)}
                                            className="w-full px-3 py-2 bg-[#262626] border border-gray-700 rounded-lg focus:ring-1 focus:ring-green-500 outline-none font-mono text-xs min-h-[80px] text-gray-300"
                                            placeholder="Expected output"
                                        />
                                        {errors.visibleTestCases?.[index]?.output && <p className="text-red-400 text-xs mt-1">Required</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeVisible(index)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg mt-7 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => appendVisible({ input: "", output: "" })}
                            className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 font-medium px-4 py-2 rounded-lg hover:bg-green-900/20 transition-all border border-green-900/30"
                        >
                            <Plus className="w-4 h-4" /> Add Examples
                        </button>
                        {errors.visibleTestCases && <p className="text-red-400 text-sm">{errors.visibleTestCases.message}</p>}
                    </div>

                    {/* Hidden Test Cases Card */}
                    <div className="bg-[#262626] rounded-2xl border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl shadow-black/20">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                                <EyeOff className="w-5 h-5 text-purple-500" /> Hidden Test Cases
                            </h2>
                            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Private</span>
                        </div>

                        <div className="space-y-4">
                            {hiddenFields.map((field, index) => (
                                <div key={field.id} className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-start bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Input</label>
                                        <textarea
                                            {...register(`hiddenTestCases.${index}.input`)}
                                            className="w-full px-3 py-2 bg-[#262626] border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none font-mono text-xs min-h-[80px] text-gray-300"
                                            placeholder="Input data"
                                        />
                                        {errors.hiddenTestCases?.[index]?.input && <p className="text-red-400 text-xs mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Expected Output</label>
                                        <textarea
                                            {...register(`hiddenTestCases.${index}.output`)}
                                            className="w-full px-3 py-2 bg-[#262626] border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none font-mono text-xs min-h-[80px] text-gray-300"
                                            placeholder="Expected output"
                                        />
                                        {errors.hiddenTestCases?.[index]?.output && <p className="text-red-400 text-xs mt-1">Required</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeHidden(index)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg mt-7 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => appendHidden({ input: "", output: "" })}
                            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-medium px-4 py-2 rounded-lg hover:bg-purple-900/20 transition-all border border-purple-900/30"
                        >
                            <Plus className="w-4 h-4" /> Add Test Cases
                        </button>
                        {errors.hiddenTestCases && <p className="text-red-400 text-sm">{errors.hiddenTestCases.message}</p>}
                    </div>

                    {/* Reference Solution Card */}
                    <div className="bg-[#262626] rounded-2xl border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl shadow-black/20">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                                <Save className="w-5 h-5 text-yellow-500" /> Reference Solutions
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {solutionFields.map((field, index) => (
                                <div key={field.id} className="grid gap-6 bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 relative">
                                    <button
                                        type="button"
                                        onClick={() => removeSolution(index)}
                                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                                        <select
                                            {...register(`referenceSolution.${index}.language`)}
                                            className="w-full px-4 py-3 bg-[#262626] border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all outline-none text-white appearance-none"
                                        >
                                            <option value="cpp">C++ (GCC 9.2.0)</option>
                                            <option value="java">Java (OpenJDK 13.0.1)</option>
                                            <option value="javascript">JavaScript (3.8.1)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Solution Code</label>
                                        <textarea
                                            {...register(`referenceSolution.${index}.code`)}
                                            className="w-full px-4 py-4 bg-[#262626] text-gray-300 border border-gray-700 rounded-xl min-h-[300px] focus:ring-2 focus:ring-yellow-600 outline-none font-mono text-sm leading-relaxed"
                                            placeholder="// Write correct solution here to validate test cases"
                                        />
                                        {errors.referenceSolution?.[index]?.code && <p className="text-red-400 text-xs mt-2">{errors.referenceSolution[index].code.message}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => appendSolution({ language: "cpp", code: "" })}
                            className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 font-medium px-4 py-2 rounded-lg hover:bg-yellow-900/20 transition-all border border-yellow-900/30"
                        >
                            <Plus className="w-4 h-4" /> Add Solution
                        </button>
                    </div>

                    {/* Submit Buttom */}
                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-500 hover:to-blue-600 focus:ring-4 focus:ring-blue-900 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 transform active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {loading ? "Updating..." : "Update Problem"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );


}

export default UpdateProblemById;