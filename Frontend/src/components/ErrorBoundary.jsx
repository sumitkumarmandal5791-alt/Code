import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "./ui/Button";

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-[#faf9f6] dark:bg-[#0c0c0c] text-gray-900 dark:text-gray-100">
                    <div className="max-w-md w-full bg-white dark:bg-[#141414] rounded-3xl border border-gray-200 dark:border-white/10 p-6 text-center shadow-xl">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            An unexpected runtime error occurred. You can reload the page or return to the dashboard.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button variant="primary" size="sm" onClick={this.handleReload} className="gap-1.5">
                                <RotateCcw size={13} />
                                <span>Reload Application</span>
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

