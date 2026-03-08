// 📌 هذا الموديل خاص بجدولة الحصص (Session Schedule) ويخزن مواعيد الحصص
// لكل مستخدم (مدرب أو متدرب) مع تاريخ الحصة وتوقيتها ووصفها
import mongoose from "mongoose";

const sessionScheduleSchema = new mongoose.Schema(
  {
    // المتدرب (العميل)
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // المدرب المسؤول
    trainerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // تاريخ ووقت الحصة
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number }, // بالدقايق

    // تفاصيل إضافية
    sessionType: { 
      type: String, 
      enum: ["شخصية", "جماعية", "أونلاين", "تغذية"], 
      default: "شخصية" 
    },
    status: { 
      type: String, 
      enum: ["مجدولة", "مكتملة", "ملغاة"], 
      default: "مجدولة" 
    },
    location: { type: String, default: "Gym" },
    price: { type: Number, default: 0 },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

const SessionSchedule = mongoose.model("SessionSchedule", sessionScheduleSchema);

export default SessionSchedule;
