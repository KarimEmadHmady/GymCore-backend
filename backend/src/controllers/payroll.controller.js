import {
  createPayrollService,
  getPayrollsService,
  getPayrollByIdService,
  updatePayrollService,
  deletePayrollService,
} from "../services/payroll.service.js";

export const createPayroll = async (req, res) => {
  try {
    const doc = await createPayrollService(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPayrolls = async (req, res) => {
  try {
    const data = await getPayrollsService({ ...req.query });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPayrollById = async (req, res) => {
  try {
    const doc = await getPayrollByIdService(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePayroll = async (req, res) => {
  try {
    const doc = await updatePayrollService(req.params.id, req.body);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    const doc = await deletePayrollService(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


