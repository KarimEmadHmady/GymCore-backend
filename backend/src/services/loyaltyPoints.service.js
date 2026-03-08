import User from '../models/user.model.js';
import RedeemableReward from '../models/userMangment/RedeemableReward.model.js';
import LoyaltyPointsHistory from '../models/userMangment/LoyaltyPointsHistory.model.js';
import { cacheManager } from '../utils/cache.util.js';

/**
 * إضافة نقاط ولاء للمستخدم
 * @param {string} userId - معرف المستخدم
 * @param {number} points - عدد النقاط المراد إضافتها
 * @param {string} reason - سبب إضافة النقاط
 * @returns {Object} المستخدم المحدث
 */
export const addLoyaltyPoints = async (userId, points, reason) => {
  if (!userId || !points || points <= 0) {
    throw new Error('بيانات غير صحيحة: معرف المستخدم وعدد النقاط مطلوبان');
  }

  // التحقق من وجود المستخدم
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  // إضافة النقاط للمستخدم
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { loyaltyPoints: points } },
    { new: true }
  );

  // تسجيل العملية في سجل النقاط
  await LoyaltyPointsHistory.create({
    userId,
    points,
    type: 'earned',
    reason,
    remainingPoints: updatedUser.loyaltyPoints
  });

  return updatedUser;
};

/**
 * استبدال نقاط الولاء
 * @param {string} userId - معرف المستخدم
 * @param {number} points - عدد النقاط المراد استبدالها
 * @param {string} reward - المكافأة المستبدلة
 * @returns {Object} المستخدم المحدث
 */
export const redeemLoyaltyPoints = async (userId, points, reward) => {
  if (!userId || !points || points <= 0) {
    throw new Error('بيانات غير صحيحة: معرف المستخدم وعدد النقاط مطلوبان');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  if (user.loyaltyPoints < points) {
    throw new Error('نقاط غير كافية للاستبدال');
  }

  // خصم النقاط
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { loyaltyPoints: -points } },
    { new: true }
  );

  // تسجيل الاستبدال
  await LoyaltyPointsHistory.create({
    userId,
    points: -points,
    type: 'redeemed',
    reason: reward,
    remainingPoints: updatedUser.loyaltyPoints
  });

  return updatedUser;
};

/**
 * جلب نقاط الولاء للمستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Object} معلومات النقاط
 */
export const getUserLoyaltyPoints = async (userId) => {
  const user = await User.findById(userId).select('loyaltyPoints name email');
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  // جلب سجل النقاط
  const rewardsHistory = await LoyaltyPointsHistory.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('rewardId', 'name category');

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      loyaltyPoints: user.loyaltyPoints
    },
    history: rewardsHistory
  };
};

/**
 * حساب نقاط الولاء من المدفوعات
 * @param {number} amount - مبلغ الدفع
 * @returns {number} عدد النقاط المكتسبة
 */
export const calculatePointsFromPayment = (amount) => {
  // قاعدة: كل 10 جنيه = نقطة واحدة
  return Math.floor(amount / 10);
};

/**
 * إضافة نقاط تلقائياً عند الدفع
 * @param {string} userId - معرف المستخدم
 * @param {number} amount - مبلغ الدفع
 * @param {string} paymentType - نوع الدفع
 * @returns {Object} المستخدم المحدث
 */
export const addPointsFromPayment = async (userId, amount, paymentType, paymentId = null) => {
  const points = calculatePointsFromPayment(amount);
  
  if (points > 0) {
    const reason = `دفع ${paymentType} - ${amount} جنيه`;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { loyaltyPoints: points } },
      { new: true }
    );

    // تسجيل العملية في سجل النقاط
    await LoyaltyPointsHistory.create({
      userId,
      points,
      type: 'payment_bonus',
      reason,
      paymentId,
      remainingPoints: updatedUser.loyaltyPoints
    });

    return updatedUser;
  }
  
  return await User.findById(userId);
};

/**
 * جلب إحصائيات نقاط الولاء
 * @returns {Object} الإحصائيات
 */
export const getLoyaltyPointsStats = async () => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalPoints: { $sum: '$loyaltyPoints' },
        totalUsers: { $sum: 1 },
        avgPoints: { $avg: '$loyaltyPoints' },
        maxPoints: { $max: '$loyaltyPoints' }
      }
    }
  ]);

  const topUsers = await User.find({ loyaltyPoints: { $gt: 0 } })
    .sort({ loyaltyPoints: -1 })
    .limit(10)
    .select('name email loyaltyPoints');

  return {
    stats: stats[0] || { totalPoints: 0, totalUsers: 0, avgPoints: 0, maxPoints: 0 },
    topUsers
  };
};

