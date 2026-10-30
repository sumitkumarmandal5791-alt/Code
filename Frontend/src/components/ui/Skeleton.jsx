import React from "react";
import { cn } from "../../lib/utils";

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                "animate-pulse rounded-xl bg-gray-200/80 dark:bg-white/[0.05]",
                className
            )}
            {...props}
        />
    );
};

export default Skeleton;

