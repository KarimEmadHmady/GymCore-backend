import User from '../models/user.model.js';
import { cacheManager } from '../utils/cache.util.js';

// ✅ Get All Users
export const getAllUsersService = async (query = {}) => {
  const filter = {
    isDeleted: false, // Hide soft deleted
    role: { $ne: 'super_admin' } // Hide super_admin
  };

  if (query.role) {
    filter.role = query.role;
  } else {
    filter.role = { $ne: 'super_admin' };
  }  
  if (query.status) filter.status = query.status;

  return await User.find(filter)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean(); 

};

// ✅ Get Single User (with caching)
export const getUserByIdService = async (userId) => {
  // ✅ Check cache first
  const cacheKey = `user:${userId}`;
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log(`✅ Cache hit for user ${userId}`);
    return cached;
  }

  // ❌ Cache miss - fetch from DB
  console.log(`❌ Cache miss - fetching user ${userId} from DB`);
  const user = await User.findOne({
    _id: userId,
    isDeleted: false,
    role: { $ne: 'super_admin' }
  })
  .select('-passwordHash') 
  .lean(); 

  if (!user) throw new Error('User not found');

  // ✅ Cache for 10 minutes
  cacheManager.set(cacheKey, user, 10 * 60 * 1000);
  return user;
};

// ✅ Get My Clients
export const getMyClientsService = async (trainerId) => {
  return await User.find({
    trainerId,
    isDeleted: false,
    role: { $ne: 'super_admin' }
  })
  .select('-passwordHash')
  .lean(); 
};


export const updateUserRoleService = async (userId, role, actingRole, actingUserId) => {
  if (!actingRole) {
    throw new Error('Unauthorized');
  }

  // ❌ No self role changes
  if (userId === String(actingUserId)) {
    throw new Error('لا يمكنك تغيير دورك بنفسك.');
  }

  // ❌ No one can modify super_admin
  const targetUser = await getUserByIdService(userId);
  if (targetUser.role === 'super_admin') {
    throw new Error('لا يمكنك تعديل سوبر أدمن.');
  }

  const allowedRoles = ['member', 'trainer', 'manager', 'admin'];

  if (!allowedRoles.includes(role)) {
    throw new Error('Invalid role');
  }

  // Manager Restriction
  if (actingRole === 'manager') {
    const managerAllowedTargets = ['member', 'trainer'];
    if (!managerAllowedTargets.includes(role)) {
      throw new Error('Managers can only set role to member or trainer');
    }
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) {
    throw new Error('User not found');
  }

  // ✅ Clear cache when user is updated
  cacheManager.delete(`user:${userId}`);

  return user;
};


export const updateUserByIdService = async (userId, updateData, actingUserId, actingRole, file) => {
    const targetUser = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!targetUser) {
      throw new Error('المستخدم غير موجود أو محذوف.');
    }

    if (targetUser.role === 'super_admin') {
      throw new Error('غير مصرح بتعديل مستخدم بصلاحيات Super Admin.');
    }

    if (file?.path) {
      updateData.avatarUrl = file.path;
    }

    if (!file && (!updateData || Object.keys(updateData).length === 0)) {
      throw new Error('لا توجد بيانات للتحديث ولا ملف مرفوع.');
    }

    delete updateData.passwordHash;

    // ✅ التحقق فقط عند تغيير الدور
    if ('role' in updateData && updateData.role !== targetUser.role) {
      const newRole = updateData.role;
      const allowedRoles = ['member', 'trainer', 'manager', 'admin'];

      if (!actingRole) {
        throw new Error('غير مصرح: لا يوجد دور للطلب.');
      }

      if (String(userId) === String(actingUserId)) {
        throw new Error('غير مصرح: لا يمكنك تغيير دورك بنفسك.');
      }

      if (!allowedRoles.includes(newRole)) {
        throw new Error('دور غير صالح.');
      }

      if (actingRole === 'manager') {
        const managerAllowedTargets = ['member', 'trainer'];
        if (!managerAllowedTargets.includes(newRole)) {
          throw new Error('صلاحيات المدير تسمح فقط بتعيين الدور إلى عضو أو مدرب.');
        }
      }
    }

    if ('barcode' in updateData) {
      updateData.barcode =
        updateData.barcode == null
          ? null
          : String(updateData.barcode).trim();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  };

export const changeUserPasswordService = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('الرجاء توفير كلمة المرور الحالية والجديدة.');
  }

  const user = await getUserByIdService(userId);

  if (!user) {
    throw new Error('المستخدم غير موجود.');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('كلمة المرور الحالية غير صحيحة.');
  }

  user.passwordHash = newPassword; 
  await user.save();

  return { message: 'تم تحديث كلمة المرور بنجاح.' };
};

export const deleteUserByIdService = async (userId) => {
  // Soft delete: mark as deleted
  const user = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const deleteUserByIdHardService = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

