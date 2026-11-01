import React, { useState, useEffect } from "react";
import {
  Play,
  ExternalLink,
  VideoOff,
  Youtube,
  Clock,
  Lock,
  Sparkles,
  ShieldCheck,
  Check,
  CreditCard,
  Loader2,
} from "lucide-react";
import axiosClient from "../utils/axios";
import { triggerConfetti } from "../lib/confetti";
import toast from "react-hot-toast";

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
function formatTimestamp(seconds) {
  if (!seconds || seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Loads Razorpay checkout script dynamically if not already loaded.
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Video Solution component with Razorpay paywall protection.
 * - For paid users / admins: Renders official YouTube iframe player.
 * - For unpaid users: Displays locked state with "Unlock for ₹49" and "All-Access Pass (₹499)" options.
 */
export function VideoSolution({
  videoId,
  startTime = 0,
  originalUrl,
  channel = "takeUforward",
  video, // supports passing either individual props or a video object
  problemId,
  hasAccess = false,
  isLocked = false,
  videoPreview,
  onUnlocked,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideo, setActiveVideo] = useState(video);
  const [userHasAccess, setUserHasAccess] = useState(hasAccess);
  const [isProcessing, setIsProcessing] = useState(null); // 'problem' | 'all_access' | null

  // Synchronize state when incoming props update
  useEffect(() => {
    if (video && video.videoId) {
      setActiveVideo(video);
      setUserHasAccess(true);
    } else {
      setUserHasAccess(hasAccess);
    }
  }, [video, hasAccess]);

  const currentVideo = activeVideo || video;
  const vId = videoId || currentVideo?.videoId;
  const start = startTime ?? currentVideo?.startTime ?? 0;
  const origUrl =
    originalUrl ||
    currentVideo?.originalUrl ||
    (vId ? `https://www.youtube.com/watch?v=${vId}${start ? `&t=${start}s` : ""}` : "");
  const chName = channel || currentVideo?.channel || videoPreview?.channel || "takeUforward";

  const singlePrice = videoPreview?.price || 49;
  const allAccessPrice = videoPreview?.allAccessPrice || 499;

  // Handle Razorpay checkout for single video or all-access pass
  const handlePayment = async (itemType) => {
    if (isProcessing) return;
    setIsProcessing(itemType);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay checkout SDK. Please check your connection.");
        setIsProcessing(null);
        return;
      }

      // 1. Create order on server (server calculates authoritative price)
      const { data: orderData } = await axiosClient.post("/payment/create-order", {
        itemType,
        problemId: itemType === "problem" ? problemId : undefined,
      });

      // 2. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || "INR",
        name: "CodeBits Judge",
        description:
          itemType === "all_access"
            ? "Lifetime All-Access Pass (All Video Solutions)"
            : `Editorial Video Solution (${orderData.notes?.itemTitle || "Problem"})`,
        order_id: orderData.orderId,
        theme: {
          color: "#10b981", // emerald theme matching accepted badges
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(null);
            toast("Payment cancelled.", { icon: "ℹ️" });
          },
        },
        handler: async (response) => {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });

            // 3. Verify payment signature on backend
            const { data: verifyData } = await axiosClient.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              itemType,
              problemId,
            });

            if (verifyData.success) {
              toast.success("Payment verified! Access granted.", { id: "payment-verify" });
              triggerConfetti();

              // 4. Fetch the unlocked video details from protected endpoint
              if (problemId) {
                const { data: unlockedData } = await axiosClient.get(`/payment/video/${problemId}`);
                if (unlockedData.video) {
                  setActiveVideo(unlockedData.video);
                  setUserHasAccess(true);
                  onUnlocked?.(unlockedData.video);
                }
              } else {
                setUserHasAccess(true);
              }
            } else {
              toast.error(verifyData.error || "Payment verification failed.", { id: "payment-verify" });
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error(err.response?.data?.error || "Payment verification failed.", { id: "payment-verify" });
          } finally {
            setIsProcessing(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (err) => {
        toast.error(`Payment failed: ${err.error?.description || "Transaction declined"}`);
        setIsProcessing(null);
      });
      rzp.open();
    } catch (err) {
      console.error("Order creation error:", err);
      toast.error(err.response?.data?.error || "Failed to initiate payment. Please try again.");
      setIsProcessing(null);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 1. LOCKED PAYWALL UI (For unpaid users)
  // ═══════════════════════════════════════════════════════════════════
  const isVideoLocked = !userHasAccess && (isLocked || Boolean(videoPreview?.hasVideo) || !vId);

  if (isVideoLocked) {
    return (
      <div className="space-y-4 font-sans animate-in fade-in">
        {/* Locked Hero Banner / Preview */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
          {/* Subtle blurred background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.12),transparent_70%)]" />

          {/* Glowing Lock Badge */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mb-4 shadow-xl backdrop-blur-md">
            <Lock size={32} className="drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
          </div>

          <h3 className="relative text-base sm:text-lg font-bold text-white mb-1.5 flex items-center gap-2">
            <span>Premium Video Editorial</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Locked
            </span>
          </h3>

          <p className="relative text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed mb-4">
            Watch Striver ({chName}) walk through the intuition, brute force, optimal approach, and clean C++/Java/Python implementation.
          </p>

          <div className="relative flex items-center gap-4 text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Instant Lifetime Access</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-400" />
              <span>Step-by-Step Logic</span>
            </span>
          </div>
        </div>

        {/* Pricing & Purchase Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Unlock Current Problem */}
          <div className="relative rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Single Problem
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Lifetime
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  ₹{singlePrice}
                </span>
                <span className="text-xs text-gray-400 line-through">₹149</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Unlock full video solution and timestamped breakdown for this problem only.
              </p>
            </div>

            <button
              onClick={() => handlePayment("problem")}
              disabled={isProcessing !== null}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing === "problem" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Opening Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  <span>Unlock for ₹{singlePrice}</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: All-Access Pass (Best Value) */}
          <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-emerald-950/20 to-neutral-900/60 dark:bg-gradient-to-b dark:from-emerald-950/30 dark:to-[#181818] border-2 border-emerald-500/40 shadow-md flex flex-col justify-between">
            {/* Best Value Badge */}
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles size={10} />
              <span>Best Value</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span>All-Access Pass</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  90% OFF
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  ₹{allAccessPrice}
                </span>
                <span className="text-xs text-gray-500 line-through">₹4,999</span>
              </div>
              <p className="text-xs text-gray-300 dark:text-gray-400 mb-4">
                Unlimited access to <strong>all existing and future</strong> video solutions across the entire platform.
              </p>
            </div>

            <button
              onClick={() => handlePayment("all_access")}
              disabled={isProcessing !== null}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-black font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing === "all_access" ? (
                <>
                  <Loader2 size={14} className="animate-spin text-black" />
                  <span>Opening Checkout...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Get All-Access Pass (₹{allAccessPrice})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. EMPTY STATE (When no video has been seeded for this problem)
  // ═══════════════════════════════════════════════════════════════════
  if (!vId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-4">
          <VideoOff size={28} />
        </div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
          No video available yet
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
          A video solution has not been attached for this problem yet. Check the reference solution or use the AI Tutor for guided hints.
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. UNLOCKED VIDEO PLAYER (For authorized users)
  // ═══════════════════════════════════════════════════════════════════
  const thumbnailUrl = `https://img.youtube.com/vi/${vId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${vId}?start=${start}&autoplay=1`;

  return (
    <div className="space-y-4 font-sans animate-in fade-in">
      {/* Access Status Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
          <Check size={14} />
          <span>Video Solution Unlocked</span>
        </div>
        <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
          Lifetime Access
        </span>
      </div>

      {/* 16:9 Responsive Video / Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-gray-200/80 dark:border-white/10 shadow-lg group">
        {!isPlaying ? (
          <div
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center"
            title="Click to play video"
          >
            {/* Background Thumbnail Image */}
            <img
              src={thumbnailUrl}
              alt="Video solution thumbnail"
              className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
              loading="lazy"
            />

            {/* Gradient Overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 group-hover:from-black/60 transition-colors" />

            {/* Centered YouTube Play Button */}
            <div className="absolute flex flex-col items-center gap-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <Play size={32} className="fill-current ml-1" />
              </div>
              <span className="text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                Watch Video Solution
              </span>
            </div>

            {/* Timestamp Badge (if starting at specific point) */}
            {start > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-white font-mono text-[11px] font-semibold">
                <Clock size={12} className="text-red-400" />
                <span>Starts at {formatTimestamp(start)}</span>
              </div>
            )}
          </div>
        ) : (
          /* Official Lazy-Loaded YouTube Embed */
          <iframe
            src={embedUrl}
            title="YouTube video solution"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 rounded-2xl"
          />
        )}
      </div>

      {/* Attribution & Original Link Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 text-xs">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Youtube size={18} className="text-red-600 flex-shrink-0" />
          <span className="font-medium">
            Video by <strong className="text-gray-900 dark:text-white">Striver ({chName})</strong>
          </span>
        </div>

        {origUrl && (
          <a
            href={origUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline cursor-pointer"
          >
            <span>Watch on YouTube</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

export default VideoSolution;