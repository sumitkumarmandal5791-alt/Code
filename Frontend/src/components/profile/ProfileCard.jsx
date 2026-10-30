import React, { useState } from "react";
import { Mail, Globe, Lock, Copy, Check, Edit3, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import EditProfileModal from "./EditProfileModal";

export function ProfileCard({ profile, isOwnProfile = true, onUpdateProfile }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const username = profile?.username || "coder";
  const displayName = profile?.firstName || "Developer";
  const email = profile?.email || "developer@codebits.dev";
  const bio = profile?.bio || "Sharpening algorithmic thinking on CodeBits.";
  const isPrivate = profile?.visibility === "private";
  const avatarUrl = profile?.avatar;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(`@${username}`);
      setCopied(true);
      toast.success("Copied to clipboard!", { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy username");
    }
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm transition-all duration-200">
        {/* Top: Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/10">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-2xl font-black text-gray-900 dark:text-white tracking-wider">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {profile?.role === "admin" && (
              <span
                title="Verified Admin"
                className="absolute bottom-0 right-0 p-1 bg-red-600 text-white rounded-full border-2 border-white dark:border-[#121212] shadow-sm"
              >
                <ShieldCheck size={14} />
              </span>
            )}
          </div>

          {/* Display Name & Username */}
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {displayName}
          </h2>

          <div className="flex items-center gap-1.5 mt-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
            <span>@{username}</span>
            <button
              type="button"
              onClick={handleCopyUsername}
              aria-label="Copy username to clipboard"
              title="Copy username"
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>

          {/* Bio */}
          {bio && (
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs">
              {bio}
            </p>
          )}

          {/* Email & Privacy Badge (Hidden if public visitor viewing private profile) */}
          {(!isPrivate || isOwnProfile) && (
            <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300">
              <Mail size={13} className="text-gray-400" />
              <span className="truncate max-w-[180px]">{email}</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isPrivate
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {isPrivate ? "Private" : "Public"}
              </span>
            </div>
          )}

          {/* Full-Width Edit Profile Button (Own Profile Only) */}
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 hover:border-red-500/40 text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-white/[0.02] hover:bg-red-50/50 dark:hover:bg-red-950/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentProfile={profile}
        onSave={onUpdateProfile}
      />
    </>
  );
}

export default ProfileCard;

