import {
  createExpenseService,
  getExpensesService,
  getExpenseByIdService,
  updateExpenseService,
  deleteExpenseService,
  getExpenseSummaryService,
} from "../services/expense.service.js";

export const createExpense = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file && req.file.path) {
      data.imageUrl = req.file.path;
    }
    const doc = await createExpenseService(data);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const data = await getExpensesService({ ...req.query });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const doc = await getExpenseByIdService(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file && req.file.path) {
      update.imageUrl = req.file.path;
    }
    const doc = await updateExpenseService(req.params.id, update);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const doc = await deleteExpenseService(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const summary = await getExpenseSummaryService({ ...req.query });
    res.status(200).json(summary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


