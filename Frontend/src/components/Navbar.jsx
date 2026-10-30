import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Code2, LogOut } from 'lucide-react';
import Button from './ui/Button';
import UserMenuButton from './navbar/UserMenuButton';
import useAuth from '../hooks/useAuth';
import { logoutUser } from '../authSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user: reduxUser } = useSelector((state) => state.auth);
    const { user: contextUser, logout: contextLogout } = useAuth();

    const user = reduxUser || contextUser;

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
        } catch (_) {}

        if (contextLogout) {
            await contextLogout();
        } else {
            toast.success("Logged out successfully");
            navigate("/");
        }
    };

    const admin = user?.role === 'admin';

    return (
        <nav className="h-16 sticky top-0 border-b border-gray-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0d0d0d]/85 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-40 transition-colors">
            <div className="flex items-center gap-6 sm:gap-8">
                <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-gray-900 dark:text-white group">
                    <div className="bg-red-50 p-1.5 rounded-xl text-red-600 dark:bg-red-500/10 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                        <Code2 size={22} />
                    </div>
                    <span className="tracking-tight font-black">CodeBits</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-sm">
                        Problems
                    </Link>
                    <Link to="/chats" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-sm">
                        AI Tutor
                    </Link>
                    <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-sm">
                        Profile &amp; Heatmap
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Switcher Button */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    aria-label="Toggle Theme"
                >
                    {isDarkMode ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="m4.93 4.93 1.41 1.41" />
                            <path d="m17.66 17.66 1.41 1.41" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="m6.34 17.66-1.41 1.41" />
                            <path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                    ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    )}
                </button>

                {admin && (
                    <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-xs px-2.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5">
                        Admin Portal
                    </Link>
                )}

                {/* User avatar menu (if user details available) */}
                {user && <UserMenuButton />}

                {/* Direct Logout Button */}
                <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-xl shadow-sm transition-all cursor-pointer"
                    title="Log out of CodeBits"
                >
                    <LogOut size={14} />
                    <span>Logout</span>
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
