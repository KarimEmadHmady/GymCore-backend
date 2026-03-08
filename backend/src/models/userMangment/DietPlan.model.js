// هذا الموديل خاص بخطة النظام الغذائي (Diet Plan) التي يتم إنشاؤها للعميل
// يحتوي على تفاصيل الخطة (الاسم، الوصف، تاريخ البداية والنهاية) وقائمة الوجبات المرتبطة بها
// كل وجبة تحتوي على اسم وعدد السعرات وملاحظات اختيارية

import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  mealName: { type: String, required: true }, // اسم الوجبة - إجباري
  calories: { type: Number, required: true }, // عدد السعرات - إجباري
  quantity: { type: String, required: true, default: 1 }, // الكمية - إجباري
  notes: { type: String }, // ملاحظات - اختياري
});

const dietPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // العميل المرتبط بالخطة - إجباري
    },
    // معرف المدرب المسؤول عن هذه الخطة - يسهل جلب عملاء المدرب
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    planName: { type: String, required: true }, // اسم الخطة - إجباري
    description: { type: String }, // وصف الخطة - اختياري
    startDate: { type: Date, required: true }, // تاريخ بداية الخطة - إجباري
    endDate: { type: Date }, // تاريخ نهاية الخطة - اختياري
    meals: { type: [mealSchema], default: [] }, // قائمة الوجبات - افتراضي مصفوفة فارغة
  },
  { timestamps: true }
);

// فهرس لتسريع البحث بخانة المدرب
dietPlanSchema.index({ trainerId: 1 });

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);
export default DietPlan;
