import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { loginSchema } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";
import PasswordInput from "./PasswordInput";
import authService from "../../services/authService";

export const LoginForm = ({ role = "user", onSwitchToSignup, onDirtyChange }) => {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      emailId: "",
      password: "",
      rememberMe: false,
    },
  });

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data) => {
    setServerError("");
    setSubmitting(true);
    try {
      await login({
        emailId: data.emailId,
        password: data.password,
      });
    } catch (err) {
      const message = authService.getErrorMessage(err);
      setServerError(message);

      if (message.toLowerCase().includes("email") || message.toLowerCase().includes("user not found")) {
        setError("emailId", { type: "server", message });
      } else if (message.toLowerCase().includes("password") || message.toLowerCase().includes("credential")) {
        setError("password", { type: "server", message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
      {/* Server Error (Red text with icon, no filled box) */}
      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 animate-in fade-in"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="flex flex-col gap-1 w-full">
        <label
          htmlFor="login-emailId"
          className="text-[13px] font-medium text-gray-700 dark:text-gray-300"
        >
          Email
        </label>
        <div className="relative flex items-center">
          <Mail size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
          <input
            id="login-emailId"
            type="email"
            placeholder="you@email.com"
            autoFocus
            aria-invalid={!!errors.emailId}
            aria-describedby="login-email-error"
            className={`w-full h-11 pl-9 pr-3.5 bg-white dark:bg-[#1c1c1c] border ${
              errors.emailId
                ? "border-red-500"
                : "border-gray-200 dark:border-white/10"
            } rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
            {...register("emailId")}
          />
        </div>
        {errors.emailId && (
          <div
            id="login-email-error"
            role="alert"
            className="flex items-center gap-1 text-[11px] font-medium text-red-500 mt-0.5"
          >
            <AlertCircle size={12} className="flex-shrink-0" />
            <span>{errors.emailId.message}</span>
          </div>
        )}
      </div>

      {/* Password Field */}
      <PasswordInput
        id="login-password"
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        describedBy="login-password-error"
        {...register("password")}
      />

      {/* Remember me & Forgot Password */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20"
            {...register("rememberMe")}
          />
          <span>Remember me</span>
        </label>

        <button
          type="button"
          onClick={() => alert("Password reset link sent to your email.")}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          Forgot password?
        </button>
      </div>

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 rounded-xl text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2 shadow-xs"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign in</span>
        )}
      </button>

      {/* Switch to Signup */}
      <div className="pt-2 text-center text-xs text-gray-500">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
