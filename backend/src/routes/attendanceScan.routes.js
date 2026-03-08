import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import {
  scanBarcode,
  getUserAttendanceStatsController,
  getTodayAttendanceSummaryController,
  getAttendanceRecords
} from '../controllers/attendanceScan.controller.js';

const router = express.Router();

// Scan barcode and record attendance
router.post('/scan', authenticate, authorizeRole(['admin', 'manager', 'trainer']), scanBarcode);

// Get user attendance statistics
router.get('/stats/:userId', authenticate, getUserAttendanceStatsController);

// Get today's attendance summary
router.get('/summary/today', authenticate, authorizeRole(['admin', 'manager', 'trainer']), getTodayAttendanceSummaryController);

// Get attendance records with pagination
router.get('/records', authenticate, authorizeRole(['admin', 'manager', 'trainer']), getAttendanceRecords);

export default router;

