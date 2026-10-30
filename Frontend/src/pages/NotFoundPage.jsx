import React from "react";
import { Link } from "react-router";
import { Code2, ArrowLeft, Home } from "lucide-react";
import Button from "../components/ui/Button";

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#faf9f6] dark:bg-[#0c0c0c] text-gray-900 dark:text-gray-100 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-6 shadow-sm">
                <Code2 size={32} />
            </div>

            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-600 mb-2">
                404 Error: Page Not Found
            </span>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                This algorithm has no solution.
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                The URL you requested does not exist or has been relocated. Head back to the problem dashboard or landing page.
            </p>

            <div className="flex items-center gap-3">
                <Link to="/dashboard">
                    <Button variant="primary" size="default" className="gap-2">
                        <Home size={15} />
                        <span>Go to Dashboard</span>
                    </Button>
                </Link>
                <Link to="/">
                    <Button variant="outline" size="default" className="gap-2">
                        <ArrowLeft size={15} />
                        <span>Landing Page</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;

