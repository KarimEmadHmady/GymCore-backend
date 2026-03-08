import Feedback from '../models/userMangment/Feedback.model.js';

// إنشاء تقييم جديد
export const createFeedbackService = async (data) => {
  const { toUserId, fromUserId, rating, comment, date } = data;
  if (!toUserId || !rating) {
    throw new Error('toUserId and rating are required');
  }
  const allowed = { toUserId, fromUserId, rating, comment, date };
  return await Feedback.create(allowed);
};

// جلب التقييمات الخاصة بمستخدم معين
export const getFeedbackForUserService = async (userId) => {
  return await Feedback.find({ toUserId: userId }).sort({ createdAt: -1 });
};

// جلب جميع التقييمات
export const getAllFeedbackService = async () => {
  return await Feedback.find().sort({ createdAt: -1 });
};

// تعديل تقييم
export const updateFeedbackService = async (id, data) => {
  const feedback = await Feedback.findByIdAndUpdate(id, data, { new: true });
  if (!feedback) throw new Error('Feedback not found');
  return feedback;
};

// حذف تقييم
export const deleteFeedbackService = async (id) => {
  const feedback = await Feedback.findByIdAndDelete(id);
  if (!feedback) throw new Error('Feedback not found');
  return feedback;
};
