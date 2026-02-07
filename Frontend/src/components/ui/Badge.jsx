import { cn } from "../../lib/utils";

const Badge = ({
    children,
    variant = "default",
    className,
    ...props
}) => {
    const variants = {
        default: "bg-[#2a2a2a] text-gray-300 border border-gray-700",
        easy: "bg-green-500/10 text-green-500 border border-green-500/20",
        medium: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
        hard: "bg-red-500/10 text-red-500 border border-red-500/20",
        blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant] || variants.default,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
