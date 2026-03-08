import {
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  getUserLoyaltyPoints,
  addPointsFromPayment,
  getLoyaltyPointsStats,
  addAttendancePoints,
  getRedeemableRewards,
  redeemReward,
  getAllRedeemableRewards,
  createRedeemableReward,
  updateRedeemableReward,
  deleteRedeemableReward,
  getRewardsStats,
  getLoyaltyPointsHistory,
  getAllLoyaltyPointsHistory
} from '../services/loyaltyPoints.service.js';

/**
 * جلب نقاط الولاء للمستخدم
 */
export const getUserPoints = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const loyaltyData = await getUserLoyaltyPoints(userId);
    res.json(loyaltyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * إضافة نقاط ولاء للمستخدم (للمدير فقط)
 */
export const addPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    
    if (!userId || !points || !reason) {
      return res.status(400).json({ 
        message: 'جميع الحقول مطلوبة: userId, points, reason' 
      });
    }

    const updatedUser = await addLoyaltyPoints(userId, points, reason);
    res.json({
      message: 'تم إضافة النقاط بنجاح',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * استبدال نقاط الولاء
 */
export const redeemPoints = async (req, res) => {
  try {
    const { userId, points, reward } = req.body;
    
    if (!userId || !points || !reward) {
      return res.status(400).json({ 
        message: 'جميع الحقول مطلوبة: userId, points, reward' 
      });
    }

    const updatedUser = await redeemLoyaltyPoints(userId, points, reward);
    res.json({
      message: 'تم استبدال النقاط بنجاح',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * جلب إحصائيات نقاط الولاء (للمدير فقط)
 */
export const getStats = async (req, res) => {
  try {
    const stats = await getLoyaltyPointsStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * إضافة نقاط من الدفع (يتم استدعاؤها تلقائياً)
 */
export const addPointsFromPaymentController = async (req, res) => {
  try {
    const { userId, amount, paymentType } = req.body;
    
    if (!userId || !amount || !paymentType) {
      return res.status(400).json({ 
        message: 'جميع الحقول مطلوبة: userId, amount, paymentType' 
      });
    }

    const updatedUser = await addPointsFromPayment(userId, amount, paymentType);
    res.json({
      message: 'تم إضافة النقاط من الدفع بنجاح',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * إضافة نقاط للحضور
 */
export const addAttendancePointsController = async (req, res) => {
  try {
    const { userId, attendanceStreak } = req.body;
    
    if (!userId || !attendanceStreak) {
      return res.status(400).json({ 
        message: 'جميع الحقول مطلوبة: userId, attendanceStreak' 
      });
    }

    const updatedUser = await addAttendancePoints(userId, attendanceStreak);
    res.json({
      message: 'تم إضافة نقاط الحضور بنجاح',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import User from '../models/user.model.js';

/**
 * جلب أفضل المستخدمين في النقاط
 */
export const getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topUsers = await User.find({ loyaltyPoints: { $gt: 0 } })
      .sort({ loyaltyPoints: -1 })
      .limit(limit)
      .select('name email loyaltyPoints avatarUrl');

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== وظائف الجوائز ====================

/**
 * جلب الجوائز القابلة للاستبدال للمستخدم
 */
export const getRedeemableRewardsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const rewardsData = await getRedeemableRewards(userId);
    res.json(rewardsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * استبدال نقاط بجائزة
 */
export const redeemRewardController = async (req, res) => {
  try {
    const { rewardId } = req.body;
    const userId = req.user.id;
    
    if (!rewardId) {
      return res.status(400).json({ 
        message: 'معرف الجائزة مطلوب' 
      });
    }

    const result = await redeemReward(userId, rewardId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * جلب جميع الجوائز (للمدير)
 */
export const getAllRedeemableRewardsController = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      minPoints: req.query.minPoints ? parseInt(req.query.minPoints) : undefined,
      maxPoints: req.query.maxPoints ? parseInt(req.query.maxPoints) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const rewards = await getAllRedeemableRewards(filters);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * إنشاء جائزة جديدة (للمدير)
 */
export const createRedeemableRewardController = async (req, res) => {
  try {
    const rewardData = req.body;
    const reward = await createRedeemableReward(rewardData);
    res.status(201).json({
      message: 'تم إنشاء الجائزة بنجاح',
      reward
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * تحديث جائزة (للمدير)
 */
export const updateRedeemableRewardController = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const updateData = req.body;
    
    const reward = await updateRedeemableReward(rewardId, updateData);
    res.json({
      message: 'تم تحديث الجائزة بنجاح',
      reward
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * حذف جائزة (للمدير)
 */
export const deleteRedeemableRewardController = async (req, res) => {
  try {
    const { rewardId } = req.params;
    
    const deleted = await deleteRedeemableReward(rewardId);
    if (!deleted) {
      return res.status(404).json({ message: 'الجائزة غير موجودة' });
    }
    
    res.json({ message: 'تم حذف الجائزة بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * جلب إحصائيات الجوائز (للمدير)
 */
export const getRewardsStatsController = async (req, res) => {
  try {
    const stats = await getRewardsStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * جلب سجل نقاط الولاء للمستخدم
 */
export const getLoyaltyPointsHistoryController = async (req, res) => {
  try {
    // استخدم userId من الباراميتر إذا وُجد (للأدمن)، وإلا استخدم المستخدم الحالي
    const userId = req.params.userId || req.user.id;
    const filters = {
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const history = await getLoyaltyPointsHistory(userId, filters);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * جلب كل سجل النقاط لجميع المستخدمين (للمدير فقط)
 */
export const getAllLoyaltyPointsHistoryController = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };
    const history = await getAllLoyaltyPointsHistory(filters);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
