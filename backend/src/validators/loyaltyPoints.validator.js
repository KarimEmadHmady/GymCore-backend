import Joi from 'joi';

// Schema لإضافة نقاط ولاء
export const addPointsSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'معرف المستخدم مطلوب',
    'any.required': 'معرف المستخدم مطلوب'
  }),
  points: Joi.number().positive().required().messages({
    'number.base': 'النقاط يجب أن تكون رقم',
    'number.positive': 'النقاط يجب أن تكون رقم موجب',
    'any.required': 'عدد النقاط مطلوب'
  }),
  reason: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'سبب إضافة النقاط مطلوب',
    'string.min': 'سبب إضافة النقاط يجب أن يكون 3 أحرف على الأقل',
    'string.max': 'سبب إضافة النقاط يجب أن يكون 200 حرف كحد أقصى',
    'any.required': 'سبب إضافة النقاط مطلوب'
  })
});

// Schema لاستبدال نقاط الولاء
export const redeemPointsSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'معرف المستخدم مطلوب',
    'any.required': 'معرف المستخدم مطلوب'
  }),
  points: Joi.number().positive().required().messages({
    'number.base': 'النقاط يجب أن تكون رقم',
    'number.positive': 'النقاط يجب أن تكون رقم موجب',
    'any.required': 'عدد النقاط مطلوب'
  }),
  reward: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'المكافأة المستبدلة مطلوبة',
    'string.min': 'المكافأة يجب أن تكون 3 أحرف على الأقل',
    'string.max': 'المكافأة يجب أن تكون 200 حرف كحد أقصى',
    'any.required': 'المكافأة المستبدلة مطلوبة'
  })
});

// Schema لإضافة نقاط من الدفع
export const paymentPointsSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'معرف المستخدم مطلوب',
    'any.required': 'معرف المستخدم مطلوب'
  }),
  amount: Joi.number().positive().required().messages({
    'number.base': 'المبلغ يجب أن يكون رقم',
    'number.positive': 'المبلغ يجب أن يكون رقم موجب',
    'any.required': 'المبلغ مطلوب'
  }),
  paymentType: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'نوع الدفع مطلوب',
    'string.min': 'نوع الدفع يجب أن يكون 3 أحرف على الأقل',
    'string.max': 'نوع الدفع يجب أن يكون 100 حرف كحد أقصى',
    'any.required': 'نوع الدفع مطلوب'
  })
});

// Schema لإضافة نقاط الحضور
export const attendancePointsSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'معرف المستخدم مطلوب',
    'any.required': 'معرف المستخدم مطلوب'
  }),
  attendanceStreak: Joi.number().integer().min(1).max(30).required().messages({
    'number.base': 'عدد أيام الحضور يجب أن يكون رقم',
    'number.integer': 'عدد أيام الحضور يجب أن يكون رقم صحيح',
    'number.min': 'عدد أيام الحضور يجب أن يكون 1 على الأقل',
    'number.max': 'عدد أيام الحضور يجب أن يكون 30 كحد أقصى',
    'any.required': 'عدد أيام الحضور مطلوب'
  })
});

// Schema للتحقق من معرف المستخدم
export const userIdSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'معرف المستخدم مطلوب',
    'any.required': 'معرف المستخدم مطلوب'
  })
});

// Schema للتحقق من limit في top users
export const topUsersSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).optional().messages({
    'number.base': 'الحد يجب أن يكون رقم',
    'number.integer': 'الحد يجب أن يكون رقم صحيح',
    'number.min': 'الحد يجب أن يكون 1 على الأقل',
    'number.max': 'الحد يجب أن يكون 50 كحد أقصى'
  })
});

// ==================== Validators للجوائز ====================

// Schema لاستبدال نقاط بجائزة
export const redeemRewardSchema = Joi.object({
  rewardId: Joi.string().required().messages({
    'string.empty': 'معرف الجائزة مطلوب',
    'any.required': 'معرف الجائزة مطلوب'
  })
});

