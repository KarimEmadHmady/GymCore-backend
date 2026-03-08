import SessionSchedule from "../models/userMangment/SessionSchedule.model.js";

// إنشاء حصة جديدة
export const createSessionScheduleService = async (data) => { 
  const { userId, trainerId, date, startTime, endTime, duration, sessionType, status, location, price, description } = data;
  if (!userId || !trainerId || !date || !startTime || !endTime) {
    throw new Error('userId, trainerId, date, startTime, and endTime are required');
  }
  const allowed = { userId, trainerId, date, startTime, endTime, duration, sessionType, status, location, price, description };
  return await SessionSchedule.create(allowed);
};

// جلب جميع الحصص لمستخدم (كعميل أو مدرب)
export const getSessionSchedulesByUserService = async (userId) => {
  return await SessionSchedule.find({ $or: [{ userId }, { trainerId: userId }] }).sort({ date: 1 });
};

// جلب جميع الحصص
export const getAllSessionSchedulesService = async () => {
  return await SessionSchedule.find().sort({ date: 1 });
};

// تحديث بيانات حصة
export const updateSessionScheduleService = async (id, data) => {
  return await SessionSchedule.findByIdAndUpdate(id, data, { new: true });
};

// حذف حصة
export const deleteSessionScheduleService = async (id) => {
  return await SessionSchedule.findByIdAndDelete(id);
};
