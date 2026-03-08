import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import {
  createWorkoutPlan,
  getWorkoutPlansByUser,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  getWorkoutPlanById,
  addExerciseToPlan,
  updateExerciseInPlan,
  deleteExerciseFromPlan,
  getAllWorkoutPlans,
  getExercisesByPlanId,
  getExerciseById
} from "../controllers/workoutPlan.controller.js";
import { authorizeRole } from '../middlewares/role.middleware.js';
import upload, { uploadExerciseImage } from '../middlewares/upload.middleware.js';

const router = express.Router();

//  خطة  
router.post("/:userId", authenticate,  authorizeRole(['admin','manager', 'trainer']), createWorkoutPlan);
router.get("/:userId", authenticate,   getWorkoutPlansByUser);
router.get('/plan/:id', authenticate,  getWorkoutPlanById);
router.put("/:id", authenticate,  authorizeRole(['admin','manager', 'trainer']), updateWorkoutPlan);
router.delete("/:id", authenticate,  authorizeRole(['admin','manager', 'trainer']), deleteWorkoutPlan);

//  تمرين
router.get('/', authenticate,  getAllWorkoutPlans);
// إضافة تمرين مع رفع صورة إذا وجدت
router.post("/:planId/exercises", authenticate, authorizeRole(['admin','manager', 'trainer']), uploadExerciseImage.single('image'), addExerciseToPlan);
router.get('/:planId/exercises', authenticate, getExercisesByPlanId);
router.get('/:planId/exercises/:exerciseId', authenticate, getExerciseById);
// تعديل تمرين مع رفع صورة لو فيه تحديث
router.put("/:planId/exercises/:exerciseId", authenticate, authorizeRole(['admin','manager', 'trainer']), uploadExerciseImage.single('image'), updateExerciseInPlan);
router.delete("/:planId/exercises/:exerciseId", authenticate, authorizeRole(['admin','manager', 'trainer']), deleteExerciseFromPlan);


export default router;
