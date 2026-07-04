import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { loginUser } from '../authSlice'


const LoginSchema = z.object({
    emailId: z.string().email("Invalid email"),
    password: z.string().min(6, "password should contain 6 character")
})

function Login() {

    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(LoginSchema)
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthentication, error, loading } = useSelector((state) => state.auth);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        if (isAuthentication) {
            navigate("/");
        }
    }, [isAuthentication, navigate])


    function submitData(data) {
        dispatch(loginUser(data))
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#ffffff' }}>

            {/* ═══════════════ LEFT PANEL ═══════════════ */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between"
                style={{
                    background: 'linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 40%, #111111 100%)',
                }}>

                {/* Animated red gradient orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
                            animation: 'float1 8s ease-in-out infinite'
                        }} />
                    <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)',
                            animation: 'float2 10s ease-in-out infinite'
                        }} />
                    <div className="absolute top-1/2 left-1/3 w-[250px] h-[250px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(248,113,113,0.08) 0%, transparent 70%)',
                            animation: 'float3 12s ease-in-out infinite'
                        }} />
                    {/* Dot grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                        }} />
                </div>

                {/* Top — Logo */}
                <div className="relative z-10 p-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                                boxShadow: '0 4px 16px rgba(220,38,38,0.3)'
                            }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 18 22 12 16 6" />
                                <polyline points="8 6 2 12 8 18" />
                            </svg>
                        </div>
                        <span className="text-white text-lg font-bold tracking-tight">CodeBits</span>
                    </div>
                </div>

                {/* Center — Hero content */}
                <div className="relative z-10 px-10 flex-1 flex flex-col justify-center -mt-10">
                    <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                            style={{
                                background: 'rgba(220,38,38,0.1)',
                                border: '1px solid rgba(220,38,38,0.2)'
                            }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                            <span className="text-xs font-medium" style={{ color: '#f87171' }}>Practice • Build • Excel</span>
                        </div>

                        <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight"
                            style={{ letterSpacing: '-0.03em' }}>
                            Level up your
                            <br />
                            <span style={{
                                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>coding skills</span>
                        </h2>
                        <p className="mt-4 text-base leading-relaxed max-w-md" style={{ color: '#6b7280' }}>
                            Master algorithms, crack interviews, and build real-world problem-solving confidence — one challenge at a time.
                        </p>

                        {/* Feature cards */}
                        <div className="mt-10 space-y-3">
                            {[
                                {
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" />
                                        </svg>
                                    ),
                                    title: '500+ Curated Problems',
                                    desc: 'From easy to hard, across every topic'
                                },
                                {
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                                        </svg>
                                    ),
                                    title: 'Track Your Progress',
                                    desc: 'Visual stats and streak tracking'
                                },
                                {
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                                        </svg>
                                    ),
                                    title: 'AI-Powered Hints',
                                    desc: 'Smart assistance when you\'re stuck'
                                }
                            ].map((feature, i) => (
                                <div key={i}
                                    className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        animation: `fadeInUp ${0.8 + i * 0.15}s ease-out`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(220,38,38,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(220,38,38,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    }}
                                >
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(220,38,38,0.1)', color: '#f87171' }}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{feature.title}</p>
                                        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom — Social proof */}
                <div className="relative z-10 p-10 pt-0">
                    <div className="flex items-center gap-3" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
                        {/* Avatar stack */}
                        <div className="flex -space-x-2">
                            {['#dc2626', '#ef4444', '#f97316', '#f59e0b'].map((color, i) => (
                                <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                    style={{
                                        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                                        border: '2px solid #1a1a1a',
                                        zIndex: 4 - i
                                    }}>
                                    {['S', 'A', 'R', 'M'][i]}
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white">
                                Trusted by <span style={{ color: '#ef4444' }}>10,000+</span> developers
                            </p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                ))}
                                <span className="text-[10px] ml-1" style={{ color: '#6b7280' }}>4.9/5</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right edge fade line */}
                <div className="absolute top-0 right-0 w-[1px] h-full"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(220,38,38,0.15), rgba(255,255,255,0.05), transparent)' }} />
            </div>

            {/* ═══════════════ RIGHT PANEL — LOGIN FORM ═══════════════ */}
            <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center px-6 relative"
                style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #ffffff 100%)' }}>

                {/* Subtle background orbs for right side */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full opacity-[0.08]"
                        style={{
                            background: 'radial-gradient(circle, #fca5a5 0%, transparent 70%)',
                            animation: 'float1 8s ease-in-out infinite'
                        }} />
                    <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-[0.06]"
                        style={{
                            background: 'radial-gradient(circle, #fecaca 0%, transparent 70%)',
                            animation: 'float3 12s ease-in-out infinite'
                        }} />
                </div>

                <div className="w-full max-w-[400px] relative z-10"
                    style={{ animation: 'fadeInUp 0.6s ease-out' }}>

                    {/* Mobile-only logo (hidden on lg+) */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                            style={{
                                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
                            }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 18 22 12 16 6" />
                                <polyline points="8 6 2 12 8 18" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>CodeBits</h1>
                    </div>

                    {/* Heading */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#111827', letterSpacing: '-0.02em' }}>
                            Welcome back
                        </h2>
                        <p className="mt-1.5 text-sm" style={{ color: '#9ca3af' }}>
                            Sign in to continue your journey
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-start gap-2.5 text-sm font-medium animate-pulse">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <div>
                                <span className="font-semibold block">Incorrect Credentials</span>
                                <span className="text-xs opacity-85 block mt-0.5">{error.message || error || "Please double check your email and password."}</span>
                            </div>
                        </div>
                    )}

                    {/* Form Card */}
                    <div className="relative rounded-2xl p-[1px]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(220,38,38,0.12) 0%, rgba(0,0,0,0.03) 50%, rgba(220,38,38,0.06) 100%)'
                        }}>
                        <div className="rounded-2xl px-7 py-7"
                            style={{
                                background: 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(40px)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)'
                            }}>
                            <form
                                onSubmit={handleSubmit(submitData)}
                                className="flex flex-col space-y-5"
                            >
                                {/* Email */}
                                <div>
                                    <label htmlFor="emailId"
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: focusedField === 'email' ? '#dc2626' : '#6b7280', transition: 'color 0.2s ease' }}>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: focusedField === 'email' ? '#dc2626' : '#9ca3af', transition: 'color 0.2s ease' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                            </svg>
                                        </div>
                                        <input
                                            id="emailId"
                                            {...register('emailId')}
                                            placeholder="you@example.com"
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200"
                                            style={{
                                                background: 'rgba(249,250,251,0.8)',
                                                border: errors.emailId
                                                    ? '1px solid rgba(239,68,68,0.6)'
                                                    : focusedField === 'email'
                                                        ? '1px solid rgba(220,38,38,0.4)'
                                                        : '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: focusedField === 'email'
                                                    ? '0 0 0 3px rgba(220,38,38,0.06), 0 1px 3px rgba(0,0,0,0.04) inset'
                                                    : '0 1px 3px rgba(0,0,0,0.04) inset'
                                            }}
                                        />
                                    </div>
                                    {errors.emailId && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <p className="text-xs font-medium" style={{ color: '#ef4444' }}>
                                                {errors.emailId.message}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password"
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: focusedField === 'password' ? '#dc2626' : '#6b7280', transition: 'color 0.2s ease' }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: focusedField === 'password' ? '#dc2626' : '#9ca3af', transition: 'color 0.2s ease' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            {...register('password')}
                                            placeholder="••••••••"
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200"
                                            style={{
                                                background: 'rgba(249,250,251,0.8)',
                                                border: errors.password
                                                    ? '1px solid rgba(239,68,68,0.6)'
                                                    : focusedField === 'password'
                                                        ? '1px solid rgba(220,38,38,0.4)'
                                                        : '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: focusedField === 'password'
                                                    ? '0 0 0 3px rgba(220,38,38,0.06), 0 1px 3px rgba(0,0,0,0.04) inset'
                                                    : '0 1px 3px rgba(0,0,0,0.04) inset'
                                            }}
                                        />
                                    </div>
                                    {errors.password && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <p className="text-xs font-medium" style={{ color: '#ef4444' }}>
                                                {errors.password.message}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Forgot password link */}
                                <div className="flex justify-end -mt-1">
                                    <Link to="#"
                                        className="text-xs font-medium transition-colors duration-200"
                                        style={{ color: '#9ca3af' }}
                                        onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                                        onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Divider */}
                                <div className="relative py-1">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full py-3 px-4 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                        boxShadow: '0 4px 20px rgba(220,38,38,0.25), 0 0 0 1px rgba(220,38,38,0.1) inset, 0 1px 0 rgba(255,255,255,0.1) inset'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) {
                                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(220,38,38,0.4), 0 0 0 1px rgba(220,38,38,0.2) inset, 0 1px 0 rgba(255,255,255,0.15) inset';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(220,38,38,0.25), 0 0 0 1px rgba(220,38,38,0.1) inset, 0 1px 0 rgba(255,255,255,0.1) inset';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                    onMouseDown={(e) => {
                                        if (!loading) e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                                    }}
                                    onMouseUp={(e) => {
                                        if (!loading) e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
                                    }}
                                >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                                        style={{
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
                                        }} />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                Log In
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                    className="transition-transform duration-200 group-hover:translate-x-0.5">
                                                    <path d="M5 12h14" />
                                                    <path d="m12 5 7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </span>
                                </button>

                                {/* Sign up link */}
                                <p className="text-center text-sm" style={{ color: '#9ca3af' }}>
                                    New to CodeBits?{" "}
                                    <Link
                                        to="/signup"
                                        className="font-semibold transition-colors duration-200"
                                        style={{ color: '#dc2626' }}
                                        onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.target.style.color = '#dc2626'}
                                    >
                                        Create account
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Bottom decorative text */}
                    <p className="text-center mt-6 text-xs" style={{ color: '#d1d5db' }}>
                        Practice. Code. Succeed.
                    </p>
                </div>
            </div>

            {/* Keyframe animations */}
            <style>{`
                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.05); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-40px, 20px) scale(1.1); }
                    66% { transform: translate(30px, -30px) scale(0.9); }
                }
                @keyframes float3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(50px, -40px) scale(1.15); }
                }
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
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    )
}
export default Login