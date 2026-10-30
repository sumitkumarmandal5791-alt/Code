import { useState, useEffect, useCallback, useMemo } from "react";
import axiosClient from "../utils/axios";
import { useSelector } from "react-redux";

export const useProblems = () => {
    const { user } = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [problemsRes, solvedRes] = await Promise.allSettled([
                axiosClient.get("admin/getAllProblem"),
                user ? axiosClient.get("admin/getAllSolvedProblem") : Promise.resolve({ data: null }),
            ]);

            if (problemsRes.status === "fulfilled") {
                setProblems(Array.isArray(problemsRes.value.data) ? problemsRes.value.data : []);
            } else {
                throw new Error("Failed to load problems from server");
            }

            if (solvedRes.status === "fulfilled" && solvedRes.value?.data) {
                setSolvedProblems(solvedRes.value.data?.user?.problemSolved || []);
            }
        } catch (err) {
            console.error("[useProblems] Error:", err);
            setError(err.response?.data?.message || err.message || "Failed to load problems");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const solvedIds = useMemo(() => {
        return new Set(solvedProblems.map((p) => (typeof p === "string" ? p : p._id)));
    }, [solvedProblems]);

    // Extract all unique tags
    const allTags = useMemo(() => {
        const tagSet = new Set();
        problems.forEach((p) => {
            if (p.tags) {
                const list = Array.isArray(p.tags) ? p.tags : String(p.tags).split(",");
                list.forEach((t) => tagSet.add(t.trim()));
            }
        });
        return Array.from(tagSet).sort();
    }, [problems]);

    return {
        problems,
        solvedProblems,
        solvedIds,
        allTags,
        loading,
        error,
        refetch: fetchData,
    };
};

export default useProblems;

