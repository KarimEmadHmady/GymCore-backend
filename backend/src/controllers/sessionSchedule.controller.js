import {
  createSessionScheduleService,
  getSessionSchedulesByUserService,
  updateSessionScheduleService,
  deleteSessionScheduleService,
  getAllSessionSchedulesService
} from "../services/sessionSchedule.service.js";

// إنشاء حصة جديدة
export const createSessionSchedule = async (req, res) => {
  try {
    const session = await createSessionScheduleService({
      ...req.body,
      userId: req.body.userId || req.params.userId,
      trainerId: req.body.trainerId
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب جميع الحصص لمستخدم (كعميل أو مدرب)
export const getSessionSchedulesByUser = async (req, res) => {
  try {
    const sessions = await getSessionSchedulesByUserService(req.params.userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب جميع الحصص
export const getAllSessionSchedules = async (req, res) => {
  try {
    const sessions = await getAllSessionSchedulesService();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعديل حصة
export const updateSessionSchedule = async (req, res) => {
  try {
    const updated = await updateSessionScheduleService(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "الحصة غير موجودة" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف حصة
export const deleteSessionSchedule = async (req, res) => {
  try {
    const deleted = await deleteSessionScheduleService(req.params.id);
    if (!deleted) return res.status(404).json({ message: "الحصة غير موجودة" });
    res.json({ message: "تم حذف الحصة بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
