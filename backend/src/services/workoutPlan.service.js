import WorkoutPlan from "../models/userMangment/WorkoutPlan.model.js";
import { cacheManager } from "../utils/cache.util.js";

// Helper function to clear workout plan-related cache
const clearWorkoutPlanCache = () => {
  cacheManager.clearByPattern(/^workout_plans_/);
};

// إنشاء خطة تمرين جديدة
export const createWorkoutPlanService = async (data) => {
  const { userId, planName, description, startDate, endDate, exercises, trainerId } = data;
  if (!userId || !planName || !startDate || !endDate || !exercises) {
    throw new Error('userId, planName, startDate, endDate, and exercises are required');
  }
  const allowed = { userId, planName, description, startDate, endDate, exercises };
  if (trainerId) {
    allowed.trainerId = trainerId;
  }

  const result = await WorkoutPlan.create(allowed);

  // Clear cache after creating workout plan
  clearWorkoutPlanCache();

  return result;
};

// جلب جميع خطط التمارين لمستخدم معين
export const getWorkoutPlansByUserService = async (userId) => {
  const cacheKey = `workout_plans_user_${userId}`;

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await WorkoutPlan.find({ userId }).sort({ startDate: 1 });

  // Cache the result for 15 minutes
  cacheManager.set(cacheKey, result, 15 * 60 * 1000);

  return result;
};

// جلب جميع خطط التمرين
export const getAllWorkoutPlansService = async (filters = {}) => {
  const cacheKey = `workout_plans_all_${filters.trainerId || 'null'}`;

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const query = {};
  if (filters.trainerId) {
    query.trainerId = filters.trainerId;
  }

  const result = await WorkoutPlan.find(query).sort({ createdAt: -1 });

  // Cache the result for 15 minutes
  cacheManager.set(cacheKey, result, 15 * 60 * 1000);

  return result;
};

// جلب جميع التمارين لخطة معينة
export const getExercisesByPlanIdService = async (planId) => {
  const cacheKey = `workout_plans_exercises_${planId}`;

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const plan = await WorkoutPlan.findById(planId);
  if (!plan) throw new Error('الخطة غير موجودة');

  const result = plan.exercises || [];

  // Cache the result for 15 minutes
  cacheManager.set(cacheKey, result, 15 * 60 * 1000);

  return result;
};

// تعديل خطة تمرين
export const updateWorkoutPlanService = async (id, data) => {
  const result = await WorkoutPlan.findByIdAndUpdate(id, data, { new: true });

  // Clear cache after updating workout plan
  clearWorkoutPlanCache();

  return result;
};

// حذف خطة تمرين
export const deleteWorkoutPlanService = async (id) => {
  const result = await WorkoutPlan.findByIdAndDelete(id);

  // Clear cache after deleting workout plan
  clearWorkoutPlanCache();

  return result;
};

export const getWorkoutPlanByIdService = async (id) => {
  return await WorkoutPlan.findById(id);
};

// إضافة تمرين جديد لخطة
export const addExerciseToPlanService = async (planId, exercise) => {
  const plan = await WorkoutPlan.findById(planId);
  if (!plan) return null;
  plan.exercises.push(exercise);
  await plan.save();
  return plan;
};

// جلب تمرين معين من الخطة بواسطة الـ ID
export const getExerciseByIdService = async (planId, exerciseId) => {
  const plan = await WorkoutPlan.findById(planId);
  if (!plan) return null;

  const exercise = plan.exercises.find(exercise => exercise._id.toString() === exerciseId);
  return exercise || null;
};

// تعديل تمرين معين في الخطة
export const updateExerciseInPlanService = async (planId, exerciseId, updatedExercise) => {
  const plan = await WorkoutPlan.findById(planId);
  if (!plan) return null;

  const exerciseIndex = plan.exercises.findIndex(exercise => exercise._id.toString() === exerciseId);
  if (exerciseIndex === -1) return null;

  // Update the specific exercise
  Object.assign(plan.exercises[exerciseIndex], updatedExercise);
  await plan.save();
  return plan;
};

// حذف تمرين معين من الخطة
export const deleteExerciseFromPlanService = async (planId, exerciseId) => {
  const plan = await WorkoutPlan.findById(planId);
  if (!plan) return null;

  const exerciseIndex = plan.exercises.findIndex(exercise => exercise._id.toString() === exerciseId);
  if (exerciseIndex === -1) return null;

  plan.exercises.splice(exerciseIndex, 1);
  await plan.save();
  return plan;
};