// models/FinancialManagement/Counter.js

import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // sequence name, e.g. 'invoice'
    seq: { type: Number, default: 1000 }, // starting sequence
  },
  { timestamps: true }
);

export default mongoose.model("Counter", counterSchema);


