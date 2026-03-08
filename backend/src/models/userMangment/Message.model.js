// models/messageModel.js
// هذا الموديل يمثل الرسائل بين المستخدمين في النظام
// يحتوي على معلومات المرسل والمستلم ونص الرسالة وحالتها إذا كانت مقروءة أم لا

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // معرف المستلم - مطلوب لأنه يحدد الشخص الذي ستصل إليه الرسالة
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, 

    // معرف المرسل - مطلوب لأنه يحدد من أرسل الرسالة
    fromUserId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, 

    // نص الرسالة - مطلوب لأنه المحتوى الأساسي
    message: { 
      type: String, 
      required: true, 
      trim: true 
    },

    // موضوع الرسالة - اختياري
    subject: { 
      type: String, 
      trim: true,
      default: ''
    },

    // تاريخ إرسال الرسالة - يتم تحديده تلقائياً إذا لم يتم إدخاله
    date: { 
      type: Date, 
      default: Date.now 
    },

    // حالة قراءة الرسالة - false افتراضياً
    read: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
