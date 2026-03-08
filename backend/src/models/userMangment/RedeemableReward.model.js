// موديل الجوائز القابلة للاستبدال:
// هذا الموديل يمثل الجوائز التي يمكن للمستخدمين استبدالها بنقاط الولاء

import mongoose from "mongoose";

const redeemableRewardSchema = new mongoose.Schema(
  {
    // اسم الجائزة
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100
    },

    // وصف الجائزة
    description: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 500
    },

    // عدد النقاط المطلوبة للاستبدال
    pointsRequired: { 
      type: Number, 
      required: true, 
      min: 1
    },

    // فئة الجائزة
    category: { 
      type: String, 
      enum: [
        "discount",           // خصم
        "free_session",       // جلسة مجانية
        "merchandise",        // منتجات
        "subscription_extension", // تمديد اشتراك
        "premium_feature",    // ميزة مميزة
        "gift_card"           // كارت هدية
      ], 
      required: true 
    },

    // حالة الجائزة (نشطة/غير نشطة)
    isActive: { 
      type: Boolean, 
      default: true 
    },

    // المخزون (-1 = غير محدود)
    stock: { 
      type: Number, 
      default: -1,
      min: -1
    },

    // صورة الجائزة
    imageUrl: { 
      type: String,
      default: ""
    },

    // تاريخ انتهاء الصلاحية
    validUntil: { 
      type: Date 
    },

    // الحد الأدنى لمستوى العضوية المطلوب
    minMembershipLevel: { 
      type: String, 
      enum: ["basic", "silver", "gold", "platinum"], 
      default: "basic" 
    },

    // قيمة الجائزة (اختياري - للعرض فقط)
    value: {
      type: Number,
      min: 0
    },

    // وحدة القيمة (جنيه، دولار، إلخ)
    valueUnit: {
      type: String,
      default: "جنيه"
    },

    // شروط إضافية للاستبدال
    conditions: {
      type: String,
      default: ""
    },

    // عدد مرات الاستبدال المسموح بها لكل مستخدم
    maxRedemptionsPerUser: {
      type: Number,
      default: 1,
      min: 1
    },

    // إجمالي عدد مرات الاستبدال
    totalRedemptions: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: التحقق من توفر الجائزة
redeemableRewardSchema.virtual('isAvailable').get(function() {
  if (!this.isActive) return false;
  if (this.validUntil && this.validUntil < new Date()) return false;
  if (this.stock === 0) return false;
  return true;
});

// Virtual: عدد الجوائز المتبقية
redeemableRewardSchema.virtual('remainingStock').get(function() {
  if (this.stock === -1) return 'غير محدود';
  return Math.max(0, this.stock - this.totalRedemptions);
});

// Index للبحث السريع
redeemableRewardSchema.index({ isActive: 1, category: 1 });
redeemableRewardSchema.index({ pointsRequired: 1 });
redeemableRewardSchema.index({ minMembershipLevel: 1 });

const RedeemableReward = mongoose.model("RedeemableReward", redeemableRewardSchema);

export default RedeemableReward;
