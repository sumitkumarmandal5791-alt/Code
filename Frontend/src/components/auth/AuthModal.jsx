import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../hooks/useModal";
import RoleSelector from "./RoleSelector";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, modalConfig } = useAuth();

  const [role, setRole] = useState("user"); // "user" | "admin"
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setRole(modalConfig.initialRole || "user");
      setMode(modalConfig.initialMode || "login");
      setIsFormDirty(false);
    }
  }, [isAuthModalOpen, modalConfig]);

  const { modalRef, handleSafeClose } = useModal({
    isOpen: isAuthModalOpen,
    onClose: closeAuthModal,
    isDirty: isFormDirty,
  });

  if (!isAuthModalOpen) return null;

  const isModeLogin = mode === "login";

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleSafeClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[400px] max-h-[88vh] overflow-y-auto bg-white dark:bg-[#141414] rounded-t-2xl sm:rounded-2xl shadow-xl p-6 border border-gray-200/80 dark:border-white/10 text-left animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150 scrollbar-thin"
      >
        {/* Neutral 32px Close Button */}
        <button
          type="button"
          onClick={handleSafeClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Clean Header */}
        <div className="mb-4 pr-8">
          <h2
            id="auth-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            {isModeLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your details to continue.
          </p>
        </div>

        {/* Quiet Role Selector */}
        <RoleSelector selectedRole={role} onChange={setRole} />

        {/* Prominent Mode Tabs (Sign In / Sign Up) with Emerald Accent */}
        <div className="flex border-b border-gray-200/80 dark:border-white/10 mb-4.5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setIsFormDirty(false);
            }}
            className={`flex-1 pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              isModeLogin
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setIsFormDirty(false);
            }}
            className={`flex-1 pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              !isModeLogin
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
                : "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        {isModeLogin ? (
          <LoginForm
            role={role}
            onSwitchToSignup={() => {
              setMode("signup");
              setIsFormDirty(false);
            }}
            onDirtyChange={setIsFormDirty}
          />
        ) : (
          <SignupForm
            role={role}
            onSwitchToLogin={() => {
              setMode("login");
              setIsFormDirty(false);
            }}
            onDirtyChange={setIsFormDirty}
          />
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AuthModal;
