import Navbar from './Navbar';

const Layout = ({ children, className = "" }) => {
    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
            <Navbar />
            <main className={`flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 ${className}`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
