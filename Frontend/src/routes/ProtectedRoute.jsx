import React, { useEffect } from "react";
import { Navigate, Link } from "react-router";
import { ShieldX, Home } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoute: Enforces client-side role-based page gating.
 *
 * NOTE: Frontend role checks are for UX only; the backend API enforces real access control.
 *
 * @param {Array<string>} allowedRoles - Roles permitted to view this route (e.g. ['admin', 'user'])
 * @param {React.ReactNode} children - Child element to render if authorized
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openAuthModal({ mode: "login" });
    }
  }, [loading, isAuthenticated, openAuthModal]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Checking authorization...</p>
      </div>
    );
  }

  // Not logged in -> redirect home where auth modal will pop open
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If role is specified and does not match -> 403 Access Denied
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <ShieldX size={28} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            Error 403: Forbidden
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1 mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            You do not have administrative permission to view this page. Contact an administrator if you believe this is an error.
          </p>
          <Link
            to="/home"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <Home size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

