import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import {
  createSessionSchedule,
  getSessionSchedulesByUser,
  updateSessionSchedule,
  deleteSessionSchedule,
  getAllSessionSchedules
} from "../controllers/sessionSchedule.controller.js";
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// إنشاء حصة جديدة (يجب إرسال userId و trainerId)
router.post("/:userId", authenticate,  authorizeRole(['admin','manager', 'trainer']), createSessionSchedule);

// جلب جميع الحصص لمستخدم (كعميل أو مدرب)
router.get("/:userId", authenticate,  getSessionSchedulesByUser);

// جلب جميع الحصص
router.get("/", authenticate,  authorizeRole(['admin','manager', 'trainer']), getAllSessionSchedules);

// تعديل حصة
router.put("/:id", authenticate,  authorizeRole(['admin','manager', 'trainer']), updateSessionSchedule);

// حذف حصة
router.delete("/:id", authenticate,  authorizeRole(['admin','manager']), deleteSessionSchedule);

export default router;
