// موديل سجل نقاط الولاء:
// هذا الموديل يمثل سجل جميع عمليات النقاط (إضافة/خصم/استبدال)

import mongoose from "mongoose";

const loyaltyPointsHistorySchema = new mongoose.Schema(
  {
    // معرف المستخدم المرتبط بالعملية
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // عدد النقاط (موجب للإضافة، سالب للخصم)
    points: { 
      type: Number, 
      required: true
    },

    // نوع العملية
    type: {
      type: String,
      enum: [
        'earned',           // كسب نقاط
        'redeemed',         // استبدال نقاط
        'admin_added',      // إضافة من المدير
        'admin_deducted',   // خصم من المدير
        'payment_bonus',    // مكافأة دفع
        'attendance_bonus', // مكافأة حضور
        'expired'           // انتهاء صلاحية
      ],
      required: true
    },

    // السبب أو الوصف
    reason: { 
      type: String,
      required: true,
      maxlength: 500
    },

    // معرف الجائزة المستبدلة (إذا كانت العملية استبدال)
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RedeemableReward"
    },

    // معرف الدفع المرتبط (إذا كانت العملية مرتبطة بدفع)
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    },

    // معرف سجل الحضور المرتبط (إذا كانت العملية مرتبطة بالحضور)
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceRecord"
    },

    // النقاط المتبقية بعد العملية
    remainingPoints: {
      type: Number,
      required: true
    },

    // معرف المدير الذي قام بالعملية (إذا كانت من المدير)
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // ملاحظات إضافية
    notes: {
      type: String,
      maxlength: 1000
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index للبحث السريع
loyaltyPointsHistorySchema.index({ userId: 1, createdAt: -1 });
loyaltyPointsHistorySchema.index({ type: 1 });
loyaltyPointsHistorySchema.index({ rewardId: 1 });

// Virtual: التحقق من نوع العملية
loyaltyPointsHistorySchema.virtual('isEarned').get(function() {
  return this.points > 0;
});

loyaltyPointsHistorySchema.virtual('isDeducted').get(function() {
  return this.points < 0;
});

const LoyaltyPointsHistory = mongoose.model("LoyaltyPointsHistory", loyaltyPointsHistorySchema);

export default LoyaltyPointsHistory;
