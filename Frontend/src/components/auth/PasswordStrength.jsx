import React from "react";
import { calculatePasswordStrength } from "../../utils/validators";

export const PasswordStrength = ({ password = "", isFocused = false }) => {
  if (!password) return null;

  const { score, checks, passedCount } = calculatePasswordStrength(password);
  const isComplete = passedCount === 5;

  // Single dynamic guidance line (fewer words)
  const getHintText = () => {
    if (isComplete) return "Strong password";
    if (!checks.length) return "Must be at least 8 characters";
    if (!checks.uppercase || !checks.lowercase) return "Add uppercase & lowercase letters";
    if (!checks.number) return "Add a number (0-9)";
    if (!checks.special) return "Add a special character (!@#$)";
    return "Almost there";
  };

  const getBarColor = () => {
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-amber-500";
    if (score === 3) return "bg-emerald-500";
    return "bg-emerald-600";
  };

  return (
    <div className="w-full mt-1.5 space-y-1.5">
      {/* ONE Thin Strength Bar */}
      <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          style={{ width: `${(score / 4) * 100}%` }}
          className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
        />
      </div>

      {/* Single Hint Line */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-500 dark:text-gray-400">{getHintText()}</span>
        {isComplete && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Meets all rules</span>
        )}
      </div>

      {/* Progressive disclosure: show compact checklist ONLY while focused and not yet valid */}
      {isFocused && !isComplete && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[10px] text-gray-500">
          <span className={checks.length ? "text-emerald-600 font-medium" : "text-gray-400"}>
            {checks.length ? "✓" : "•"} 8+ chars
          </span>
          <span className={checks.uppercase && checks.lowercase ? "text-emerald-600 font-medium" : "text-gray-400"}>
            {checks.uppercase && checks.lowercase ? "✓" : "•"} Upper &amp; lower
          </span>
          <span className={checks.number ? "text-emerald-600 font-medium" : "text-gray-400"}>
            {checks.number ? "✓" : "•"} Number
          </span>
          <span className={checks.special ? "text-emerald-600 font-medium" : "text-gray-400"}>
            {checks.special ? "✓" : "•"} Symbol
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