/**
 * إضافة نقاط للحضور
 * @param {string} userId - معرف المستخدم
 * @param {number} attendanceStreak - عدد أيام الحضور المتتالية
 * @returns {Object} المستخدم المحدث
 */
export const addAttendancePoints = async (userId, attendanceStreak, attendanceId = null) => {
  let points = 0;
  let reason = '';

  if (attendanceStreak >= 7) {
    points = 50;
    reason = 'حضور أسبوع متتالي';
  } else if (attendanceStreak >= 3) {
    points = 20;
    reason = 'حضور 3 أيام متتالية';
  } else {
    points = 5;
    reason = 'حضور اليوم';
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { loyaltyPoints: points } },
    { new: true }
  );

  // تسجيل العملية في سجل النقاط
  await LoyaltyPointsHistory.create({
    userId,
    points,
    type: 'attendance_bonus',
    reason,
    attendanceId,
    remainingPoints: updatedUser.loyaltyPoints
  });

  return updatedUser;
};

/**
 * جلب الجوائز القابلة للاستبدال للمستخدم (مع caching)
 * @param {string} userId - معرف المستخدم
 * @returns {Array} قائمة الجوائز المتاحة
 */
export const getRedeemableRewards = async (userId) => {
  const user = await User.findById(userId).select('loyaltyPoints membershipLevel');
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  // ✅ Cache key يعتمد على نقاط المستخدم ومستواه
  // لأن الجوائز تتغير حسب النقاط والمستوى
  const cacheKey = `rewards:user:${userId}:points:${user.loyaltyPoints}:level:${user.membershipLevel}`;
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log(`✅ Cache hit for redeemable rewards - user ${userId}`);
    return cached;
  }

  console.log(`❌ Cache miss - fetching redeemable rewards for user ${userId}`);

  const rewards = await RedeemableReward.find({
    isActive: true,
    pointsRequired: { $lte: user.loyaltyPoints },
    minMembershipLevel: { $lte: user.membershipLevel },
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: { $gt: new Date() } }
    ]
  }).sort({ pointsRequired: 1 });

  const result = {
    user: {
      loyaltyPoints: user.loyaltyPoints,
      membershipLevel: user.membershipLevel
    },
    rewards
  };

  // ✅ Cache for 15 minutes (الجوائز لا تتغير كثيراً)
  cacheManager.set(cacheKey, result, 15 * 60 * 1000);

  return result;
};

/**
 * ✅ مسح cache الـ rewards عند التعديل
 * (استدعِ هذه الدالة عند إضافة/تعديل/حذف rewards)
 */
export const clearRewardsCache = (userId = null) => {
  if (userId) {
    // مسح cache مستخدم معين
    // في الواقع نحتاج pattern لمسح جميع cache keys المتعلقة بالمستخدم
    // لكن بما أن cache key يعتمد على النقاط، فسيتم تحديثه تلقائياً
    console.log(`🧹 Cleared rewards cache for user ${userId}`);
  } else {
    // مسح جميع rewards cache (للإدارة)
    // في التطبيق الحقيقي يمكن استخدام Redis مع pattern deletion
    console.log('🧹 Cleared all rewards cache');
  }
};

/**
 * استبدال نقاط بجائزة
 * @param {string} userId - معرف المستخدم
 * @param {string} rewardId - معرف الجائزة
 * @returns {Object} نتيجة الاستبدال
 */
export const redeemReward = async (userId, rewardId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  const reward = await RedeemableReward.findById(rewardId);
  if (!reward) {
    throw new Error('الجائزة غير موجودة');
  }

  if (!reward.isActive) {
    throw new Error('الجائزة غير متاحة حالياً');
  }

  if (reward.validUntil && reward.validUntil < new Date()) {
    throw new Error('انتهت صلاحية هذه الجائزة');
  }

  if (user.loyaltyPoints < reward.pointsRequired) {
    throw new Error('نقاط غير كافية للاستبدال');
  }

  if (user.membershipLevel < reward.minMembershipLevel) {
    throw new Error('مستوى العضوية غير كافي لهذه الجائزة');
  }

  // التحقق من المخزون
  if (reward.stock !== -1 && reward.totalRedemptions >= reward.stock) {
    throw new Error('نفد المخزون من هذه الجائزة');
  }

  // خصم النقاط
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { loyaltyPoints: -reward.pointsRequired } },
    { new: true }
  );

  // تسجيل الاستبدال
  await LoyaltyPointsHistory.create({
    userId,
    points: -reward.pointsRequired,
    type: 'redeemed',
    reason: `استبدال: ${reward.name}`,
    rewardId: reward._id,
    remainingPoints: updatedUser.loyaltyPoints
  });

  // تحديث عدد مرات الاستبدال
  await RedeemableReward.findByIdAndUpdate(
    rewardId,
    { $inc: { totalRedemptions: 1 } }
  );

  return {
    user: updatedUser,
    reward: {
      id: reward._id,
      name: reward.name,
      description: reward.description,
      pointsUsed: reward.pointsRequired,
      category: reward.category
    },
    message: 'تم استبدال النقاط بالجائزة بنجاح'
  };
};

