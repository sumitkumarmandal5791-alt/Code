import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import authService from "../services/authService";
import axiosClient from "../utils/axios";

export const AuthContext = createContext(null);

// BroadcastChannel for cross-tab auth state synchronization
const AUTH_CHANNEL_NAME = "codebits_auth_sync";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal Control State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    initialRole: "user", // "user" | "admin"
    initialMode: "login", // "login" | "signup"
  });

  const navigate = useNavigate();

  // Role resolution from verified server payload
  // NOTE: Frontend role checks are for UX only; the backend enforces real access control.
  const role = user?.role || null;
  const isAuthenticated = !!user;

  /**
   * Helper to open modal with custom role and mode
   */
  const openAuthModal = useCallback((config = {}) => {
    setModalConfig({
      initialRole: config.role || "user",
      initialMode: config.mode || "login",
    });
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  /**
   * Cross-tab sync setup
   */
  useEffect(() => {
    let channel;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data?.type === "LOGOUT") {
            setUser(null);
            toast("Session ended in another tab", { icon: "ℹ️" });
            navigate("/");
          } else if (event.data?.type === "LOGIN" && event.data.user) {
            setUser(event.data.user);
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported in this environment", e);
    }

    return () => {
      if (channel) channel.close();
    };
  }, [navigate]);

  /**
   * Fetch current session on app load
   */
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const verifiedUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(verifiedUser);
        }
      } catch (err) {
        // Not authenticated or expired session
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Global Axios Interceptor for 401s
   */
  useEffect(() => {
    const interceptor = axiosClient.interceptors.response.use(
      (response) => response,
      (error) => {
        // If unauthorized and not already on check endpoint
        if (
          error.response?.status === 401 &&
          !error.config?.url?.includes("/user/check")
        ) {
          setUser(null);
          openAuthModal({ mode: "login" });
          toast.error("Session expired. Please log in again.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.response.eject(interceptor);
    };
  }, [openAuthModal]);

  /**
   * Log in action
   */
  const login = useCallback(
    async (credentials) => {
      const authenticatedUser = await authService.login(credentials);
      setUser(authenticatedUser);

      // Broadcast login across tabs
      try {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage({ type: "LOGIN", user: authenticatedUser });
        channel.close();
      } catch (_) {}

      toast.success(
        `Welcome back, ${authenticatedUser.firstName || "Coder"}!`
      );
      closeAuthModal();

      // Role-based redirect
      if (authenticatedUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
      return authenticatedUser;
    },
    [closeAuthModal, navigate]
  );

  /**
   * Sign up action
   */
  const signup = useCallback(
    async (userData, selectedRole = "user") => {
      let registeredUser;
      if (selectedRole === "admin") {
        registeredUser = await authService.adminSignup(userData);
      } else {
        registeredUser = await authService.signup(userData);
      }

      // If response returned a user object
      const effectiveUser =
        registeredUser?.user || registeredUser || { role: selectedRole };
      setUser(effectiveUser);

      // Broadcast login
      try {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage({ type: "LOGIN", user: effectiveUser });
        channel.close();
      } catch (_) {}

      toast.success("Account created successfully!");
      closeAuthModal();

      if (effectiveUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
      return effectiveUser;
    },
    [closeAuthModal, navigate]
  );

  /**
   * Log out action
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setUser(null);

      // Sync logout across tabs
      try {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage({ type: "LOGOUT" });
        channel.close();
      } catch (_) {}

      toast.success("Logged out successfully");
      navigate("/");
    }
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      loading,
      login,
      signup,
      logout,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      modalConfig,
    }),
    [
      user,
      role,
      isAuthenticated,
      loading,
      login,
      signup,
      logout,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      modalConfig,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-500">
            Initializing CodeBits...
          </p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

