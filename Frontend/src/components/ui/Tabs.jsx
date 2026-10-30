import React from "react";
import { cn } from "../../lib/utils";

export const TabsList = ({ className, children, ...props }) => (
    <div
        role="tablist"
        className={cn(
            "flex items-center gap-1 border-b border-gray-200/80 dark:border-white/10 px-2",
            className
        )}
        {...props}
    >
        {children}
    </div>
);

export const TabTrigger = ({
    isActive = false,
    onClick,
    children,
    className,
    icon: Icon,
    ...props
}) => (
    <button
        role="tab"
        type="button"
        aria-selected={isActive}
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer select-none",
            isActive
                ? "border-red-600 text-red-600 dark:text-red-500 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200",
            className
        )}
        {...props}
    >
        {Icon && <Icon size={14} className={isActive ? "text-red-600 dark:text-red-500" : "text-gray-400"} />}
        <span>{children}</span>
    </button>
);

export const TabPanel = ({ isActive = false, children, className, ...props }) => {
    if (!isActive) return null;
    return (
        <div
            role="tabpanel"
            className={cn("flex-grow overflow-y-auto animate-in fade-in duration-150", className)}
            {...props}
        >
            {children}
        </div>
    );
};

