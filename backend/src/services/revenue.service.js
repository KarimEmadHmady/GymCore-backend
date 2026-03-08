import Revenue from "../models/FinancialManagement/Revenue.js";
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

export const createRevenueService = async (data) => {
  const allowed = {
    amount: data.amount,
    date: data.date,
    paymentMethod: data.paymentMethod,
    sourceType: data.sourceType,
    userId: data.userId,
    notes: data.notes,
  };
  return await Revenue.create(allowed);
};

export const getRevenuesService = async (filters) => {
  const {
    userId,
    sourceType,
    paymentMethod,
    minAmount,
    maxAmount,
    from,
    to,
    sort = "desc",
    limit = 50,
    skip = 0,
  } = filters;

  const q = {};
  const dateRange = parseDateRange(from, to);
  if (userId) q.userId = userId;
  if (sourceType) q.sourceType = sourceType;
  if (paymentMethod) q.paymentMethod = paymentMethod;
  if (dateRange) q.date = dateRange;
  if (minAmount || maxAmount) {
    q.amount = {};
    if (minAmount) q.amount.$gte = Number(minAmount);
    if (maxAmount) q.amount.$lte = Number(maxAmount);
  }

  const rows = await Revenue.find(q)
    .sort({ date: sort === "asc" ? 1 : -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .lean();
  const count = await Revenue.countDocuments(q);
  return { count, results: rows };
};

export const getRevenueByIdService = async (id) => {
  return await Revenue.findById(id);
};

export const updateRevenueService = async (id, data) => {
  return await Revenue.findByIdAndUpdate(id, data, { new: true });
};

export const deleteRevenueService = async (id) => {
  return await Revenue.findByIdAndDelete(id);
};

export const getRevenueSummaryService = async (filters) => {
  const { from, to, userId, sourceType, paymentMethod, sort = "asc" } = filters;

  // ✅ Create cache key based on filters
  const cacheKey = `revenue:summary:${from || 'all'}:${to || 'all'}:${userId || 'all'}:${sourceType || 'all'}:${paymentMethod || 'all'}:${sort}`;

  const cached = cacheManager.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit for revenue summary - ${cacheKey}`);
    return cached;
  }

  console.log(`❌ Cache miss - calculating revenue summary`);

  const match = {};
  const dateRange = parseDateRange(from, to);
  if (dateRange) match.date = dateRange;
  if (userId) match.userId = userId;
  if (sourceType) match.sourceType = sourceType;
  if (paymentMethod) match.paymentMethod = paymentMethod;

  const [monthly, totalDoc] = await Promise.all([
    Revenue.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Revenue.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const formatted = monthly
    .map((m) => ({ year: m._id.year, month: m._id.month, revenue: m.total }))
    .sort((a, b) => {
      if (a.year !== b.year) return (a.year - b.year) * (sort === "asc" ? 1 : -1);
      return (a.month - b.month) * (sort === "asc" ? 1 : -1);
    });

  const result = {
    range: { from: from || null, to: to || null },
    totals: { revenue: totalDoc[0]?.total || 0 },
    monthly: formatted,
  };

  // ✅ Cache for 10 minutes (financial summaries don't change every minute)
  cacheManager.set(cacheKey, result, 10 * 60 * 1000);

  return result;
};


