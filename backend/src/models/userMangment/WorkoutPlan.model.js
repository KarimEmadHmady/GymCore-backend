// 📄 هذا الملف يحتوي على موديل خطة التمارين (WorkoutPlan)
// الغرض منه تخزين وإدارة خطط التمارين الخاصة بالمستخدمين، 
// بما في ذلك اسم الخطة، وصفها، مدة الخطة، وقائمة التمارين المرتبطة بها.

import mongoose from "mongoose";

// 🏋️‍♂️ سكيمة التمرين داخل خطة التمارين
const exerciseSchema = new mongoose.Schema(
  {
    // اسم التمرين
    name: { type: String, required: true },
    // عدد التكرارات
    reps: { type: Number, required: true },
    // عدد المجموعات
    sets: { type: Number, required: true },
    // ملاحظات إضافية عن التمرين
    notes: { type: String },
    // رابط صورة التمرين (cloudinary)
    image: { type: String },
  },
  { _id: true  } 
);

// 📅 سكيمة خطة التمارين
const workoutPlanSchema = new mongoose.Schema(
  {
    // معرف المستخدم المرتبطة به الخطة
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // معرف المدرب المسؤول عن هذه الخطة - يسهل جلب عملاء المدرب
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    // اسم الخطة
    planName: { type: String, required: true },
    // وصف الخطة
    description: { type: String },
    // تاريخ بدء الخطة
    startDate: { type: Date, required: true },
    // تاريخ انتهاء الخطة
    endDate: { type: Date, required: true },
    // قائمة التمارين في الخطة
    exercises: { type: [exerciseSchema], required: true },
  },
  { timestamps: true }
);

// فهرس لتسريع البحث بخانة المدرب
workoutPlanSchema.index({ trainerId: 1 });

// إنشاء الموديل من السكيمة
const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
export default WorkoutPlan;
