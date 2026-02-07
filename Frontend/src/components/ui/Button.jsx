import { cn } from "../../lib/utils";

const Button = ({
    className,
    variant = "primary",
    size = "default",
    isLoading,
    children,
    ...props
}) => {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20",
        secondary: "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 border border-gray-700",
        outline: "border-2 border-transparent bg-transparent hover:bg-[#2a2a2a] text-gray-400 hover:text-white",
        ghost: "bg-transparent hover:bg-[#2a2a2a] text-gray-400 hover:text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white",
    };

    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : null}
            {children}
        </button>
    );
};

export default Button;
