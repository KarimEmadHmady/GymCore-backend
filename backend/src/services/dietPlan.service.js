import DietPlan from '../models/userMangment/DietPlan.model.js';
// إنشاء خطة غذائية جديدة
export const createDietPlanService = async (data) => {
  const { userId, planName, description, startDate, endDate, meals, trainerId } = data;
  if (!userId || !planName || !startDate) {
    throw new Error('userId, planName, and startDate are required');
  }
  const allowed = { userId, planName, description, startDate, endDate, meals };
  if (trainerId) {
    allowed.trainerId = trainerId;
  }
  return await DietPlan.create(allowed);
};

// جلب جميع الخطط الغذائية لمستخدم معين
export const getDietPlansByUserService = async (userId) => {
  return await DietPlan.find({ userId }).sort({ startDate: -1 });
};

// تعديل خطة غذائية
export const updateDietPlanService = async (id, data) => {
  const plan = await DietPlan.findByIdAndUpdate(id, data, { new: true });
  if (!plan) throw new Error('Diet plan not found');
  return plan;
};

// حذف خطة غذائية
export const deleteDietPlanService = async (id) => {
  const plan = await DietPlan.findByIdAndDelete(id);
  if (!plan) throw new Error('Diet plan not found');
  return plan;
};


// جلب جميع الوجبات لخطة معينة
export const getMealsByPlanIdService = async (planId) => {
  const plan = await DietPlan.findById(planId);
  if (!plan) throw new Error('Diet plan not found');
  return plan.meals;
};

// إضافة وجبة جديدة للخطة
export const addMealToPlanService = async (planId, mealData) => {
  const plan = await DietPlan.findById(planId);
  if (!plan) throw new Error('Diet plan not found');

  // Validate required fields
  const { mealName, calories, quantity } = mealData;
  if (!mealName || !calories || !quantity) {
    throw new Error('mealName, calories, and quantity are required');
  }

  plan.meals.push(mealData);
  await plan.save();
  return plan;
};

// تعديل وجبة موجودة في الخطة
export const updateMealInPlanService = async (planId, mealId, mealData) => {
  const plan = await DietPlan.findById(planId);
  if (!plan) throw new Error('Diet plan not found');

  const meal = plan.meals.find(m => m.mealId.toString() === mealId.toString());
  if (!meal) throw new Error('Meal not found');

  Object.assign(meal, mealData);
  await plan.save();
  return meal;
};

// حذف وجبة من الخطة
export const deleteMealFromPlanService = async (planId, mealId) => {
  const plan = await DietPlan.findById(planId);
  if (!plan) throw new Error('Diet plan not found');

  const initialLength = plan.meals.length;
  plan.meals = plan.meals.filter(m => m.mealId.toString() !== mealId.toString());

  if (plan.meals.length === initialLength) throw new Error('Meal not found');

  await plan.save();
  return true;
};


export const getMealByIdService = async (mealId) => {
  // نبحث سواء كان mealId مخزن كـ ObjectId أو String
  const plan = await DietPlan.findOne({ "meals.mealId": mealId });
  
  if (!plan) return null;

  // البحث جوه المصفوفة بنفس القيمة
  const meal = plan.meals.find(m => m.mealId.toString() === mealId.toString());
  return meal || null;
};

// جلب خطة غذائية واحدة بالـ ID
export const getDietPlanByIdService = async (id) => {
  const plan = await DietPlan.findById(id);
  if (!plan) throw new Error('Diet plan not found');
  return plan;
};

// جلب جميع الخطط الغذائية (للاستخدام الإداري)
export const getAllDietPlansService = async (filters = {}) => {
  const query = {};
  if (filters.trainerId) {
    query.trainerId = filters.trainerId;
  }
  return await DietPlan.find(query).sort({ createdAt: -1 });
};

