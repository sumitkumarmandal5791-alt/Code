import React, { useState, forwardRef } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export const PasswordInput = forwardRef(
  (
    {
      id,
      name,
      label = "Password",
      placeholder = "At least 8 characters",
      error,
      describedBy,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={id || name}
            className="text-[13px] font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <Lock
            size={16}
            className="absolute left-3 text-gray-400 pointer-events-none"
          />

          <input
            ref={ref}
            id={id || name}
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`w-full h-11 pl-9 pr-10 bg-white dark:bg-[#1c1c1c] border ${
              error
                ? "border-red-500"
                : "border-gray-200 dark:border-white/10"
            } rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div
            id={describedBy}
            role="alert"
            className="flex items-center gap-1 text-[11px] font-medium text-red-500 mt-0.5 animate-in fade-in"
          >
            <AlertCircle size={12} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
