import Expense from "../models/FinancialManagement/Expense.js";
import { cacheManager } from '../utils/cache.util.js';

const parseDateRange = (from, to) => {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    if (!to.includes("T")) end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return Object.keys(range).length ? range : undefined;
};

export const createExpenseService = async (data) => {
  const allowed = {
    amount: data.amount,
    date: data.date,
    category: data.category,
    paidTo: data.paidTo,
    notes: data.notes,
    imageUrl: data.imageUrl
  };
  return await Expense.create(allowed);
};

export const getExpensesService = async (filters) => {
  const { category, minAmount, maxAmount, from, to, sort = "desc", limit = 50, skip = 0 } = filters;

  const q = {};
  const dateRange = parseDateRange(from, to);
  if (category) q.category = category;
  if (dateRange) q.date = dateRange;
  if (minAmount || maxAmount) {
    q.amount = {};
    if (minAmount) q.amount.$gte = Number(minAmount);
    if (maxAmount) q.amount.$lte = Number(maxAmount);
  }

  const rows = await Expense.find(q)
    .sort({ date: sort === "asc" ? 1 : -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .lean();
  const count = await Expense.countDocuments(q);
  return { count, results: rows };
};

export const getExpenseByIdService = async (id) => {
  return await Expense.findById(id);
};

export const updateExpenseService = async (id, data) => {
  return await Expense.findByIdAndUpdate(id, data, { new: true });
};

export const deleteExpenseService = async (id) => {
  return await Expense.findByIdAndDelete(id);
};

export const getExpenseSummaryService = async (filters) => {
  const { from, to, category, sort = "asc" } = filters;

  // ✅ Create cache key based on filters
  const cacheKey = `expense:summary:${from || 'all'}:${to || 'all'}:${category || 'all'}:${sort}`;

  const cached = cacheManager.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit for expense summary - ${cacheKey}`);
    return cached;
  }

  console.log(`❌ Cache miss - calculating expense summary`);

  const match = {};
  const dateRange = parseDateRange(from, to);
  if (dateRange) match.date = dateRange;
  if (category) match.category = category;

  const [monthly, totalDoc] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, total: { $sum: "$amount" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Expense.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const formatted = monthly
    .map((m) => ({ year: m._id.year, month: m._id.month, expense: m.total }))
    .sort((a, b) => {
      if (a.year !== b.year) return (a.year - b.year) * (sort === "asc" ? 1 : -1);
      return (a.month - b.month) * (sort === "asc" ? 1 : -1);
    });

  const result = {
    range: { from: from || null, to: to || null },
    totals: { expense: totalDoc[0]?.total || 0 },
    monthly: formatted,
  };

  // ✅ Cache for 10 minutes (financial summaries don't change every minute)
  cacheManager.set(cacheKey, result, 10 * 60 * 1000);

  return result;
};


