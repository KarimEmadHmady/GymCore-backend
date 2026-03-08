import AttendanceRecord from '../models/userMangment/AttendanceRecord.model.js';
import { addAttendancePoints } from './loyaltyPoints.service.js';

export const createAttendanceRecordService = async (data) => {
  const { userId, date, status, notes, clientUuid } = data;
  if (!userId || !date) {
    throw new Error('userId and date are required');
  }
  if (clientUuid) {
    const existing = await AttendanceRecord.findOne({ clientUuid });
    if (existing) {
      return existing;
    }
  }
  const allowed = { userId, date, status, notes, clientUuid };
  
  const record = await AttendanceRecord.create(allowed);
  
  if (status === 'present') {
    try {
      const attendanceStreak = await calculateAttendanceStreak(userId);
      await addAttendancePoints(userId, attendanceStreak);
    } catch (error) {
      console.error('خطأ في إضافة نقاط الحضور:', error.message);
    }
  }
  
  return record;
};

const calculateAttendanceStreak = async (userId) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const recentRecords = await AttendanceRecord.find({
    userId,
    date: { $gte: yesterday },
    status: 'present'
  })
  .sort({ date: -1 })
  .lean();

  return recentRecords.length;
};

export const getAttendanceRecordsByUserService = async (userId) => {
  return await AttendanceRecord.find({ userId })
    .sort({ date: -1 })
    .lean();
};


export const getAllAttendanceRecordsService = async () => {
  return await AttendanceRecord.find()
    .sort({ date: -1 })
    .lean();
};

export const updateAttendanceRecordService = async (id, data) => {
  const record = await AttendanceRecord.findByIdAndUpdate(id, data, { new: true });
  if (!record) throw new Error('Attendance record not found');
  return record;
};

export const deleteAttendanceRecordService = async (id) => {
  const record = await AttendanceRecord.findByIdAndDelete(id);
  if (!record) throw new Error('Attendance record not found');
  return record;
};

export const getRecentAttendanceCountService = async () => {
  const oneAndHalfHoursAgo = new Date(Date.now() - (1.5 * 60 * 60 * 1000));
  
  const count = await AttendanceRecord.countDocuments({
    date: { $gte: oneAndHalfHoursAgo },
    status: 'present'
  });

  let crowdLevel;
  let crowdStatus;
  
  if (count <= 5) {
    crowdLevel = 'low';
    crowdStatus = 'غير مزدحم';
  } else if (count <= 10) {
    crowdLevel = 'light';
    crowdStatus = 'خفيف';
  } else if (count <= 15) {
    crowdLevel = 'moderate';
    crowdStatus = 'متوسط';
  } else if (count <= 20) {
    crowdLevel = 'busy';
    crowdStatus = 'مزدحم';
  } else {
    crowdLevel = 'very_busy';
    crowdStatus = 'مزدحم جداً';
  }

  return {
    count,
    crowdLevel,
    crowdStatus,
    timeRange: 'آخر ساعة ونصف',
    timestamp: new Date()
  };
};
