const express = require("express");
const paymentRouter = express.Router();
const { validateToken } = require("../middleware/userMiddleware");
const { requireVideoAccess } = require("../middleware/accessMiddleware");
const {
  createOrder,
  verifyPayment,
  razorpayWebhook,
  getAccessStatus,
  getProtectedVideo,
} = require("../controllers/paymentController");

// Payment Order & Verification APIs
paymentRouter.post("/create-order", validateToken, createOrder);
paymentRouter.post("/verify-payment", validateToken, verifyPayment);

// Razorpay Webhook API (Signature verification handled in controller)
paymentRouter.post("/webhook", razorpayWebhook);

// Access & Protected Video Details APIs
paymentRouter.get("/access-status/:problemId", validateToken, getAccessStatus);
paymentRouter.get("/video/:problemId", validateToken, requireVideoAccess, getProtectedVideo);

module.exports = paymentRouter;

