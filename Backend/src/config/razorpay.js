const Razorpay = require("razorpay");

/**
 * Initializes and returns the Razorpay client instance
 */
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn(
      "[Razorpay] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment variables."
    );
  }

  return new Razorpay({
    key_id: key_id || "rzp_test_placeholder",
    key_secret: key_secret || "placeholder_secret",
  });
}

module.exports = {
  getRazorpayInstance,
};

