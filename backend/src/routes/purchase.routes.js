import express from "express";
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    createPurchase,
    getPurchases,
    getPurchase,
    updatePurchase,
    deletePurchase,
    getPurchasesByUserId
} from "../controllers/purchase.controller.js";
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// إنشاء عملية شراء جديدة
router.post("/", authenticate,  authorizeRole(['admin','manager','accountant']), createPurchase);

// جلب كل المشتريات
router.get("/", authenticate,  authorizeRole(['admin','manager','accountant']), getPurchases);

// جلب كل المشتريات لمستخدم محدد عبر userId (لـ admin/manager)
router.get("/user/:userId", authenticate,  authorizeRole(['admin','manager','member','accountant']), getPurchasesByUserId);

// جلب عملية شراء واحدة
router.get("/:id", authenticate,  authorizeRole(['admin','manager','accountant']), getPurchase);

// تحديث عملية شراء
router.put("/:id", authenticate, authorizeRole(['admin','accountant']), updatePurchase);

// حذف عملية شراء
router.delete("/:id", authenticate, authorizeRole(['admin','accountant']), deletePurchase);

export default router;
