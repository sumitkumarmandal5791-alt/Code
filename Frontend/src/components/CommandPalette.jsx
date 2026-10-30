import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Code2, User, LayoutDashboard, Sparkles, X, ChevronRight } from "lucide-react";
import axiosClient from "../utils/axios";

export function CommandPalette() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [problems, setProblems] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // Global keyboard listener for Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            } else if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Fetch problem list once for quick searching
    useEffect(() => {
        if (isOpen && problems.length === 0) {
            axiosClient
                .get("admin/getAllProblem")
                .then((res) => {
                    if (Array.isArray(res.data)) {
                        setProblems(res.data);
                    }
                })
                .catch(() => {});
        }
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, problems.length]);

    // Navigation items
    const staticActions = [
        { id: "dashboard", title: "Problem Catalog", path: "/dashboard", icon: LayoutDashboard },
        { id: "profile", title: "My Profile & Heatmap", path: "/profile", icon: User },
        { id: "chats", title: "AI Assistant", path: "/chats", icon: Sparkles },
    ];

    // Filter results
    const filteredProblems = query.trim()
        ? problems
              .filter(
                  (p) =>
                      p.title.toLowerCase().includes(query.toLowerCase()) ||
                      (p.tags && String(p.tags).toLowerCase().includes(query.toLowerCase()))
              )
              .slice(0, 8)
        : [];

    const allItems = [
        ...staticActions.filter((a) =>
            !query.trim() || a.title.toLowerCase().includes(query.toLowerCase())
        ),
        ...filteredProblems.map((p) => ({
            id: p._id,
            title: p.title,
            path: `/problem-editor/${p._id}`,
            difficulty: p.difficulty,
            icon: Code2,
        })),
    ];

    const handleSelect = (item) => {
        setIsOpen(false);
        setQuery("");
        navigate(item.path);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-[#151515] text-gray-900 dark:text-gray-100 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Bar */}
                <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-white/10 gap-3">
                    <Search size={18} className="text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search problems, pages, or tools (Type to search)..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        className="flex-1 bg-transparent border-none text-xs sm:text-sm focus:outline-none placeholder-gray-400"
                    />
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-white/10 text-gray-500 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Items List */}
                <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
                    {allItems.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400">
                            No problems or pages found.
                        </div>
                    ) : (
                        allItems.map((item, idx) => {
                            const Icon = item.icon || Code2;
                            return (
                                <div
                                    key={item.id || idx}
                                    onClick={() => handleSelect(item)}
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center flex-shrink-0">
                                            <Icon size={14} />
                                        </div>
                                        <span className="text-xs font-semibold truncate group-hover:text-red-600 transition-colors">
                                            {item.title}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {item.difficulty && (
                                            <span
                                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                    item.difficulty === "easy"
                                                        ? "text-emerald-500 bg-emerald-500/10"
                                                        : item.difficulty === "medium"
                                                        ? "text-amber-500 bg-amber-500/10"
                                                        : "text-rose-500 bg-rose-500/10"
                                                }`}
                                            >
                                                {item.difficulty}
                                            </span>
                                        )}
                                        <ChevronRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommandPalette;

