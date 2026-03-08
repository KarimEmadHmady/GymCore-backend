import {
  createPurchaseService,
  getAllPurchasesService,
  getPurchasesByUserService,
  getPurchasesByUserIdService,
  getPurchaseByIdService,
  updatePurchaseService,
  deletePurchaseService
} from "../services/purchase.service.js";

// إنشاء عملية شراء جديدة
export const createPurchase = async (req, res) => {
  try {
    const isAdminOrManager = req.user?.role === 'admin' || req.user?.role === 'manager';
    const targetUserId = isAdminOrManager && req.body.userId ? req.body.userId : req.user.id;
    const purchase = await createPurchaseService({
      ...req.body,
      userId: targetUserId,
    });
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل المشتريات لمستخدم
export const getPurchases = async (req, res) => {
  try {
    const isAdminOrManager = req.user?.role === 'admin' || req.user?.role === 'manager';
    const purchases = isAdminOrManager
      ? await getAllPurchasesService()
      : await getPurchasesByUserService(req.user.id);
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل المشتريات لمستخدم محدد عبر userId
export const getPurchasesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const role = req.user?.role;
    const requesterId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "userId مطلوب" });
    }

    if (role === 'member' && String(userId) !== String(requesterId)) {
      return res.status(403).json({ message: "غير مصرح: لا يمكنك الوصول لمشتريات مستخدم آخر" });
    }

    const purchases = await getPurchasesByUserIdService(userId);
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب عملية شراء واحدة
export const getPurchase = async (req, res) => {
  try {
    const purchase = await getPurchaseByIdService(req.params.id);
    if (!purchase) return res.status(404).json({ message: "عملية الشراء غير موجودة" });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث عملية شراء
export const updatePurchase = async (req, res) => {
  try {
    const updated = await updatePurchaseService(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "عملية الشراء غير موجودة" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف عملية شراء
export const deletePurchase = async (req, res) => {
  try {
    const deleted = await deletePurchaseService(req.params.id);
    if (!deleted) return res.status(404).json({ message: "عملية الشراء غير موجودة" });
    res.json({ message: "تم حذف عملية الشراء بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
