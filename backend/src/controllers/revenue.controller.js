import {
  createRevenueService,
  getRevenuesService,
  getRevenueByIdService,
  updateRevenueService,
  deleteRevenueService,
  getRevenueSummaryService,
} from "../services/revenue.service.js";

export const createRevenue = async (req, res) => {
  try {
    const doc = await createRevenueService(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getRevenues = async (req, res) => {
  try {
    const data = await getRevenuesService({ ...req.query });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getRevenueById = async (req, res) => {
  try {
    const doc = await getRevenueByIdService(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateRevenue = async (req, res) => {
  try {
    const doc = await updateRevenueService(req.params.id, req.body);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteRevenue = async (req, res) => {
  try {
    const doc = await deleteRevenueService(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getRevenueSummary = async (req, res) => {
  try {
    const summary = await getRevenueSummaryService({ ...req.query });
    res.status(200).json(summary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


