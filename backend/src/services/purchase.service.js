import Purchase from "../models/userMangment/Purchase.model.js";

// إنشاء عملية شراء جديدة
export const createPurchaseService = async (data) => {
  const { userId, itemName, price, date } = data;
  if (!userId || !itemName || !price) {
    throw new Error('userId, itemName, and price are required');
  }
  const allowed = { userId, itemName, price, date };
  return await Purchase.create(allowed);
};

// جلب جميع المشتريات
export const getAllPurchasesService = async () => {
  return await Purchase.find({}).sort({ createdAt: -1 });
};

// جلب كل المشتريات لمستخدم معين
export const getPurchasesByUserService = async (userId) => {
  return await Purchase.find({ userId }).sort({ createdAt: -1 });
};

// Alias أكثر وضوحًا للاستخدام عبر userId
export const getPurchasesByUserIdService = async (userId) => {
  return await Purchase.find({ userId }).sort({ createdAt: -1 });
};

// جلب عملية شراء واحدة بالـ ID
export const getPurchaseByIdService = async (id) => {
  return await Purchase.findById(id);
};

// تحديث عملية شراء
export const updatePurchaseService = async (id, data) => {
  return await Purchase.findByIdAndUpdate(id, data, { new: true });
};

// حذف عملية شراء
export const deletePurchaseService = async (id) => {
  return await Purchase.findByIdAndDelete(id);
};
