// هذا الملف يحتوي على موديل المشتريات (Purchase) لتخزين عمليات شراء المنتجات أو الخدمات
// كل عملية شراء مرتبطة بمستخدم محدد (userId) وتتضمن تفاصيل المنتج أو الخدمة وتاريخ الشراء

import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    // معرّف المستخدم الذي قام بالشراء
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // اسم المنتج أو الخدمة
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    // سعر المنتج أو الخدمة
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // تاريخ عملية الشراء
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true, // حفظ تاريخ الإنشاء والتعديل تلقائيًا
  }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
