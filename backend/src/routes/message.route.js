import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  createMessage,
  getMessagesForUser,
  updateMessageStatus,
  updateMessage,
  deleteMessage,
  getAllMessages,
  markMessageAsRead
} from '../controllers/message.controller.js';

const router = express.Router();

// إرسال رسالة جديدة
router.post('/', authenticate,  createMessage);

// جلب جميع الرسائل
router.get('/', authenticate, getAllMessages);

// جلب جميع الرسائل الخاصة بمستخدم معين
router.get('/:userId', authenticate, getMessagesForUser);

// تحديث حالة قراءة الرسالة
router.put('/:id/read', authenticate, updateMessageStatus);

// تحديث محتوى الرسالة
router.put('/:id', authenticate, updateMessage);

// تحديد الرسالة كمقروءة (عند فتح الرسالة)
router.patch('/:id/mark-read', authenticate, markMessageAsRead);

// حذف رسالة
router.delete('/:id', authenticate, deleteMessage);

export default router;
