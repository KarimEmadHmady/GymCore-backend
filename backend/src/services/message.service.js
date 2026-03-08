import Message from '../models/userMangment/Message.model.js';
import { cacheManager } from '../utils/cache.util.js';

// Helper function to clear message-related cache
const clearMessageCache = () => {
  cacheManager.clearByPattern(/^messages_/);
};

// إنشاء رسالة جديدة
export const createMessageService = async (data) => {
  const { userId, fromUserId, message, subject } = data;
  if (!userId || !fromUserId || !message) {
    throw new Error('userId, fromUserId, and message are required');
  }
  const allowed = { userId, fromUserId, message, subject };
  const result = await Message.create(allowed);

  // Clear cache after creating message
  clearMessageCache();

  return result;
};

// جلب الرسائل الخاصة بمستخدم معين (كمستلم أو كمرسل)
export const getMessagesForUserService = async (userId) => {
  const cacheKey = `messages_user_${userId}`;

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await Message.find({
    $or: [{ userId }, { fromUserId: userId }]
  }).sort({ createdAt: -1 });

  // Cache the result for 5 minutes
  cacheManager.set(cacheKey, result, 5 * 60 * 1000);

  return result;
};

// جلب جميع الرسائل
export const getAllMessagesService = async () => {
  const cacheKey = 'messages_all';

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await Message.find().sort({ createdAt: -1 });

  // Cache the result for 5 minutes
  cacheManager.set(cacheKey, result, 5 * 60 * 1000);

  return result;
};

// تحديث حالة قراءة الرسالة
export const updateMessageStatusService = async (id, readStatus) => {
  const message = await Message.findByIdAndUpdate(
    id,
    { read: readStatus },
    { new: true }
  );
  if (!message) throw new Error('Message not found');

  // Clear cache after updating message status
  clearMessageCache();

  return message;
};

// تحديث محتوى الرسالة
export const updateMessageService = async (id, data) => {
  const { message, subject } = data;
  const updateData = {};
  if (message) updateData.message = message;
  if (subject !== undefined) updateData.subject = subject;
  // إذا تم تعديل الرسالة أو الموضوع، أعد تعيين read إلى false
  if (message || subject !== undefined) updateData.read = false;
  const updatedMessage = await Message.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  if (!updatedMessage) throw new Error('Message not found');

  // Clear cache after updating message
  clearMessageCache();

  return updatedMessage;
};

// حذف رسالة
export const deleteMessageService = async (id) => {
  const message = await Message.findByIdAndDelete(id);
  if (!message) throw new Error('Message not found');

  // Clear cache after deleting message
  clearMessageCache();

  return message;
};

// تحديد الرسالة كمقروءة
export const markMessageAsReadService = async (id) => {
  const message = await Message.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );
  if (!message) throw new Error('Message not found');

  // Clear cache after marking message as read
  clearMessageCache();

  return message;
};