import Invoice from "../models/FinancialManagement/Invoice.js";
import Counter from "../models/FinancialManagement/Counter.js";
import Revenue from "../models/FinancialManagement/Revenue.js";
import { cacheManager } from "../utils/cache.util.js";

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

// Helper function to clear invoice-related cache
const clearInvoiceCache = () => {
  // Clear all cache keys that start with 'invoice_summary_'
  cacheManager.clearByPattern(/^invoice_summary_/);
};

export const createInvoiceService = async (data) => {
  // Auto-generate invoice number if not provided
  let invoiceNumber = data.invoiceNumber;
  if (!invoiceNumber) {
    // Atomically increment a counter document for invoices
    const counter = await Counter.findByIdAndUpdate(
      "invoice",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const nextSeq = counter.seq;
    // Format e.g. INV-1001; customize as needed
    invoiceNumber = `INV-${String(nextSeq).padStart(4, "0")}`;
  }

  const allowed = {
    invoiceNumber,
    userId: data.userId,
    amount: data.amount,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    status: data.status,
    items: data.items,
    notes: data.notes,
    paidAmount: typeof data.paidAmount === 'number' ? data.paidAmount : undefined,
  };

  const result = await Invoice.create(allowed);

  // Clear cache after creating invoice
  clearInvoiceCache();

  return result;
};

export const getInvoicesService = async (filters) => {
  const { userId, invoiceNumber, status, minAmount, maxAmount, from, to, sort = "desc", limit = 50, skip = 0 } = filters;
  const q = {};
  const dateRange = parseDateRange(from, to);
  if (userId) q.userId = userId;
  if (invoiceNumber) {
    // دعم البحث الجزئي: يسمح بكتابة جزء من رقم الفاتورة (حتى لو أرقام فقط)
    const escaped = String(invoiceNumber).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    q.invoiceNumber = { $regex: escaped, $options: 'i' };
  }
  if (status) q.status = status;
  if (dateRange) q.issueDate = dateRange;
  if (minAmount || maxAmount) {
    q.amount = {};
    if (minAmount) q.amount.$gte = Number(minAmount);
    if (maxAmount) q.amount.$lte = Number(maxAmount);
  }

  const rows = await Invoice.find(q)
    .sort({ issueDate: sort === "asc" ? 1 : -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .lean();
  const count = await Invoice.countDocuments(q);
  return { count, results: rows };
};

export const getInvoiceByIdService = async (id) => {
  return await Invoice.findById(id);
};

export const updateInvoiceService = async (id, data) => {
  // fetch original to detect status change
  const original = await Invoice.findById(id);
  if (!original) return null;

  const updated = await Invoice.findByIdAndUpdate(id, data, { new: true });

  // create Revenue on transition to paid
  if (updated && data && data.status === "paid" && original.status !== "paid") {
    try {
      await Revenue.create({
        amount: updated.amount,
        date: new Date(),
        paymentMethod: "cash",
        sourceType: "invoice",
        userId: updated.userId,
        notes: `Auto revenue for invoice ${updated.invoiceNumber}`,
      });
    } catch (e) {
      // swallow to not break invoice flow; optionally log
      // console.error('Failed to create revenue for paid invoice', e);
    }
  }

  // Clear cache after updating invoice
  clearInvoiceCache();

  return updated;
};

export const getInvoiceSummaryService = async (filters) => {
  const { from, to, userId, status, sort = "asc" } = filters;

  // Create cache key based on filters
  const cacheKey = `invoice_summary_${from || 'null'}_${to || 'null'}_${userId || 'null'}_${status || 'null'}_${sort}`;

  // Check cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  const match = {};
  const dateRange = parseDateRange(from, to);
  if (dateRange) match.issueDate = dateRange;
  if (userId) match.userId = userId;
  if (status) match.status = status;

  const [monthly, totalDoc] = await Promise.all([
    Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: "$issueDate" }, month: { $month: "$issueDate" } },
          total: { $sum: "$amount" },
          paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] } },
          overdue: { $sum: { $cond: [{ $eq: ["$status", "overdue"] }, "$amount", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Invoice.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const formatted = monthly
    .map((m) => ({ year: m._id.year, month: m._id.month, total: m.total, paid: m.paid, pending: m.pending, overdue: m.overdue }))
    .sort((a, b) => {
      if (a.year !== b.year) return (a.year - b.year) * (sort === "asc" ? 1 : -1);
      return (a.month - b.month) * (sort === "asc" ? 1 : -1);
    });

  const result = {
    range: { from: from || null, to: to || null },
    totals: { amount: totalDoc[0]?.total || 0 },
    monthly: formatted,
  };

  // Cache the result for 10 minutes
  cacheManager.set(cacheKey, result, 10 * 60 * 1000);

  return result;
};

export const deleteInvoiceService = async (id) => {
  const result = await Invoice.findByIdAndDelete(id);

  // Clear cache after deleting invoice
  clearInvoiceCache();

  return result;
};


