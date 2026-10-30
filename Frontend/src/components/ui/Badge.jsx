import React from "react";
import { cn } from "../../lib/utils";

export const Badge = ({
    children,
    variant = "default",
    className,
    ...props
}) => {
    const normalizedVariant = String(variant).toLowerCase();

    const variants = {
        default: "bg-gray-100 dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-white/10",
        easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        blue: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border transition-colors",
                variants[normalizedVariant] || variants.default,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
