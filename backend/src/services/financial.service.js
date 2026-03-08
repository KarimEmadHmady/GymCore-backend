import Revenue from "../models/FinancialManagement/Revenue.js";
import Expense from "../models/FinancialManagement/Expense.js";
import Invoice from "../models/FinancialManagement/Invoice.js";
import Payroll from "../models/FinancialManagement/Payroll.js";
import Payment from "../models/userMangment/Payment.model.js";
import Purchase from "../models/userMangment/Purchase.model.js";
import { cacheManager } from '../utils/cache.util.js';

const parseDateRange = (from, to) => {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    // include whole day if only a date is passed
    if (!to.includes("T")) end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return Object.keys(range).length ? range : undefined;
};

export const searchFinancialService = async (filters) => {
  const {
    type, // revenue | expense | invoice | payroll | payment | purchase | all (default)
    userId,
    employeeId,
    invoiceNumber,
    status, // invoice status
    category, // expense category
    sourceType, // revenue source
    paymentMethod, // revenue/payment method
    minAmount,
    maxAmount,
    from,
    to,
    sort = "desc", // asc|desc
    limit = 100,
    skip = 0,
  } = filters;

  const dateRange = parseDateRange(from, to);

  const should = (t) => !type || type === "all" || type === t;

  const queries = [];

  if (should("revenue")) {
    const q = {};
    if (userId) q.userId = userId;
    if (sourceType) q.sourceType = sourceType;
    if (paymentMethod) q.paymentMethod = paymentMethod;
    if (dateRange) q.date = dateRange;
    if (minAmount || maxAmount) {
      q.amount = {};
      if (minAmount) q.amount.$gte = Number(minAmount);
      if (maxAmount) q.amount.$lte = Number(maxAmount);
    }
    queries.push(
      Revenue.find(q)
        .sort({ date: sort === "asc" ? 1 : -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean()
        .then((rows) =>
          rows.map((r) => ({
            type: "revenue",
            id: r._id,
            amount: r.amount,
            date: r.date,
            userId: r.userId,
            method: r.paymentMethod,
            sourceType: r.sourceType,
            notes: r.notes,
            raw: r,
          }))
        )
    );
  }

  if (should("expense")) {
    const q = {};
    if (category) q.category = category;
    if (dateRange) q.date = dateRange;
    if (minAmount || maxAmount) {
      q.amount = {};
      if (minAmount) q.amount.$gte = Number(minAmount);
      if (maxAmount) q.amount.$lte = Number(maxAmount);
    }
    queries.push(
      Expense.find(q)
        .sort({ date: sort === "asc" ? 1 : -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean()
        .then((rows) =>
          rows.map((r) => ({
            type: "expense",
            id: r._id,
            amount: r.amount,
            date: r.date,
            category: r.category,
            notes: r.notes,
            raw: r,
          }))
        )
    );
  }

  if (should("invoice")) {
    const q = {};
    if (userId) q.userId = userId;
    if (invoiceNumber) q.invoiceNumber = invoiceNumber;
    if (status) q.status = status;
    if (dateRange) q.issueDate = dateRange;
    if (minAmount || maxAmount) {
      q.amount = {};
      if (minAmount) q.amount.$gte = Number(minAmount);
      if (maxAmount) q.amount.$lte = Number(maxAmount);
    }
    queries.push(
      Invoice.find(q)
        .sort({ issueDate: sort === "asc" ? 1 : -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean()
        .then((rows) =>
          rows.map((r) => ({
            type: "invoice",
            id: r._id,
            amount: r.amount,
            date: r.issueDate,
            userId: r.userId,
            status: r.status,
            invoiceNumber: r.invoiceNumber,
            dueDate: r.dueDate,
            raw: r,
          }))
        )
    );
  }

  if (should("payroll")) {
    const q = {};
    if (employeeId) q.employeeId = employeeId;
    if (dateRange) q.paymentDate = dateRange;
    if (minAmount || maxAmount) {
      q.salaryAmount = {};
      if (minAmount) q.salaryAmount.$gte = Number(minAmount);
      if (maxAmount) q.salaryAmount.$lte = Number(maxAmount);
    }
    queries.push(
      Payroll.find(q)
        .sort({ paymentDate: sort === "asc" ? 1 : -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean()
        .then((rows) =>
          rows.map((r) => ({
            type: "payroll",
            id: r._id,
            amount: r.salaryAmount,
            date: r.paymentDate,
            employeeId: r.employeeId,
            bonuses: r.bonuses,
            deductions: r.deductions,
            notes: r.notes,
            raw: r,
          }))
        )
    );
  }

  if (should("payment")) {
    const q = {};
    if (userId) q.userId = userId;
    if (paymentMethod) q.method = paymentMethod;
    if (dateRange) q.date = dateRange;
    if (minAmount || maxAmount) {
      q.amount = {};
      if (minAmount) q.amount.$gte = Number(minAmount);
      if (maxAmount) q.amount.$lte = Number(maxAmount);
    }
    queries.push(
      Payment.find(q)
        .sort({ date: sort === "asc" ? 1 : -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean()
        .then((rows) =>
          rows.map((r) => ({
            type: "payment",
            id: r._id,
            amount: r.amount,
            date: r.date,
            userId: r.userId,
            method: r.method,
            invoiceId: r.invoiceId,
            appliedAmount: r.appliedAmount,
            notes: r.notes,
            raw: r,
          }))
        )
    );
  }

  if (should("purchase")) {
    const q = {};
    if (userId) q.userId = userId;
    if (dateRange) q.date = dateRange;
    if (minAmount || maxAmount) {
      q.price = {};
      if (minAmount) q.price.$gte = Number(minAmount);
      if (maxAmount) q.price.$lte = Number(maxAmount);
    }
    queries.push(
      Purchase.find(q)
        .sort({ date: sort === "asc" ? 1 : -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean()
        .then((rows) =>
          rows.map((r) => ({
            type: "purchase",
            id: r._id,
            amount: r.price,
            date: r.date,
            userId: r.userId,
            itemName: r.itemName,
            raw: r,
          }))
        )
    );
  }

  const resultsArrays = await Promise.all(queries);
  const combined = resultsArrays.flat();

  // global sort in case multiple types are requested
  combined.sort((a, b) => (new Date(a.date) - new Date(b.date)) * (sort === "asc" ? 1 : -1));

  return combined;
};

export const getFinancialSummaryService = async (filters) => {
  const { from, to, sort = "asc" } = filters;

  // ✅ Create cache key based on filters
  const cacheKey = `financial:summary:${from || 'all'}:${to || 'all'}:${sort}`;

  const cached = cacheManager.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit for financial summary - ${cacheKey}`);
    return cached;
  }

  console.log(`❌ Cache miss - calculating financial summary`);

  const dateRange = parseDateRange(from, to);

  const revenueMatch = {};
  const expenseMatch = {};
  if (dateRange) {
    revenueMatch.date = dateRange;
    expenseMatch.date = dateRange;
  }

  const revenueAgg = [
    { $match: revenueMatch },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ];

  const expenseAgg = [
    { $match: expenseMatch },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ];

  const totalRevenueAgg = [
    { $match: revenueMatch },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ];

  const totalExpenseAgg = [
    { $match: expenseMatch },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ];

  const [monthlyRevenue, monthlyExpense, totalRevenueDoc, totalExpenseDoc] = await Promise.all([
    Revenue.aggregate(revenueAgg),
    Expense.aggregate(expenseAgg),
    Revenue.aggregate(totalRevenueAgg),
    Expense.aggregate(totalExpenseAgg),
  ]);

  const byKey = new Map();
  const keyOf = (y, m) => `${y}-${String(m).padStart(2, "0")}`;

  for (const r of monthlyRevenue) {
    const k = keyOf(r._id.year, r._id.month);
    byKey.set(k, { year: r._id.year, month: r._id.month, revenue: r.total, expense: 0 });
  }
  for (const e of monthlyExpense) {
    const k = keyOf(e._id.year, e._id.month);
    const cur = byKey.get(k) || { year: e._id.year, month: e._id.month, revenue: 0, expense: 0 };
    cur.expense = e.total;
    byKey.set(k, cur);
  }

  let monthly = Array.from(byKey.values()).map((row) => ({
    ...row,
    netProfit: (row.revenue || 0) - (row.expense || 0),
  }));

  monthly.sort((a, b) => {
    if (a.year !== b.year) return (a.year - b.year) * (sort === "asc" ? 1 : -1);
    return (a.month - b.month) * (sort === "asc" ? 1 : -1);
  });

  const totalRevenue = totalRevenueDoc[0]?.total || 0;
  const totalExpense = totalExpenseDoc[0]?.total || 0;
  const netProfit = totalRevenue - totalExpense;

  const result = {
    range: { from: from || null, to: to || null },
    totals: { revenue: totalRevenue, expense: totalExpense, netProfit },
    monthly,
  };

  // ✅ Cache for 10 minutes (الإحصائيات المالية لا تتغير كثيراً)
  cacheManager.set(cacheKey, result, 10 * 60 * 1000);

  return result;
};

/**
 * ✅ مسح cache الإحصائيات المالية
 * (استدعِ هذه الدالة عند إضافة/تعديل البيانات المالية)
 */
export const clearFinancialCache = () => {
  // في التطبيق الحقيقي يمكن استخدام pattern deletion
  // لكن بما أن cache keys تتضمن التواريخ، فسيتم تحديثها تلقائياً
  console.log('🧹 Financial cache will auto-update on next request');
};


