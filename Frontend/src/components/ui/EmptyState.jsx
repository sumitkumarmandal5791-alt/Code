import React from "react";
import { Inbox } from "lucide-react";
import Button from "./Button";

export const EmptyState = ({
    icon: Icon = Inbox,
    title = "No results found",
    description = "Try adjusting your search or filters to find what you are looking for.",
    actionLabel,
    onAction,
    className = "",
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}>
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] text-gray-400 dark:text-gray-500 flex items-center justify-center mb-3">
                <Icon size={24} />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button size="sm" variant="secondary" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;

