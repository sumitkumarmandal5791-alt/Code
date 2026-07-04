import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Code2, User, LogOut, Settings, Crown } from 'lucide-react';
import Button from './ui/Button';
import { logoutUser } from '../authSlice'; // Assuming action exists
import { useNavigate } from 'react-router';
const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
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

    const handleLogout = () => {
        dispatch(logoutUser())
        navigate('/login');
    }

    const admin = user?.role === 'admin'


    return (
        <nav className="h-16 sticky top-0 border-b border-gray-200/80 dark:border-gray-800 bg-white/85 dark:bg-[#0d0d0d]/85 backdrop-blur-md flex items-center justify-between px-6 z-50 transition-colors">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-gray-900 dark:text-white group">
                    <div className="bg-red-50 p-1.5 rounded-lg text-red-600 dark:bg-red-500/10 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                        <Code2 size={24} />
                    </div>
                    <span className="tracking-tight">CodeBits</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-sm">
                        Problems
                    </Link>
                    <Link to="/chats" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-sm">
                        Messages
                    </Link>
                    <Link to="/contest" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors font-medium text-sm">
                        Contest
                    </Link>
                    <Link to="/discuss" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors font-medium text-sm">
                        Discuss
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Theme Switcher Button */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label="Toggle Theme"
                >
                    {isDarkMode ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    )}
                </button>

                {admin && (
                    <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium text-sm">
                        Admin
                    </Link>
                )}

                {user ? (
                    <div className="flex items-center gap-3">
                        <Link to="/profile" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                                {user.firstName ? user.firstName[0] : 'U'}
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600 hover:bg-red-50/50">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 text-white">Register</Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
