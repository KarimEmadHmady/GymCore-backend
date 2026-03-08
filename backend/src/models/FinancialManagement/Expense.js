//  models/FinancialManagement/Expense.js

import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },  // قيمة المصروف
  date: { type: Date, default: Date.now },  // تاريخ المصروف
  category: { type: String, required: true },  // نوع المصروف (إيجار، رواتب، صيانة...)
  paidTo: { type: String },  // المستلم أو الجهة
  notes: { type: String },
  imageUrl: { type: String }, // رابط صورة مرفوعة
}, { timestamps: true });

expenseSchema.index({ date: 1 });
expenseSchema.index({ category: 1 });

export default mongoose.model("Expense", expenseSchema);
