import {
  createWorkoutPlanService,
  getWorkoutPlansByUserService,
  updateWorkoutPlanService,
  deleteWorkoutPlanService,
  getWorkoutPlanByIdService,
  addExerciseToPlanService,
  updateExerciseInPlanService,
  deleteExerciseFromPlanService,
  getAllWorkoutPlansService,
  getExercisesByPlanIdService,
  getExerciseByIdService
} from "../services/workoutPlan.service.js";

// إنشاء خطة تمرين جديدة
export const createWorkoutPlan = async (req, res) => {
  try {
    const plan = await createWorkoutPlanService({  
      ...req.body,
      userId: req.params.userId,
      trainerId: req.body.trainerId || (req.user && req.user.role === 'trainer' ? req.user.id : undefined)
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب جميع الخطط لمستخدم معين
export const getWorkoutPlansByUser = async (req, res) => {
  try {
    const plans = await getWorkoutPlansByUserService(req.params.userId);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب خطة تمرين واحدة بالـ id
export const getWorkoutPlanById = async (req, res) => {
  try {
    const plan = await getWorkoutPlanByIdService(req.params.id);
    if (!plan) return res.status(404).json({ message: "الخطة غير موجودة" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعديل خطة تمرين
export const updateWorkoutPlan = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.trainerId && req.user && req.user.role === 'trainer') {
      payload.trainerId = req.user.id;
    }
    const updated = await updateWorkoutPlanService(req.params.id, payload);
    if (!updated) return res.status(404).json({ message: "الخطة غير موجودة" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف خطة تمرين
export const deleteWorkoutPlan = async (req, res) => {
  try {
    const deleted = await deleteWorkoutPlanService(req.params.id);
    if (!deleted) return res.status(404).json({ message: "الخطة غير موجودة" });
    res.json({ message: "تم حذف الخطة بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// إضافة تمرين
export const addExerciseToPlan = async (req, res) => {
  try {
    // لو فيه صورة مرفوعة عن طريق multer/cloudinary: ضع الرابط في body.image
    if (req.file && req.file.path) {
      req.body.image = req.file.path;
    }
    const plan = await addExerciseToPlanService(req.params.planId, req.body);
    if (!plan) return res.status(404).json({ message: "الخطة غير موجودة" });
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعديل تمرين
export const updateExerciseInPlan = async (req, res) => {
  try {
    // لو فيه صورة مرفوعة عن طريق multer/cloudinary: ضع الرابط في body.image
    if (req.file && req.file.path) {
      req.body.image = req.file.path;
    }
    const plan = await updateExerciseInPlanService(
      req.params.planId,
      req.params.exerciseId,
      req.body
    );
    if (!plan) return res.status(404).json({ message: "الخطة أو التمرين غير موجود" });
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف تمرين
export const deleteExerciseFromPlan = async (req, res) => {
  try {
    const plan = await deleteExerciseFromPlanService(req.params.planId, req.params.exerciseId);
    if (!plan) return res.status(404).json({ message: "الخطة أو التمرين غير موجود" });
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب جميع خطط التمرين
export const getAllWorkoutPlans = async (req, res) => {
  try {
    const trainerId = req.query.trainerId || (req.user && req.user.role === 'trainer' ? req.user.id : undefined);
    const plans = await getAllWorkoutPlansService({ trainerId });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب جميع التمارين لخطة معينة
export const getExercisesByPlanId = async (req, res) => {
  try {
    const exercises = await getExercisesByPlanIdService(req.params.planId);
    res.json(exercises);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// جلب تمرين معين من الخطة بواسطة الـ ID
export const getExerciseById = async (req, res) => {
  try {
    const exercise = await getExerciseByIdService(req.params.planId, req.params.exerciseId);
    if (!exercise) return res.status(404).json({ message: "التمرين غير موجود" });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};