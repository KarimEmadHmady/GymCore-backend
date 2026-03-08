import express from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';
import {
  createPayment,
  getPaymentsByUser,
  updatePayment,
  deletePayment,
  getAllPayments
} from '../controllers/payment.controller.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// ➕ إنشاء دفعة جديدة
router.post('/', authenticate, authorizeRole(['admin','manager','accountant']), createPayment);

// جلب جميع الدفعات
router.get('/', authenticate, authorizeRole(['admin','manager','accountant']), getAllPayments);

// 📄 جلب جميع الدفعات لمستخدم معين
router.get('/:userId', authenticate, authorizeRole(['admin','manager','member','accountant']), getPaymentsByUser);

// ✏️ تعديل دفعة
router.put('/:id', authenticate, authorizeRole(['admin','manager','accountant']), updatePayment);

// 🗑️ حذف دفعة
router.delete('/:id', authenticate, authorizeRole(['admin','accountant']), deletePayment);

export default router;
