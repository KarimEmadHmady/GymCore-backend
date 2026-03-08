import express from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import {
  createAttendanceRecord,
  getAttendanceRecordsByUser,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getAllAttendanceRecords
} from '../controllers/attendanceRecords.controller.js';

const router = express.Router();

// إنشاء سجل حضور جديد
router.post('/', authenticate, createAttendanceRecord);

// جلب كل سجلات الحضور
router.get('/', authenticate, authorizeRole(['admin','manager', 'trainer']), getAllAttendanceRecords);

// جلب كل سجلات مستخدم معين
router.get('/:userId', authenticate, getAttendanceRecordsByUser);

// تعديل سجل حضور
router.put('/:id', authenticate, authorizeRole(['admin','manager', 'trainer']), updateAttendanceRecord);

// حذف سجل حضور
router.delete('/:id', authenticate, authorizeRole(['admin','manager']), deleteAttendanceRecord);

export default router;
