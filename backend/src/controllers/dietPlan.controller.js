import {
  createDietPlanService,
  getDietPlansByUserService,
  updateDietPlanService,
  deleteDietPlanService,
  getMealByIdService,
  getMealsByPlanIdService,
  addMealToPlanService,
  updateMealInPlanService,
  deleteMealFromPlanService,
  getDietPlanByIdService
  } from '../services/dietPlan.service.js';
import { getAllDietPlansService } from '../services/dietPlan.service.js';
  
  // إنشاء خطة غذائية جديدة
  export const createDietPlan = async (req, res) => {
    try {
      const plan = await createDietPlanService({
        ...req.body,
        // لو المستخدم مدرب ومررناش trainerId، خليه المدرب الحالي
        trainerId: req.body.trainerId || (req.user && req.user.role === 'trainer' ? req.user.id : undefined)
      });
      res.status(201).json(plan);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // جلب جميع الخطط الغذائية لمستخدم
  export const getDietPlansByUser = async (req, res) => {
    try {
      const plans = await getDietPlansByUserService(req.params.userId);
      res.status(200).json(plans);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
  
  // تعديل خطة غذائية
  export const updateDietPlan = async (req, res) => {
    try {
      const payload = { ...req.body };
      if (!payload.trainerId && req.user && req.user.role === 'trainer') {
        payload.trainerId = req.user.id;
      }
      const plan = await updateDietPlanService(req.params.id, payload);
      res.status(200).json(plan);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // حذف خطة غذائية
  export const deleteDietPlan = async (req, res) => {
    try {
      await deleteDietPlanService(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // جلب وجبة واحدة فقط بالـ mealId
  export const getMealById = async (req, res) => {
    try {
      const meal = await getMealByIdService(req.params.mealId);
      if (!meal) return res.status(404).json({ message: "الوجبة غير موجودة" });
      res.json(meal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

  // جلب جميع الوجبات لخطة معينة
export const getMealsByPlanId = async (req, res) => {
  try {
    const meals = await getMealsByPlanIdService(req.params.planId);
    res.status(200).json(meals);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// إضافة وجبة جديدة
export const addMealToPlan = async (req, res) => {
  try {
    const plan = await addMealToPlanService(req.params.planId, req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// تعديل وجبة
export const updateMealInPlan = async (req, res) => {
  try {
    const meal = await updateMealInPlanService(req.params.planId, req.params.mealId, req.body);
    res.status(200).json(meal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// حذف وجبة
export const deleteMealFromPlan = async (req, res) => {
  try {
    await deleteMealFromPlanService(req.params.planId, req.params.mealId);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// جلب خطة غذائية واحدة بالـ ID
export const getDietPlanById = async (req, res) => {
  try {
    const plan = await getDietPlanByIdService(req.params.id);
    res.status(200).json(plan);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// جلب كل الخطط الغذائية
export const getAllDietPlans = async (req, res) => {
  try {
    const trainerId = req.query.trainerId || (req.user && req.user.role === 'trainer' ? req.user.id : undefined);
    const plans = await getAllDietPlansService({ trainerId });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};