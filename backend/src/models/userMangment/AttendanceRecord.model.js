// 📄 attendanceRecord.model.js

import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    date: { type: Date, required: true }, 
    status: { type: String, enum: ["present", "absent", "excused"], default: "present" }, 
    notes: { type: String, default: "" }, 
    clientUuid: { type: String, unique: true, sparse: true },
  },
  { timestamps: true } 
);

attendanceRecordSchema.index({ clientUuid: 1 }, { unique: true, sparse: true });
attendanceRecordSchema.index({ userId: 1, date: -1 }); 

const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema);
export default AttendanceRecord;
