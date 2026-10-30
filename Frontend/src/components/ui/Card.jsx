import React from "react";
import { cn } from "../../lib/utils";

export const Card = ({ className, children, ...props }) => (
    <div
        className={cn(
            "bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm transition-colors",
            className
        )}
        {...props}
    >
        {children}
    </div>
);

export const CardHeader = ({ className, children, ...props }) => (
    <div className={cn("p-5 border-b border-gray-100 dark:border-white/5", className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn("text-base font-bold text-gray-900 dark:text-white tracking-tight", className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }) => (
    <div className={cn("p-5", className)} {...props}>
        {children}
    </div>
);

export default Card;

