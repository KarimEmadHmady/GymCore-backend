import {
    createAttendanceRecordService,
    getAttendanceRecordsByUserService,
    updateAttendanceRecordService,
    deleteAttendanceRecordService,
    getAllAttendanceRecordsService
  } from '../services/attendanceRecords.service.js';
  
  // إنشاء سجل حضور جديد
  export const createAttendanceRecord = async (req, res) => {
    try {
      const record = await createAttendanceRecordService(req.body);
      res.status(201).json(record);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // جلب سجلات حضور مستخدم
  export const getAttendanceRecordsByUser = async (req, res) => {
    try {
      const records = await getAttendanceRecordsByUserService(req.params.userId);
      res.status(200).json(records);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
  
  // تحديث سجل حضور
  export const updateAttendanceRecord = async (req, res) => {
    try {
      const record = await updateAttendanceRecordService(req.params.id, req.body);
      res.status(200).json(record);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // حذف سجل حضور
  export const deleteAttendanceRecord = async (req, res) => {
    try {
      await deleteAttendanceRecordService(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // جلب كل سجلات الحضور
  export const getAllAttendanceRecords = async (req, res) => {
    try {
      const records = await getAllAttendanceRecordsService();
      res.status(200).json(records);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  