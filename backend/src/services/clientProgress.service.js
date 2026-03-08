import ClientProgress from '../models/userMangment/ClientProgress.model.js';
import { cacheManager } from '../utils/cache.util.js';

// Helper function to clear client progress-related cache
const clearClientProgressCache = () => {
  cacheManager.clearByPattern(/^client_progress_/);
};

// إنشاء سجل جديد
export const createClientProgressService = async (data) => {
  const {
    userId,
    trainerId,
    date,
    weight,
    bodyFatPercentage,
    muscleMass,
    waist,
    chest,
    arms,
    legs,
    weightChange,
    fatChange,
    muscleChange,
    status,
    advice,
    notes,
    image
  } = data;
  if (!userId || !date) {
    throw new Error('userId and date are required');
  }
  const allowed = {
    userId,
    trainerId,
    date,
    weight,
    bodyFatPercentage,
    muscleMass,
    waist,
    chest,
    arms,
    legs,
    weightChange,
    fatChange,
    muscleChange,
    status,
    advice,
    notes,
    image
  };

  const result = await ClientProgress.create(allowed);

  // Clear cache after creating progress record
  clearClientProgressCache();

  return result;
};

// جلب السجلات لمستخدم معين
export const getClientProgressByUserService = async (userId) => {
  const cacheKey = `client_progress_user_${userId}`;

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await ClientProgress.find({ userId }).sort({ date: -1 });

  // Cache the result for 10 minutes
  cacheManager.set(cacheKey, result, 10 * 60 * 1000);

  return result;
};

// جلب سجل واحد بالمعرف
export const getClientProgressByIdService = async (id) => {
  return await ClientProgress.findById(id);
};

// جلب كل السجلات
export const getAllClientProgressService = async () => {
  const cacheKey = 'client_progress_all';

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await ClientProgress.find().sort({ date: -1 });

  // Cache the result for 10 minutes
  cacheManager.set(cacheKey, result, 10 * 60 * 1000);

  return result;
};

// جلب السجلات حسب المدرب
export const getClientProgressByTrainerService = async (trainerId) => {
  const cacheKey = `client_progress_trainer_${trainerId}`;

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await ClientProgress.find({ trainerId }).sort({ date: -1 });

  // Cache the result for 10 minutes
  cacheManager.set(cacheKey, result, 10 * 60 * 1000);

  return result;
};

// تعديل سجل
export const updateClientProgressService = async (id, data) => {
  const allowed = {
    date: data.date,
    weight: data.weight,
    bodyFatPercentage: data.bodyFatPercentage,
    muscleMass: data.muscleMass,
    waist: data.waist,
    chest: data.chest,
    arms: data.arms,
    legs: data.legs,
    weightChange: data.weightChange,
    fatChange: data.fatChange,
    muscleChange: data.muscleChange,
    status: data.status,
    advice: data.advice,
    notes: data.notes,
    image: data.image
  };
  const progress = await ClientProgress.findByIdAndUpdate(id, allowed, { new: true });
  if (!progress) throw new Error('Client progress record not found');

  // Clear cache after updating progress record
  clearClientProgressCache();

  return progress;
};

// حذف سجل
export const deleteClientProgressService = async (id) => {
  const progress = await ClientProgress.findByIdAndDelete(id);
  if (!progress) throw new Error('Client progress record not found');

  // Clear cache after deleting progress record
  clearClientProgressCache();

  return progress;
};
