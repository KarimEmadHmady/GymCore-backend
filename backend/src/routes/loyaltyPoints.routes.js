import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import {
  getUserPoints,
  addPoints,
  redeemPoints,
  getStats,
  addPointsFromPaymentController,
  addAttendancePointsController,
  getTopUsers,
  getRedeemableRewardsController,
  redeemRewardController,
  getAllRedeemableRewardsController,
  createRedeemableRewardController,
  updateRedeemableRewardController,
  deleteRedeemableRewardController,
  getRewardsStatsController,
  getLoyaltyPointsHistoryController,
  getAllLoyaltyPointsHistoryController
} from '../controllers/loyaltyPoints.controller.js';
import {
  addPointsSchema,
  redeemPointsSchema,
  paymentPointsSchema,
  attendancePointsSchema,
  redeemRewardSchema,
  createRewardSchema,
  updateRewardSchema
} from '../validators/loyaltyPoints.validator.js';

// Middleware للتحقق من صحة البيانات
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'بيانات غير صحيحة',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const router = express.Router();

// جلب نقاط الولاء للمستخدم (يمكن للمستخدم رؤية نقاطه)
router.get('/user/:userId', authenticate, getUserPoints);

// جلب نقاط الولاء للمستخدم الحالي
router.get('/my-points', authenticate, getUserPoints);

// إضافة نقاط ولاء (للمدير والمدرب والمدير فقط)
router.post('/add', authenticate, authorizeRole(['admin', 'trainer', 'manager']), validateRequest(addPointsSchema), addPoints);

// استبدال نقاط الولاء (للمستخدم نفسه)
router.post('/redeem', authenticate, validateRequest(redeemPointsSchema), redeemPoints);

// جلب إحصائيات نقاط الولاء (للمدير فقط)
router.get('/stats', authenticate, authorizeRole(['admin', 'trainer' , 'manager']), getStats);

// جلب أفضل المستخدمين في النقاط
router.get('/top-users', authenticate, getTopUsers);

// إضافة نقاط من الدفع (للمدير فقط)
router.post('/payment-points', authenticate, authorizeRole(['admin',  'manager']), validateRequest(paymentPointsSchema), addPointsFromPaymentController);

// إضافة نقاط للحضور (للمدير والمدرب)
router.post('/attendance-points', authenticate, authorizeRole(['admin', 'trainer','manager']), validateRequest(attendancePointsSchema), addAttendancePointsController);

// ==================== Routes الجوائز ====================

// جلب الجوائز القابلة للاستبدال للمستخدم الحالي
router.get('/rewards', authenticate, getRedeemableRewardsController);

// استبدال نقاط بجائزة
router.post('/redeem-reward', authenticate, validateRequest(redeemRewardSchema), redeemRewardController);

// جلب جميع الجوائز (للمدير فقط)
router.get('/admin/rewards', authenticate, authorizeRole(['admin', 'trainer','manager']), getAllRedeemableRewardsController);

// إنشاء جائزة جديدة (للمدير فقط)
router.post('/admin/rewards', authenticate, authorizeRole(['admin',  'manager']), validateRequest(createRewardSchema), createRedeemableRewardController);

// تحديث جائزة (للمدير فقط)
router.put('/admin/rewards/:rewardId', authenticate, authorizeRole(['admin',  'manager']), validateRequest(updateRewardSchema), updateRedeemableRewardController);

// حذف جائزة (للمدير فقط)
router.delete('/admin/rewards/:rewardId', authenticate, authorizeRole(['admin',  'manager']), deleteRedeemableRewardController);

// جلب إحصائيات الجوائز (للمدير فقط)
router.get('/admin/rewards/stats', authenticate, authorizeRole(['admin',  'manager']), getRewardsStatsController);

// جلب سجل نقاط الولاء للمستخدم الحالي
router.get('/history', authenticate, getLoyaltyPointsHistoryController);

// جلب سجل نقاط الولاء لمستخدم معين (للمدير فقط)
router.get('/user/:userId/history', authenticate, authorizeRole(['admin', 'trainer','manager']), getLoyaltyPointsHistoryController);

// جلب كل سجل النقاط لجميع المستخدمين (للمدير فقط)
router.get('/admin/history', authenticate, authorizeRole(['admin',  'manager']), getAllLoyaltyPointsHistoryController);

export default router;
