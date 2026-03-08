//  models/FinancialManagement/Revenue.js

import mongoose from "mongoose";

const revenueSchema = new mongoose.Schema({
  amount: { type: Number, required: true },  // قيمة الدخل
  date: { type: Date, default: Date.now },  // تاريخ العملية
  paymentMethod: { type: String, enum: ["cash", "card", "transfer", "bank_transfer", "other"], default: "cash" },
  sourceType: { type: String, enum: ["subscription", "purchase", "invoice", "other"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // العميل المرتبط
  notes: { type: String },
}, { timestamps: true });

revenueSchema.index({ date: 1 });
revenueSchema.index({ userId: 1 });
revenueSchema.index({ sourceType: 1 });

export default mongoose.model("Revenue", revenueSchema);
