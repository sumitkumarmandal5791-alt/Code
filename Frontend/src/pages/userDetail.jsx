import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { logoutUser } from '../authSlice';
import { useState, useEffect } from 'react';
import axiosClient from '../utils/axios';

import { ContributionGrid } from '../components/ContributionGrid';

function UserDetail() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const fetchSolved = async () => {
            try {
                const { data } = await axiosClient.get('admin/getAllSolvedProblem');
                setSolvedProblems(data?.user?.problemSolved || []);
            } catch (err) {
                console.error('Error fetching solved problems:', err);
            }
        };
        if (user) fetchSolved();
    }, [user]);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    const initials = user?.firstName ? user.firstName.slice(0, 2).toUpperCase() : 'U';
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

    const stats = [
        { label: 'Problems Solved', value: solvedProblems.length, icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ), color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
        { label: 'Current Streak', value: user?.streak?.currentStreak || 0, icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
        ), color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
        { label: 'Account Role', value: user?.role === 'admin' ? 'Admin' : 'Member', icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ), color: user?.role === 'admin' ? '#dc2626' : '#6366f1', bg: user?.role === 'admin' ? 'rgba(220,38,38,0.08)' : 'rgba(99,102,241,0.08)' }
    ];

    const difficultyCount = { easy: 0, medium: 0, hard: 0 };
    solvedProblems.forEach(p => {
        const d = (p.difficulty || '').toLowerCase();
        if (difficultyCount[d] !== undefined) difficultyCount[d]++;
    });

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #fef2f2 30%, #f0fdf4 60%, #fafaf9 100%)' }}>

            {/* Top navigation bar */}
            <nav className="flex items-center justify-between px-6 lg:px-10 py-4"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{
                            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                            boxShadow: '0 2px 8px rgba(220,38,38,0.2)'
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                        </svg>
                    </div>
                    <span className="text-base font-bold tracking-tight group-hover:opacity-80 transition-opacity" style={{ color: '#111827' }}>CodeBits</span>
                </Link>
                <Link to="/" className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-200"
                    style={{ color: '#9ca3af' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back to Problems
                </Link>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10" style={{ animation: 'fadeInUp 0.6s ease-out' }}>

                {/* ═══════════════ PROFILE HEADER CARD ═══════════════ */}
                <div className="relative rounded-2xl p-[1px] overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(22,163,74,0.1), rgba(0,0,0,0.03))'
                    }}>
                    <div className="rounded-2xl overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(40px)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)'
                        }}>

                        {/* Banner */}
                        <div className="h-28 relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 40%, #111111 100%)'
                            }}>
                            {/* Decorative orbs in banner */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
                                style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.2), transparent 70%)' }} />
                            <div className="absolute -bottom-10 left-1/4 w-32 h-32 rounded-full"
                                style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.15), transparent 70%)' }} />
                            <div className="absolute inset-0 opacity-[0.05]"
                                style={{
                                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }} />
                        </div>

                        {/* Profile info section */}
                        <div className="px-7 pb-7">
                            {/* Avatar - overlapping banner */}
                            <div className="-mt-12 mb-5 flex items-end justify-between">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #dc2626 0%, #16a34a 100%)',
                                            boxShadow: '0 8px 24px rgba(220,38,38,0.2), 0 0 0 4px white',
                                            letterSpacing: '0.05em'
                                        }}>
                                        {initials}
                                    </div>
                                    {/* Online indicator */}
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                                        style={{ background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                                        <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#16a34a' }} />
                                    </div>
                                </div>

                                {/* Role badge */}
                                {user?.role === 'admin' && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                                        style={{
                                            background: 'rgba(220,38,38,0.08)',
                                            border: '1px solid rgba(220,38,38,0.15)'
                                        }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#dc2626" stroke="none">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                        <span className="text-xs font-semibold" style={{ color: '#dc2626' }}>Admin</span>
                                    </div>
                                )}
                            </div>

                            {/* Name & email */}
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#111827', letterSpacing: '-0.02em' }}>
                                    {user?.firstName || 'User'}
                                </h1>
                                <p className="mt-1 text-sm flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    {user?.emailId || 'user@example.com'}
                                </p>
                                <p className="mt-1 text-xs flex items-center gap-1.5" style={{ color: '#d1d5db' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    Member since {memberSince}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════ STATS GRID ═══════════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {stats.map((stat, i) => (
                        <div key={i}
                            className="relative rounded-xl p-[1px] transition-all duration-300"
                            style={{
                                background: `linear-gradient(135deg, ${stat.color}20, rgba(0,0,0,0.02))`,
                                animation: `fadeInUp ${0.6 + i * 0.1}s ease-out`
                            }}>
                            <div className="rounded-xl px-5 py-5 h-full transition-all duration-300"
                                style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 8px 30px ${stat.color}12`;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: stat.bg, color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold" style={{ color: '#111827' }}>{stat.value}</p>
                                        <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: '#9ca3af' }}>{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══════════════ CONTRIBUTION GRID ═══════════════ */}
                <ContributionGrid />

                {/* ═══════════════ DIFFICULTY BREAKDOWN ═══════════════ */}
                <div className="mt-6 relative rounded-xl p-[1px]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(22,163,74,0.1), rgba(0,0,0,0.02), rgba(220,38,38,0.08))',
                        animation: 'fadeInUp 0.9s ease-out'
                    }}>
                    <div className="rounded-xl px-7 py-6"
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}>
                        <h3 className="text-sm font-semibold tracking-tight mb-5" style={{ color: '#111827' }}>
                            Difficulty Breakdown
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Easy', count: difficultyCount.easy, color: '#16a34a', bg: '#dcfce7' },
                                { label: 'Medium', count: difficultyCount.medium, color: '#f59e0b', bg: '#fef3c7' },
                                { label: 'Hard', count: difficultyCount.hard, color: '#dc2626', bg: '#fee2e2' }
                            ].map((d, i) => {
                                const total = solvedProblems.length || 1;
                                const pct = Math.round((d.count / total) * 100);
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                                                <span className="text-xs font-semibold" style={{ color: '#374151' }}>{d.label}</span>
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: d.color }}>
                                                {d.count} <span className="font-normal" style={{ color: '#d1d5db' }}>solved</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                                            <div className="h-full rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${solvedProblems.length > 0 ? pct : 0}%`,
                                                    background: `linear-gradient(90deg, ${d.color}, ${d.color}cc)`,
                                                    minWidth: d.count > 0 ? '8px' : '0px'
                                                }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ═══════════════ QUICK ACTIONS ═══════════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6" style={{ animation: 'fadeInUp 1s ease-out' }}>
                    <Link to="/"
                        className="group flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-300"
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: '1px solid rgba(0,0,0,0.04)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(22,163,74,0.2)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(22,163,74,0.06)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                            style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: '#111827' }}>Solve Problems</p>
                            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Continue your journey</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="transition-transform duration-200 group-hover:translate-x-1">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </Link>

                    {user?.role === 'admin' && (
                        <Link to="/admin"
                            className="group flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-300"
                            style={{
                                background: 'rgba(255,255,255,0.9)',
                                border: '1px solid rgba(0,0,0,0.04)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)';
                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(220,38,38,0.06)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: '#111827' }}>Admin Dashboard</p>
                                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Manage problems & users</p>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className="transition-transform duration-200 group-hover:translate-x-1">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </Link>
                    )}
                </div>

                {/* ═══════════════ LOGOUT SECTION ═══════════════ */}
                <div className="mt-10 relative rounded-xl p-[1px]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(220,38,38,0.1), rgba(0,0,0,0.02))',
                        animation: 'fadeInUp 1.1s ease-out'
                    }}>
                    <div className="rounded-xl px-7 py-6"
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}>

                        {!showLogoutConfirm ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: '#111827' }}>Sign Out</p>
                                        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Log out from your account</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="group px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300"
                                    style={{
                                        background: 'rgba(220,38,38,0.06)',
                                        color: '#dc2626',
                                        border: '1px solid rgba(220,38,38,0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#dc2626';
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(220,38,38,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(220,38,38,0.06)';
                                        e.currentTarget.style.color = '#dc2626';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                                    style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold mb-1" style={{ color: '#111827' }}>Are you sure?</p>
                                <p className="text-xs mb-5" style={{ color: '#9ca3af' }}>You'll need to sign in again to access your account.</p>
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                                        style={{
                                            background: 'rgba(0,0,0,0.04)',
                                            color: '#6b7280',
                                            border: '1px solid rgba(0,0,0,0.06)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                            boxShadow: '0 4px 16px rgba(220,38,38,0.25)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(220,38,38,0.4)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(220,38,38,0.25)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        Yes, Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-xs" style={{ color: '#d1d5db' }}>
                    Practice. Code. Succeed.
                </p>
            </div>

            {/* Keyframe animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

export default UserDetail;
