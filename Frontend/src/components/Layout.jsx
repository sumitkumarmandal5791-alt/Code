import Navbar from './Navbar';

const Layout = ({ children, className = "" }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] to-[#ffffff] dark:from-[#0a0a0a] dark:to-[#121212] text-gray-800 dark:text-gray-100 flex flex-col font-sans transition-colors">
            <Navbar />
            <main className={`flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 ${className}`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
