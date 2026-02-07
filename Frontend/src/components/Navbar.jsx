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



    const handleLogout = () => {
        dispatch(logoutUser())
        navigate('/login');
    }

    const admin = user?.role === 'admin'


    return (
        <nav className="h-16 border-b border-gray-800 bg-[#1a1a1a] flex items-center justify-between px-6 z-50 relative">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
                    <div className="bg-[#2a2a2a] p-1.5 rounded-lg text-yellow-500">
                        <Code2 size={24} />
                    </div>
                    <span>LeetCode</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
                        Problems
                    </Link>
                    <Link to="/contest" className="text-gray-400 hover:text-white transition-colors font-medium text-sm">
                        Contest
                    </Link>
                    <Link to="/discuss" className="text-gray-400 hover:text-white transition-colors font-medium text-sm">
                        Discuss
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10">
                    <Crown size={20} />
                </Button>

                {admin && (
                    <Link to="/admin" className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
                        Admin
                    </Link>
                )}

                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                                {user.firstName ? user.firstName[0] : 'U'}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                            <LogOut size={18} />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button variant="primary" size="sm">Register</Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
