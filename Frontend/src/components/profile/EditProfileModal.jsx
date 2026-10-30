import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, User, Globe, Lock, AtSign, FileText, Image } from "lucide-react";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  avatar: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
  bio: z
    .string()
    .max(200, "Bio cannot exceed 200 characters")
    .optional(),
  visibility: z.enum(["public", "private"]),
});

export function EditProfileModal({ isOpen, onClose, currentProfile, onSave }) {
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: currentProfile?.firstName || "",
      username: currentProfile?.username || "",
      avatar: currentProfile?.avatar || "",
      bio: currentProfile?.bio || "",
      visibility: currentProfile?.visibility || "public",
    },
  });

  useEffect(() => {
    if (isOpen && currentProfile) {
      reset({
        firstName: currentProfile.firstName || "",
        username: currentProfile.username || "",
        avatar: currentProfile.avatar || "",
        bio: currentProfile.bio || "",
        visibility: currentProfile.visibility || "public",
      });
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [isOpen, currentProfile, reset]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const watchedAvatar = watch("avatar");
  const watchedVisibility = watch("visibility");

  const onSubmit = async (data) => {
    try {
      await onSave(data);
      onClose();
    } catch {
      // Error handled in hook toast
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-[#151515] text-gray-900 dark:text-gray-100 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5">
          <div>
            <h3 id="edit-profile-title" className="text-lg font-bold">
              Edit Profile
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update your public display information and preferences
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-tr from-red-500 to-orange-500 flex-shrink-0 flex items-center justify-center text-white text-lg font-bold border-2 border-white dark:border-gray-800 shadow-sm">
              {watchedAvatar ? (
                <img
                  src={watchedAvatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                currentProfile?.firstName?.[0] || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Avatar Image URL
              </label>
              <div className="relative">
                <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  {...register("avatar")}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              {errors.avatar && (
                <p className="text-[11px] text-red-500 mt-1">{errors.avatar.message}</p>
              )}
            </div>
          </div>

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={firstInputRef}
                  type="text"
                  placeholder="Your Name"
                  {...register("firstName")}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="username"
                  {...register("username")}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              {errors.username && (
                <p className="text-[11px] text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Bio
            </label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="Share a short summary of your coding journey or tech stack..."
                {...register("bio")}
                className="w-full text-xs p-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />
            </div>
            {errors.bio && (
              <p className="text-[11px] text-red-500 mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Profile Visibility Toggle */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
              Profile Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  watchedVisibility === "public"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <input
                  type="radio"
                  value="public"
                  {...register("visibility")}
                  className="hidden"
                />
                <Globe size={15} />
                <span>Public Profile</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  watchedVisibility === "private"
                    ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <input
                  type="radio"
                  value="private"
                  {...register("visibility")}
                  className="hidden"
                />
                <Lock size={15} />
                <span>Private Profile</span>
              </label>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
              Private profiles hide email address and sensitive activity details from public visitors.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-xl shadow-md shadow-red-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default EditProfileModal;

