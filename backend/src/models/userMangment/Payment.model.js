// 📄 هذا الموديل خاص بتخزين بيانات المدفوعات (Payments) لكل عميل
// يحتوي على قيمة الدفع، تاريخ الدفع، طريقة الدفع، ملاحظات، وربط الدفع بالمستخدم (userId)

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // 🔗 معرف المستخدم صاحب الدفعة
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 💰 قيمة الدفعة
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 📅 تاريخ الدفع
    date: {
      type: Date,
      required: true,
    },

    // 💳 طريقة الدفع (نقدي، بطاقة، تحويل...)
    method: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "other"], // طرق الدفع المسموحة
      default: "cash",
    },

    // ربط الدفعة بفاتورة محددة (اختياري)
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    // الجزء المسدد من الفاتورة في هذه الدفعة (للسداد الجزئي)
    appliedAmount: {
      type: Number,
      min: 0,
    },

    // 📝 ملاحظات إضافية عن الدفع
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    // UUID مُنشأ من الواجهة الأمامية لضمان عدم التكرار عند العمل بدون إنترنت
    clientUuid: { type: String, index: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

// فهرس فريد على clientUuid مع sparse للسجلات التي لا تحتويه
paymentSchema.index({ clientUuid: 1 }, { unique: true, sparse: true });

export default mongoose.model("Payment", paymentSchema);
