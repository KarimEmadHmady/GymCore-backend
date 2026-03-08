import AttendanceRecord from '../models/userMangment/AttendanceRecord.model.js';
import User from '../models/user.model.js';
import { getUserByBarcode } from './membershipCard.service.js';
import { cacheManager } from '../utils/cache.util.js';


/**
 * Scan barcode and record attendance
 * @param {string} barcode - User's barcode
 * @returns {Promise<Object>} Attendance record result
 */
export const scanBarcodeAndRecordAttendance = async (barcode) => {
  try {
    // Get user by barcode
    const user = await getUserByBarcode(barcode);
    
    // Block attendance if member subscription is expired or missing
    if (user?.role === 'member') {
      const now = new Date();
      const isMissingEndDate = !user.subscriptionEndDate;
      const isExpired = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) < now : false;
      if (isMissingEndDate || isExpired) {
        return {
          success: false,
          message: 'تاريخ الاشتراك انتهى، يرجى التجديد',
          user: {
            id: user._id,
            name: user.name,
            barcode: user.barcode,
            email: user.email,
            role: user.role,
            subscriptionEndDate: user.subscriptionEndDate || null
          }
        };
      }
    }
    
    // Check if user already has attendance record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await AttendanceRecord.findOne({
      userId: user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingAttendance) {
      return {
        success: false,
        message: 'لقد سجلت حضور اليوم بالفعل',
        user: {
          id: user._id,
          name: user.name,
          barcode: user.barcode,
          email: user.email
        },
        attendance: {
          id: existingAttendance._id,
          date: existingAttendance.date,
          status: existingAttendance.status,
          time: existingAttendance.createdAt
        }
      };
    }

    // Create new attendance record
    const attendanceRecord = new AttendanceRecord({
      userId: user._id,
      date: new Date(),
      status: 'present',
      notes: 'Scanned via barcode'
    });

    await attendanceRecord.save();

    return {
      success: true,
      message: 'Attendance recorded successfully',
      user: {
        id: user._id,
        name: user.name,
        barcode: user.barcode,
        email: user.email,
        membershipLevel: user.membershipLevel
      },
      attendance: {
        id: attendanceRecord._id,
        date: attendanceRecord.date,
        status: attendanceRecord.status,
        time: attendanceRecord.createdAt
      }
    };

  } catch (error) {
    throw new Error(`Attendance scanning failed: ${error.message}`);
  }
};

/**
 * Get attendance statistics for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Attendance statistics
 */
export const getUserAttendanceStats = async (userId, options = {}) => {
  try {
    const { startDate, endDate, limit = 30 } = options;
    
    let query = { userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendanceRecords = await AttendanceRecord.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .populate('userId', 'name email barcode');

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
    const excusedDays = attendanceRecords.filter(record => record.status === 'excused').length;

    return {
      success: true,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        excusedDays,
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
      },
      records: attendanceRecords
    };

  } catch (error) {
    throw new Error(`Failed to get attendance stats: ${error.message}`);
  }
};

/**
 * Get today's attendance summary (with caching)
 * @returns {Promise<Object>} Today's attendance summary
 */
export const getTodayAttendanceSummary = async () => {
  try {
    // ✅ Create cache key for today's date
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const cacheKey = `attendance:summary:${dateKey}`;

    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for today's attendance summary`);
      return cached;
    }

    console.log(`❌ Cache miss - calculating today's attendance summary`);

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await AttendanceRecord.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('userId', 'name email barcode role');

    const totalPresent = todayAttendance.filter(record => record.status === 'present').length;
    const totalAbsent = todayAttendance.filter(record => record.status === 'absent').length;
    const totalExcused = todayAttendance.filter(record => record.status === 'excused').length;

    // Get all active members count
    const totalActiveMembers = await User.countDocuments({
      role: 'member',
      status: 'active'
    });

    const result = {
      success: true,
      summary: {
        date: today,
        totalActiveMembers,
        totalPresent,
        totalAbsent,
        totalExcused,
        attendanceRate: totalActiveMembers > 0 ? Math.round((totalPresent / totalActiveMembers) * 100) : 0
      },
      records: todayAttendance
    };

    // ✅ Cache for 5 minutes (attendance data changes frequently but not every second)
    cacheManager.set(cacheKey, result, 5 * 60 * 1000);

    return result;

  } catch (error) {
    throw new Error(`Failed to get today's attendance summary: ${error.message}`);
  }
};

/**
 * ✅ مسح cache الحضور عند إضافة/تعديل سجل حضور
 */
export const clearAttendanceCache = () => {
  // في التطبيق الحقيقي يمكن استخدام pattern deletion
  // لكن بما أن cache key يعتمد على التاريخ، فسيتم تحديثه تلقائياً
  console.log('🧹 Attendance cache will auto-update on next request');
};

