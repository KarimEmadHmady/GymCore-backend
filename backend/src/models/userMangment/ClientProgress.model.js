// models/ClientProgress.js
// هذا الموديل مسؤول عن تخزين وتتبع تقدم العميل (مثل الوزن، نسبة الدهون في الجسم، والملاحظات) 
// لكل يوم أو جلسة تدريب. يتم الربط مع المستخدم عن طريق userId.

import mongoose from "mongoose";

const clientProgressSchema = new mongoose.Schema(
  {
    // المستخدم صاحب التقدم
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // المدرب المسؤول (اختياري)
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // تاريخ تسجيل التقدم
    date: { type: Date, required: true },

    // بيانات الجسم
    weight: { type: Number }, // الوزن
    bodyFatPercentage: { type: Number }, // نسبة الدهون
    muscleMass: { type: Number }, // الكتلة العضلية (اختياري)
    waist: { type: Number }, // مقاس الوسط (اختياري)
    chest: { type: Number }, // مقاس الصدر (اختياري)
    arms: { type: Number }, // مقاس الذراع (اختياري)
    legs: { type: Number }, // مقاس الرجل (اختياري)

    // مقارنة مع التسجيل السابق
    weightChange: { type: Number }, // + أو - مقارنة بالسابق
    fatChange: { type: Number },    // + أو - مقارنة بالسابق
    muscleChange: { type: Number }, // + أو - مقارنة بالسابق

    // حالة عامة (كويس / متوسط / ممتاز ...)
    status: {
      type: String,
      enum: ["ممتاز", "جيد", "يحتاج لتحسين"],
      default: "جيد",
    },

    // نصائح أو ملاحظات من المدرب
    advice: { type: String, default: "" },

    // ملاحظات إضافية عامة
    notes: { type: String, default: "" },

    // صورة التقدم (اختيارية)
    image: {
      url: { type: String },
      publicId: { type: String }
    },
  },
  { timestamps: true }
);

const ClientProgress = mongoose.model("ClientProgress", clientProgressSchema);
export default ClientProgress;
