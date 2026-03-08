// موديل الـ Reward:
// هذا الموديل يمثل نظام النقاط (Rewards) الخاص بالمستخدمين.
// يستخدم لتخزين عدد النقاط، تاريخ إضافتها أو استبدالها، والغرض الذي تم الاستبدال من أجله.

import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    // معرف المستخدم المرتبط بالمكافأة
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // عدد النقاط
    points: { 
      type: Number, 
      required: true, 
      default: 0 
    },

    // تم استبدال النقاط بماذا (اختياري)
    redeemedFor: { 
      type: String 
    },

    // تاريخ الإضافة أو الاستبدال
    date: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);
export default Reward;
