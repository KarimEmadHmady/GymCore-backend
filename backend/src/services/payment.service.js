import Payment from '../models/userMangment/Payment.model.js';
import Invoice from '../models/FinancialManagement/Invoice.js';
import Revenue from '../models/FinancialManagement/Revenue.js';
import { addPointsFromPayment } from './loyaltyPoints.service.js';

// ➕ إنشاء دفعة جديدة
export const createPaymentService = async (data) => {
  const { userId, amount, date, method, notes, invoiceId, appliedAmount, clientUuid } = data;
  if (!userId || !amount || !date) {
    throw new Error('userId, amount, and date are required');
  }

  // Idempotency by clientUuid from frontend to avoid duplicates when syncing
  if (clientUuid) {
    const existing = await Payment.findOne({ clientUuid });
    if (existing) {
      return existing;
    }
  }

  // إذا تم تمرير invoiceId، نتحقق من الفاتورة ونحسب التسوية الجزئية
  let invoice = null;
  let applied = 0;
  if (invoiceId) {
    invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    if (String(invoice.userId) !== String(userId)) throw new Error('Invoice does not belong to this user');

    const remaining = Math.max(invoice.amount - (invoice.paidAmount || 0), 0);
    applied = typeof appliedAmount === 'number' ? appliedAmount : Math.min(amount, remaining);
    if (applied < 0) applied = 0;
    if (applied > amount) applied = amount;
    if (applied > remaining) applied = remaining;
  }

  const allowed = { userId, amount, date, method, notes, invoiceId, appliedAmount: applied || undefined, clientUuid };

  // إنشاء الدفعة
  const payment = await Payment.create(allowed);

  // إذا توجد فاتورة، حدث paidAmount وحالة الفاتورة، وأنشئ إيراد مرتبط بالفاتورة للجزء المطبق
  if (invoice) {
    const newPaid = (invoice.paidAmount || 0) + (applied || 0);
    const status = newPaid >= invoice.amount ? 'paid' : invoice.status;
    await Invoice.findByIdAndUpdate(invoice._id, { $set: { paidAmount: newPaid, status } });

    if (applied && applied > 0) {
      try {
        await Revenue.create({
          amount: applied,
          date: new Date(date),
          paymentMethod: method || 'cash',
          sourceType: 'invoice',
          userId,
          notes: `Payment applied to invoice ${invoice.invoiceNumber}`,
        });
      } catch (e) {
        // لا نفشل العملية بسبب الإيراد
      }
    }
  } else {
    // دفعة ليست مرتبطة بفاتورة: إنشاء إيراد كمصدر اشتراك بشكل افتراضي
    try {
      await Revenue.create({
        amount,
        date: new Date(date),
        paymentMethod: method || 'cash',
        sourceType: 'subscription',
        userId,
        notes: notes || 'Subscription payment',
      });
    } catch (e) {}
  }

  // إضافة نقاط الولاء تلقائياً
  try {
    const paymentType = notes || 'دفع اشتراك';
    await addPointsFromPayment(userId, amount, paymentType);
  } catch (error) {
    console.error('خطأ في إضافة نقاط الولاء:', error.message);
  }

  return payment;
};

// 📄 جلب جميع الدفعات لمستخدم معين
export const getPaymentsByUserService = async (userId) => {
  return await Payment.find({ userId }).sort({ date: -1 });
};

// جلب جميع الدفعات
export const getAllpaymentsService = async () => {
  return await Payment.find().sort({date: -1});   
};

// ✏️ تعديل دفعة
export const updatePaymentService = async (id, data) => {
  const payment = await Payment.findByIdAndUpdate(id, data, { new: true });
  if (!payment) throw new Error('لم يتم العثور على الدفعة');
  return payment;
};

// 🗑️ حذف دفعة
export const deletePaymentService = async (id) => {
  const payment = await Payment.findByIdAndDelete(id);
  if (!payment) throw new Error('لم يتم العثور على الدفعة');
  return payment;
};