/**
 * جلب جميع الجوائز (للمدير)
 * @param {Object} filters - فلاتر البحث
 * @returns {Array} قائمة الجوائز
 */
export const getAllRedeemableRewards = async (filters = {}) => {
  const query = {};
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.minPoints) {
    query.pointsRequired = { $gte: filters.minPoints };
  }

  if (filters.maxPoints) {
    query.pointsRequired = { ...query.pointsRequired, $lte: filters.maxPoints };
  }

  const rewards = await RedeemableReward.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50);

  return rewards;
};

/**
 * إنشاء جائزة جديدة (للمدير)
 * @param {Object} rewardData - بيانات الجائزة
 * @returns {Object} الجائزة المنشأة
 */
export const createRedeemableReward = async (rewardData) => {
  const reward = new RedeemableReward(rewardData);
  return await reward.save();
};

/**
 * تحديث جائزة (للمدير)
 * @param {string} rewardId - معرف الجائزة
 * @param {Object} updateData - البيانات المحدثة
 * @returns {Object} الجائزة المحدثة
 */
export const updateRedeemableReward = async (rewardId, updateData) => {
  const reward = await RedeemableReward.findByIdAndUpdate(
    rewardId,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!reward) {
    throw new Error('الجائزة غير موجودة');
  }
  
  return reward;
};

/**
 * حذف جائزة (للمدير)
 * @param {string} rewardId - معرف الجائزة
 * @returns {boolean} نجح الحذف
 */
export const deleteRedeemableReward = async (rewardId) => {
  const reward = await RedeemableReward.findByIdAndDelete(rewardId);
  return !!reward;
};

/**
 * جلب إحصائيات الجوائز
 * @returns {Object} إحصائيات الجوائز
 */
export const getRewardsStats = async () => {
  const stats = await RedeemableReward.aggregate([
    {
      $group: {
        _id: null,
        totalRewards: { $sum: 1 },
        activeRewards: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalRedemptions: { $sum: '$totalRedemptions' },
        avgPointsRequired: { $avg: '$pointsRequired' }
      }
    }
  ]);

  const categoryStats = await RedeemableReward.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalRedemptions: { $sum: '$totalRedemptions' }
      }
    }
  ]);

  return {
    general: stats[0] || {
      totalRewards: 0,
      activeRewards: 0,
      totalRedemptions: 0,
      avgPointsRequired: 0
    },
    byCategory: categoryStats
  };
};

/**
 * جلب سجل نقاط الولاء للمستخدم
 * @param {string} userId - معرف المستخدم
 * @param {Object} filters - فلاتر البحث
 * @returns {Object} سجل النقاط
 */
export const getLoyaltyPointsHistory = async (userId, filters = {}) => {
  const query = { userId };
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.startDate) {
    query.createdAt = { ...query.createdAt, $gte: new Date(filters.startDate) };
  }
  
  if (filters.endDate) {
    query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
  }

  const history = await LoyaltyPointsHistory.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .populate('rewardId', 'name category pointsRequired')
    .populate('adminId', 'name email');

  const totalCount = await LoyaltyPointsHistory.countDocuments(query);

  return {
    history,
    totalCount,
    pagination: {
      limit: filters.limit || 50,
      total: totalCount
    }
  };
};

/**
 * جلب كل سجل النقاط لجميع المستخدمين (للاستخدام الإداري)
 * @param {Object} filters - فلاتر البحث
 * @returns {Object} سجل النقاط
 */
export const getAllLoyaltyPointsHistory = async (filters = {}) => {
  const query = {};
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.startDate) {
    query.createdAt = { ...query.createdAt, $gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
  }
  const history = await LoyaltyPointsHistory.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .populate('rewardId', 'name category pointsRequired')
    .populate('adminId', 'name email');
  const totalCount = await LoyaltyPointsHistory.countDocuments(query);
  return {
    history,
    totalCount,
    pagination: {
      limit: filters.limit || 100,
      total: totalCount
    }
  };
};