const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentOrderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentId: {
      type: String,
      default: null,
      trim: true,
    },
    signature: {
      type: String,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["problem", "all_access"],
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    amountInPaise: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "captured", "failed"],
      default: "created",
      index: true,
    },
    receipt: {
      type: String,
      trim: true,
    },
    notes: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

paymentOrderSchema.index({ userId: 1, itemType: 1, itemId: 1 });

const PaymentOrder = mongoose.model("PaymentOrder", paymentOrderSchema);
module.exports = PaymentOrder;

