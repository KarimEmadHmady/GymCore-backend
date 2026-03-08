import User from '../models/user.model.js';
import { cacheManager } from '../utils/cache.util.js';

export const registerUser = async (name, email, password, phone) => {
  if (!phone) throw new Error('Phone is required');

  const existingUserEmail = await User.findOne({ email });
  if (existingUserEmail) throw new Error('Email already in use');

  const existingUserPhone = await User.findOne({ phone });
  if (existingUserPhone) throw new Error('Phone number already in use');

  const user = new User({ name, email, passwordHash: password, phone });
  await user.save();
  return user;
};

export const loginUser = async (identifier, password) => {


  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  // ✅ لكن يمكن caching بيانات المستخدم بعد التحقق (بدون كلمة المرور)
  const cacheKey = `user:auth:${user._id}`;
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };

  // Cache لمدة 5 دقائق فقط (للـ sessions)
  cacheManager.set(cacheKey, userData, 5 * 60 * 1000);

  return user;
};

/**
 * ✅ جلب بيانات المستخدم من الـ cache (للـ sessions)
 */
export const getUserFromCache = async (userId) => {
  const cacheKey = `user:auth:${userId}`;
  return cacheManager.get(cacheKey);
};

/**
 * ✅ مسح cache المستخدم عند الـ logout
 */
export const clearUserCache = (userId) => {
  const cacheKey = `user:auth:${userId}`;
  cacheManager.delete(cacheKey);
};