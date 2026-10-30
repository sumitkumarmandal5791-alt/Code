import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { User, LogOut, LayoutDashboard, Settings, Code2, ChevronDown } from "lucide-react";
import { logoutUser } from "../../authSlice";
import toast from "react-hot-toast";

export function UserMenuButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const isProfileActive = location.pathname.startsWith("/profile");

  // Close menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const displayName = user.firstName || "Developer";
  const initials = displayName.slice(0, 2).toUpperCase();
  const email = user.emailId || user.email || "";

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsOpen(false);
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open profile"
        title="Profile & Settings"
        className={`flex items-center gap-2 p-1 pl-1 pr-2 rounded-full border transition-all duration-200 cursor-pointer ${
          isProfileActive
            ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-950/20"
            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/50 dark:bg-white/[0.03]"
        }`}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            initials
          )}
        </div>

        <span className="hidden sm:inline-block text-xs font-semibold text-gray-700 dark:text-gray-200 max-w-[90px] truncate">
          {displayName}
        </span>

        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accessible Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Header */}
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {email}
              </p>
            )}
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className={`flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${
                isProfileActive
                  ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <User size={15} />
              <span>Profile &amp; Heatmap</span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <LayoutDashboard size={15} />
              <span>Problems Dashboard</span>
            </Link>

            <Link
              to="/chats"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <Code2 size={15} />
              <span>AI Chat &amp; Help</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenuButton;

