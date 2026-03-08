//  models/FinancialManagement/Invoice.js

import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },  // رقم الفاتورة
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // العميل
  amount: { type: Number, required: true },  // القيمة الإجمالية
  issueDate: { type: Date, default: Date.now },  // تاريخ إصدار الفاتورة
  dueDate: { type: Date },  // تاريخ الاستحقاق
  status: { type: String, enum: ["paid", "pending", "overdue"], default: "pending" },
  paidAmount: { type: Number, default: 0 }, // إجمالي المبالغ المسددة جزئياً أو كلياً
  items: [
    {
      description: String,
      quantity: Number,
      price: Number,
    }
  ],
  notes: { type: String },
}, { timestamps: true });

invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ issueDate: 1 });
invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ status: 1 });

export default mongoose.model("Invoice", invoiceSchema);
