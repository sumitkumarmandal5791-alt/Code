import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, KeyRound, AlertCircle, Loader2 } from "lucide-react";
import { signupSchema } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";
import PasswordInput from "./PasswordInput";
import PasswordStrength from "./PasswordStrength";
import authService from "../../services/authService";

export const SignupForm = ({ role = "user", onSwitchToLogin, onDirtyChange }) => {
  const { signup } = useAuth();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      emailId: "",
      password: "",
      confirmPassword: "",
      terms: true,
      adminInviteCode: "",
    },
  });

  const passwordValue = watch("password", "");

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data) => {
    setServerError("");
    setSubmitting(true);
    try {
      await signup(
        {
          firstName: data.firstName,
          emailId: data.emailId,
          password: data.password,
          adminInviteCode: data.adminInviteCode,
        },
        role
      );
    } catch (err) {
      const message = authService.getErrorMessage(err);
      setServerError(message);

      if (message.toLowerCase().includes("email")) {
        setError("emailId", { type: "server", message });
      } else if (message.toLowerCase().includes("password")) {
        setError("password", { type: "server", message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isRoleAdmin = role === "admin";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
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

      {/* Name Field */}
      <div className="flex flex-col gap-1 w-full">
        <label
          htmlFor="signup-firstName"
          className="text-[13px] font-medium text-gray-700 dark:text-gray-300"
        >
          Name
        </label>
        <div className="relative flex items-center">
          <User size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
          <input
            id="signup-firstName"
            type="text"
            placeholder="Alex Rivera"
            autoFocus
            aria-invalid={!!errors.firstName}
            aria-describedby="signup-name-error"
            className={`w-full h-11 pl-9 pr-3.5 bg-white dark:bg-[#1c1c1c] border ${
              errors.firstName
                ? "border-red-500"
                : "border-gray-200 dark:border-white/10"
            } rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
            {...register("firstName")}
          />
        </div>
        {errors.firstName && (
          <div
            id="signup-name-error"
            role="alert"
            className="flex items-center gap-1 text-[11px] font-medium text-red-500 mt-0.5"
          >
            <AlertCircle size={12} className="flex-shrink-0" />
            <span>{errors.firstName.message}</span>
          </div>
        )}
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1 w-full">
        <label
          htmlFor="signup-emailId"
          className="text-[13px] font-medium text-gray-700 dark:text-gray-300"
        >
          Email
        </label>
        <div className="relative flex items-center">
          <Mail size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
          <input
            id="signup-emailId"
            type="email"
            placeholder="you@email.com"
            aria-invalid={!!errors.emailId}
            aria-describedby="signup-email-error"
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
            id="signup-email-error"
            role="alert"
            className="flex items-center gap-1 text-[11px] font-medium text-red-500 mt-0.5"
          >
            <AlertCircle size={12} className="flex-shrink-0" />
            <span>{errors.emailId.message}</span>
          </div>
        )}
      </div>

      {/* Admin Invite Code (Shown ONLY for Admin + Signup) */}
      {isRoleAdmin && (
        <div className="flex flex-col gap-1 w-full">
          <label
            htmlFor="signup-adminInviteCode"
            className="text-[13px] font-medium text-gray-700 dark:text-gray-300 flex justify-between"
          >
            <span>Admin Secret Key</span>
            <span className="text-[10px] text-emerald-600">Required</span>
          </label>
          <div className="relative flex items-center">
            <KeyRound size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              id="signup-adminInviteCode"
              type="password"
              placeholder="Enter invite key"
              className="w-full h-11 pl-9 pr-3.5 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              {...register("adminInviteCode")}
            />
          </div>
        </div>
      )}

      {/* Password Field with Progressive Disclosure Help */}
      <div>
        <PasswordInput
          id="signup-password"
          label="Password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          describedBy="signup-password-error"
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          {...register("password")}
        />
        <PasswordStrength
          password={passwordValue}
          isFocused={isPasswordFocused}
        />
      </div>

      {/* Confirm Password Field */}
      <PasswordInput
        id="signup-confirmPassword"
        label="Confirm Password"
        placeholder="Repeat password"
        error={errors.confirmPassword?.message}
        describedBy="signup-confirm-error"
        {...register("confirmPassword")}
      />

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 rounded-xl text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-3 shadow-xs"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create account</span>
        )}
      </button>

      {/* Terms Line (No checkbox) */}
      <p className="text-[11px] text-gray-400 text-center leading-relaxed pt-1">
        By continuing, you agree to our{" "}
        <a href="#terms" className="text-gray-600 dark:text-gray-300 underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="#privacy" className="text-gray-600 dark:text-gray-300 underline">
          Privacy Policy
        </a>.
      </p>

      {/* Switch to Login */}
      <div className="pt-1 text-center text-xs text-gray-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