// Schema لإنشاء جائزة جديدة
export const createRewardSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'اسم الجائزة مطلوب',
    'string.min': 'اسم الجائزة يجب أن يكون 3 أحرف على الأقل',
    'string.max': 'اسم الجائزة يجب أن يكون 100 حرف كحد أقصى',
    'any.required': 'اسم الجائزة مطلوب'
  }),
  description: Joi.string().min(10).max(500).required().messages({
    'string.empty': 'وصف الجائزة مطلوب',
    'string.min': 'وصف الجائزة يجب أن يكون 10 أحرف على الأقل',
    'string.max': 'وصف الجائزة يجب أن يكون 500 حرف كحد أقصى',
    'any.required': 'وصف الجائزة مطلوب'
  }),
  pointsRequired: Joi.number().positive().required().messages({
    'number.base': 'النقاط المطلوبة يجب أن تكون رقم',
    'number.positive': 'النقاط المطلوبة يجب أن تكون رقم موجب',
    'any.required': 'النقاط المطلوبة مطلوبة'
  }),
  category: Joi.string().valid(
    'discount',
    'free_session',
    'merchandise',
    'subscription_extension',
    'premium_feature',
    'gift_card'
  ).required().messages({
    'any.only': 'فئة الجائزة غير صحيحة',
    'any.required': 'فئة الجائزة مطلوبة'
  }),
  isActive: Joi.boolean().optional().default(true),
  stock: Joi.number().integer().min(-1).optional().default(-1).messages({
    'number.base': 'المخزون يجب أن يكون رقم',
    'number.integer': 'المخزون يجب أن يكون رقم صحيح',
    'number.min': 'المخزون يجب أن يكون -1 أو أكثر'
  }),
  imageUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'رابط الصورة غير صحيح'
  }),
  validUntil: Joi.date().greater('now').optional().messages({
    'date.greater': 'تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل'
  }),
  minMembershipLevel: Joi.string().valid('basic', 'silver', 'gold', 'platinum').optional().default('basic').messages({
    'any.only': 'مستوى العضوية غير صحيح'
  }),
  value: Joi.number().min(0).optional().messages({
    'number.base': 'القيمة يجب أن تكون رقم',
    'number.min': 'القيمة يجب أن تكون 0 أو أكثر'
  }),
  valueUnit: Joi.string().max(20).optional().default('جنيه').messages({
    'string.max': 'وحدة القيمة يجب أن تكون 20 حرف كحد أقصى'
  }),
  conditions: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'الشروط يجب أن تكون 500 حرف كحد أقصى'
  }),
  maxRedemptionsPerUser: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'الحد الأقصى للاستبدال يجب أن يكون رقم',
    'number.integer': 'الحد الأقصى للاستبدال يجب أن يكون رقم صحيح',
    'number.min': 'الحد الأقصى للاستبدال يجب أن يكون 1 على الأقل'
  })
});

// Schema لتحديث جائزة
export const updateRewardSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'اسم الجائزة يجب أن يكون 3 أحرف على الأقل',
    'string.max': 'اسم الجائزة يجب أن يكون 100 حرف كحد أقصى'
  }),
  description: Joi.string().min(10).max(500).optional().messages({
    'string.min': 'وصف الجائزة يجب أن يكون 10 أحرف على الأقل',
    'string.max': 'وصف الجائزة يجب أن يكون 500 حرف كحد أقصى'
  }),
  pointsRequired: Joi.number().positive().optional().messages({
    'number.base': 'النقاط المطلوبة يجب أن تكون رقم',
    'number.positive': 'النقاط المطلوبة يجب أن تكون رقم موجب'
  }),
  category: Joi.string().valid(
    'discount',
    'free_session',
    'merchandise',
    'subscription_extension',
    'premium_feature',
    'gift_card'
  ).optional().messages({
    'any.only': 'فئة الجائزة غير صحيحة'
  }),
  isActive: Joi.boolean().optional(),
  stock: Joi.number().integer().min(-1).optional().messages({
    'number.base': 'المخزون يجب أن يكون رقم',
    'number.integer': 'المخزون يجب أن يكون رقم صحيح',
    'number.min': 'المخزون يجب أن يكون -1 أو أكثر'
  }),
  imageUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'رابط الصورة غير صحيح'
  }),
  validUntil: Joi.date().greater('now').optional().messages({
    'date.greater': 'تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل'
  }),
  minMembershipLevel: Joi.string().valid('basic', 'silver', 'gold', 'platinum').optional().messages({
    'any.only': 'مستوى العضوية غير صحيح'
  }),
  value: Joi.number().min(0).optional().messages({
    'number.base': 'القيمة يجب أن تكون رقم',
    'number.min': 'القيمة يجب أن تكون 0 أو أكثر'
  }),
  valueUnit: Joi.string().max(20).optional().messages({
    'string.max': 'وحدة القيمة يجب أن تكون 20 حرف كحد أقصى'
  }),
  conditions: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'الشروط يجب أن تكون 500 حرف كحد أقصى'
  }),
  maxRedemptionsPerUser: Joi.number().integer().min(1).optional().messages({
    'number.base': 'الحد الأقصى للاستبدال يجب أن يكون رقم',
    'number.integer': 'الحد الأقصى للاستبدال يجب أن يكون رقم صحيح',
    'number.min': 'الحد الأقصى للاستبدال يجب أن يكون 1 على الأقل'
  })
});