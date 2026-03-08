import { 
  getAllUsersService,
  getUserByIdService,
  updateUserRoleService,
  updateUserByIdService,
  deleteUserByIdService,
  deleteUserByIdHardService,
  getMyClientsService,
  changeUserPasswordService
 } from '../services/users.service.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService(req.query);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await getUserByIdService(userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const actingRole = req.user?.role;
    const actingUserId = req.user?.id || req.user?._id;

    const user = await updateUserRoleService(userId, role, actingRole, actingUserId);
    res.status(200).json({ message: 'User role updated successfully.', user });

  } catch (err) {
    if (err.message === 'Unauthorized' || err.message === 'لا يمكنك تغيير دورك بنفسك.' || err.message === 'لا يمكنك تعديل سوبر أدمن.' || err.message === 'Managers can only set role to member or trainer') {
        res.status(403).json({ message: err.message });
    } else if (err.message === 'Invalid role') {
        res.status(400).json({ message: err.message });
    } else if (err.message === 'User not found') {
        res.status(404).json({ message: err.message });
    }
    else {
        res.status(400).json({ message: err.message });
    }
  }
};


export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    const result = await changeUserPasswordService(userId, currentPassword, newPassword);

    res.status(200).json(result);
  } catch (err) {
    console.error('Error changing password:', err);
    console.error('Error stack:', err.stack);
    if (err.message === 'المستخدم غير موجود.') {
        res.status(404).json({ message: err.message });
    } else if (err.message === 'كلمة المرور الحالية غير صحيحة.') {
        res.status(401).json({ message: err.message });
    } else if (err.message === 'الرجاء توفير كلمة المرور الحالية والجديدة.') {
        res.status(400).json({ message: err.message });
    } else {
        res.status(500).json({ message: err.message || 'فشل تغيير كلمة المرور.' });
    }
  }
};

export const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const actingUserId = req.user?.id || req.user?._id;
    const actingRole = req.user?.role;
    const updateData = { ...req.body };
    const file = req.file;

    const user = await updateUserByIdService(userId, updateData, actingUserId, actingRole, file);

    res.status(200).json({ message: 'تم تحديث المستخدم بنجاح.', user });

  } catch (err) {
    if (err.message === 'المستخدم غير موجود أو محذوف.' || err.message === 'User not found') {
        res.status(404).json({ message: err.message });
    } else if (err.message.startsWith('غير مصرح') || err.message.startsWith('صلاحيات المدير')) {
        res.status(403).json({ message: err.message });
    } else if (err.message === 'لا توجد بيانات للتحديث ولا ملف مرفوع.' || err.message === 'دور غير صالح.') {
        res.status(400).json({ message: err.message });
    } else {
        res.status(400).json({ message: err.message });
    }
  }
};



export const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await deleteUserByIdService(userId);
    res.status(200).json({ message: 'User deleted successfully.', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUserByIdHard = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await deleteUserByIdHardService(userId);
    res.status(200).json({ message: 'User permanently deleted successfully.', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyClients = async (req, res) => {
  try {
    const trainerId = req.query.trainerId || req.user.id || req.user._id;
    const clients = await getMyClientsService(trainerId);
    res.status(200).json({ clients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};