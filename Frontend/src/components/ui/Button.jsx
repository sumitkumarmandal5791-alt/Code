import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(({
    className,
    variant = "primary",
    size = "default",
    isLoading = false,
    disabled = false,
    children,
    type = "button",
    ...props
}, ref) => {
    const variants = {
        primary: "bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white shadow-sm shadow-red-600/20 focus-visible:ring-red-500",
        secondary: "bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 focus-visible:ring-gray-400",
        outline: "border border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-700 dark:text-gray-300 focus-visible:ring-red-500",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:ring-red-500",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-500",
        success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus-visible:ring-emerald-500",
    };

    const sizes = {
        default: "h-9 py-2 px-4 text-xs font-semibold rounded-xl",
        sm: "h-7 px-2.5 text-[11px] font-semibold rounded-lg",
        lg: "h-11 px-6 text-sm font-bold rounded-2xl",
        icon: "h-8 w-8 rounded-lg p-0",
    };

    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || isLoading}
            className={cn(
                "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-[#121212] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
                variants[variant] || variants.primary,
                sizes[size] || sizes.default,
                className
            )}
            {...props}
        >
            {isLoading && (
                <Loader2 size={size === "sm" ? 12 : 14} className="mr-1.5 animate-spin" />
            )}
            {children}
        </button>
    );
});

Button.displayName = "Button";
export default Button;
