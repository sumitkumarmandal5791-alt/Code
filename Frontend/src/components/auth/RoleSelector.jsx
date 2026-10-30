import React from "react";

export const RoleSelector = ({ selectedRole, onChange }) => {
  return (
    <div className="w-full mb-3">
      <div
        role="tablist"
        aria-label="Select Account Role"
        className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl border border-gray-200/60 dark:border-white/5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedRole === "user"}
          onClick={() => onChange("user")}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedRole === "user"
              ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          Learner
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedRole === "admin"}
          onClick={() => onChange("admin")}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedRole === "admin"
              ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-xs"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          Admin
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;
