import {
  scanBarcodeAndRecordAttendance,
  getUserAttendanceStats,
  getTodayAttendanceSummary
} from '../services/attendanceScan.service.js';

/**
 * Scan barcode and record attendance
 */
export const scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    const result = await scanBarcodeAndRecordAttendance(barcode);
    
    const statusCode = result.success ? 200 : 409; // 409 for already recorded
    
    res.status(statusCode).json({
      success: result.success,
      message: result.message,
      data: {
        user: result.user,
        attendance: result.attendance
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user attendance statistics
 */
export const getUserAttendanceStatsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit } = req.query;
    
    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    if (limit) options.limit = parseInt(limit);
    
    const result = await getUserAttendanceStats(userId, options);
    
    res.status(200).json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get today's attendance summary
 */
export const getTodayAttendanceSummaryController = async (req, res) => {
  try {
    const result = await getTodayAttendanceSummary();
    
    res.status(200).json({
      success: true,
      message: 'Today\'s attendance summary retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get attendance records with pagination
 */
export const getAttendanceRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, startDate, endDate, status } = req.query;
    
    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const AttendanceRecord = (await import('../models/userMangment/AttendanceRecord.model.js')).default;
    
    const records = await AttendanceRecord.find(query)
      .populate('userId', 'name email barcode role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await AttendanceRecord.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        records,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          hasNext: skip + records.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

