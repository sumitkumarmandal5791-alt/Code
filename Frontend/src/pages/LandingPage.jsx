import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Code2,
  Sparkles,
  ArrowRight,
  Zap,
  Laptop,
  Brain,
  Trophy,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./LandingPage.css";

const CODING_QUOTES = [
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    tag: "Problem Solving",
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    tag: "Linux & Git Creator",
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    tag: "Clean Architecture",
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    tag: "Extreme Programming",
  },
  {
    text: "Any fool can write code that a computer understands. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    tag: "Refactoring",
  },
  {
    text: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    tag: "Algorithm Design",
  },
  {
    text: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
    tag: "Debugging Wisdom",
  },
];

const TICKER_QUOTES = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Clean code always looks like it was written by someone who cares.", author: "Robert C. Martin" },
  { text: "It's not a bug; it's an undocumented feature.", author: "Anonymous" },
  { text: "Code never lies, comments sometimes do.", author: "Ron Jeffries" },
];

function LandingPage() {
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout, openAuthModal } = useAuth();

  // Coding quotes in motion state
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [isMotionPlaying, setIsMotionPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const DURATION = 4200; // 4.2s per quote

  useEffect(() => {
    if (!isMotionPlaying) return;

    const intervalTime = 50;
    const step = (intervalTime / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveQuoteIndex((curr) => (curr + 1) % CODING_QUOTES.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isMotionPlaying, activeQuoteIndex]);

  // Handle Start Button (triggers modal or role-based redirect if authenticated)
  const handleStartClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isAuthenticated) {
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      openAuthModal({ role: "user", mode: "signup" });
    }
  };

  const isRoleAdmin = role === "admin";

  return (
    <div className="codebits-landing">
      {/* Top Navbar */}
      <header className="landing-nav">
        <Link to="/" className="brand-link">
          <div className="brand-icon-wrapper">
            <Code2 size={22} />
          </div>
          <span>CodeBits</span>
        </Link>

        <nav className="nav-links">
          <Link to="/home" className="nav-item">
            Problems
          </Link>
          <Link to="/chats" className="nav-item">
            AI Assistant
          </Link>
          <Link to="/home" className="nav-item">
            Leaderboard
          </Link>
        </nav>

        <div className="nav-actions flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* User Avatar & Profile Link */}
              <Link
                to="/profile"
                title="View Profile & Activity Heatmap"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.firstName || "Coder"}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isRoleAdmin ? "text-red-600" : "text-emerald-700"
                    }`}
                  >
                    {isRoleAdmin ? "Admin" : "Profile"}
                  </span>
                </div>
              </Link>

              {/* Dashboard Shortcut */}
              <Link
                to={isRoleAdmin ? "/admin" : "/dashboard"}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                <LayoutDashboard size={14} />
                <span>Go to Dashboard</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuthModal({ role: "user", mode: "login" })}
                className="nav-signin-link text-sm font-semibold text-slate-700 hover:text-amber-600 transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal({ role: "user", mode: "signup" })}
                className="nav-join-btn px-5 py-2.5 text-sm font-bold rounded-full bg-[#ff9f00] hover:bg-[#ffb01f] text-gray-950 transition-all shadow-sm cursor-pointer"
              >
                Join Free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="hero-section">
        {/* Left Column: Heading, Subtitle, Start Button */}
        <div className="hero-content">
          <h1 className="hero-title">
            Build Your Skills
            <br />
            for Free.
          </h1>

          <p className="hero-subtitle">
            Master algorithms, data structures, and system design. Elevate your
            coding skills and prepare for technical interviews at top tech
            companies.
          </p>

          {/* Start Buttons */}
          <div className="hero-actions">
            <button
              type="button"
              onClick={handleStartClick}
              className="btn-start-primary"
              id="btn-start-hero"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get started (it's free)"}
            </button>
          </div>
        </div>

        {/* Right Column: Coder Image */}
        <div className="hero-image-wrapper">
          <div className="hero-illustration-container">
            <img
              src="/hero-image.jpg"
              alt="Coder learning and building skills"
              className="hero-coder-img"
            />
          </div>
        </div>
      </main>

      {/* Coding Quotes in Continuous Horizontal Motion */}
      <section className="quotes-ticker-section">
        <div className="quotes-ticker-bar">
          <div className="quotes-ticker-label">
            <Zap size={14} />
            <span>Dev Quotes in Motion</span>
          </div>

          <div className="quotes-ticker-track">
            {[...TICKER_QUOTES, ...TICKER_QUOTES].map((item, idx) => (
              <div key={idx} className="ticker-quote-item">
                <span className="text-amber-500 font-bold">&quot;</span>
                <strong>{item.text}</strong>
                <span className="author">— {item.author}</span>
                <span className="text-gray-600 ml-4">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="highlights-grid">
        <div className="feature-card">
          <div className="feature-icon-box bg-red-500/10 text-red-500">
            <Laptop size={24} />
          </div>
          <h3>Monaco Code Editor</h3>
          <p>
            Write, compile, and run solutions with real-time test cases, custom
            inputs, and sub-second execution across multiple programming
            languages.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box bg-amber-500/10 text-amber-500">
            <Brain size={24} />
          </div>
          <h3>AI-Powered Copilot</h3>
          <p>
            Get personalized algorithmic hints, complexity breakdowns, and
            debugging tips without spoiling the full solution when you get
            stuck.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box bg-blue-500/10 text-blue-500">
            <Trophy size={24} />
          </div>
          <h3>Streak &amp; Skill Tracking</h3>
          <p>
            Stay consistent with daily problem streaks, acceptance rate
            analytics, and topic mastery tracking across Easy, Medium, and Hard
            tiers.
          </p>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="bottom-cta-container">
        <div className="bottom-cta-card">
          <h2>Ready to Ace Your Next Coding Interview?</h2>
          <p>
            Join thousands of developers solving problems, building intuition,
            and cracking top tech opportunities every day.
          </p>
          <button
            type="button"
            onClick={handleStartClick}
            className="btn-start-primary"
          >
            <span>{isAuthenticated ? "Go to Dashboard" : "Start Free Now"}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          © {new Date().getFullYear()} CodeBits. Built for developers by
          developers. Keep coding in motion.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
