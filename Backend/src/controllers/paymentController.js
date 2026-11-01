const crypto = require("crypto");
const { getRazorpayInstance } = require("../config/razorpay");
const pricing = require("../config/pricing");
const Problem = require("../Modles/problem");
const PaymentOrder = require("../Modles/paymentOrder");
const { checkUserVideoAccess, grantAccess } = require("../services/accessService");

/**
 * Creates a Razorpay order on the server.
 * The amount is strictly computed on the server and never trusted from client input.
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemType, problemId } = req.body;

    if (!itemType || !["problem", "all_access"].includes(itemType)) {
      return res.status(400).json({ error: "Invalid itemType. Must be 'problem' or 'all_access'." });
    }

    let amountInRupees = pricing.PER_VIDEO_PRICE;
    let targetProblem = null;

    if (itemType === "problem") {
      if (!problemId) {
        return res.status(400).json({ error: "problemId is required for per-video purchases." });
      }

      targetProblem = await Problem.findById(problemId);
      if (!targetProblem) {
        return res.status(404).json({ error: "Problem not found." });
      }

      // Check if user already owns access
      const accessStatus = await checkUserVideoAccess(userId, problemId);
      if (accessStatus.hasAccess) {
        return res.status(400).json({
          error: "You already have access to this video solution.",
          hasAccess: true,
          accessType: accessStatus.accessType,
        });
      }

      // Server determines price (with problem override if set)
      amountInRupees = targetProblem.videoPrice || pricing.PER_VIDEO_PRICE;
    } else if (itemType === "all_access") {
      const accessStatus = await checkUserVideoAccess(userId, null);
      if (accessStatus.accessType === "all_access" || accessStatus.accessType === "admin") {
        return res.status(400).json({
          error: "You already own the All-Access Pass.",
          hasAccess: true,
          accessType: accessStatus.accessType,
        });
      }

      amountInRupees = pricing.ALL_ACCESS_PRICE;
    }

    const amountInPaise = Math.round(amountInRupees * 100);
    const receipt = `rcpt_${Date.now()}_${userId.toString().slice(-4)}`;

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: pricing.CURRENCY,
      receipt,
      notes: {
        userId: userId.toString(),
        itemType,
        problemId: problemId || "all",
      },
    });

    // Record order in database
    await PaymentOrder.create({
      orderId: razorpayOrder.id,
      userId,
      itemType,
      itemId: itemType === "problem" ? problemId : null,
      amount: amountInRupees,
      amountInPaise,
      currency: pricing.CURRENCY,
      status: "created",
      receipt,
      notes: {
        itemTitle: targetProblem?.title || "All-Access Pass",
      },
    });

    return res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      amountInRupees,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      itemType,
      problemId,
      receipt,
      notes: {
        itemTitle: targetProblem?.title || "All-Access Pass",
      },
    });
  } catch (error) {
    console.error("[createOrder] Error:", error);
    return res.status(500).json({ error: error.message || "Failed to create payment order." });
  }
};

/**
 * Verifies Razorpay payment signature using HMAC SHA256 with timing-safe comparison.
 */
const verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemType,
      problemId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment verification fields." });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("[verifyPayment] RAZORPAY_KEY_SECRET is not configured!");
      return res.status(500).json({ error: "Server payment configuration error." });
    }

    // Generate expected HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const isSignatureValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!isSignatureValid) {
      console.warn(`[verifyPayment] Invalid signature for order: ${razorpay_order_id}`);
      await PaymentOrder.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed", paymentId: razorpay_payment_id, signature: razorpay_signature }
      );
      return res.status(400).json({ success: false, error: "Payment verification failed. Invalid signature." });
    }

    // 1. Update PaymentOrder record
    const updatedOrder = await PaymentOrder.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: "captured",
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
      { new: true }
    );

    const actualItemType = updatedOrder?.itemType || itemType;
    const actualItemId = updatedOrder?.itemId || problemId || null;

    // 2. Grant access idempotently
    await grantAccess({
      userId,
      itemType: actualItemType,
      itemId: actualItemId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    console.log(
      `✅ [Payment Verified] User ${userId} granted access to ${actualItemType}:${actualItemId || "all"}`
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Video access granted!",
      itemType: actualItemType,
      problemId: actualItemId,
    });
  } catch (error) {
    console.error("[verifyPayment] Error:", error);
    return res.status(500).json({ error: error.message || "Failed to verify payment." });
  }
};

/**
 * Razorpay Webhook listener (idempotent backup if user closes browser before verify call)
 */
const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      console.warn("[Webhook] RAZORPAY_WEBHOOK_SECRET not set. Ignoring webhook.");
      return res.status(200).json({ status: "ignored" });
    }

    // Verify webhook signature with raw payload
    const rawPayload = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawPayload)
      .digest("hex");

    const isMatch =
      signature &&
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

    if (!isMatch) {
      console.warn("[Webhook] Invalid webhook signature detected.");
      return res.status(400).json({ error: "Invalid webhook signature." });
    }

    const event = req.body.event;
    console.log(`[Webhook] Received Razorpay event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || {};

      if (orderId) {
        const order = await PaymentOrder.findOneAndUpdate(
          { orderId },
          { status: "captured", paymentId },
          { new: true }
        );

        const userId = order?.userId || notes.userId;
        const itemType = order?.itemType || notes.itemType;
        const itemId = order?.itemId || (notes.problemId !== "all" ? notes.problemId : null);

        if (userId && itemType) {
          await grantAccess({
            userId,
            itemType,
            itemId,
            orderId,
            paymentId,
          });
          console.log(`✅ [Webhook] Access granted via webhook for order: ${orderId}`);
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        await PaymentOrder.findOneAndUpdate({ orderId }, { status: "failed" });
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    return res.status(500).json({ error: "Webhook processing error." });
  }
};

/**
 * Returns access status, pricing, and ownership for the current problem.
 */
const getAccessStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { problemId } = req.params;

    const problem = await Problem.findById(problemId).select("title video videoPrice");
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    const { hasAccess, accessType } = await checkUserVideoAccess(userId, problemId);

    const price = problem.videoPrice || pricing.PER_VIDEO_PRICE;
    const allAccessPrice = pricing.ALL_ACCESS_PRICE;

    return res.status(200).json({
      hasAccess,
      accessType,
      hasVideo: Boolean(problem.video?.videoId),
      channel: problem.video?.channel || "takeUforward",
      price,
      allAccessPrice,
    });
  } catch (error) {
    console.error("[getAccessStatus] Error:", error);
    return res.status(500).json({ error: "Failed to retrieve access status." });
  }
};

/**
 * Returns protected video details ONLY if the user is authorized.
 */
const getProtectedVideo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.params;

    const { hasAccess, accessType } = await checkUserVideoAccess(userId, problemId);
    if (!hasAccess) {
      return res.status(403).json({
        error: "Access denied. Please purchase the video solution to view.",
        isLocked: true,
      });
    }

    const problem = await Problem.findById(problemId).select("video title");
    if (!problem || !problem.video?.videoId) {
      return res.status(404).json({ error: "No video solution available for this problem." });
    }

    return res.status(200).json({
      video: problem.video,
      hasAccess: true,
      accessType,
    });
  } catch (error) {
    console.error("[getProtectedVideo] Error:", error);
    return res.status(500).json({ error: "Failed to fetch video details." });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  razorpayWebhook,
  getAccessStatus,
  getProtectedVideo,
};

