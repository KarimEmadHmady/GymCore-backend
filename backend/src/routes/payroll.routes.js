import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import { createPayroll, getPayrolls, getPayrollById, updatePayroll, deletePayroll } from "../controllers/payroll.controller.js";
import { getPayrollSummaryService } from "../services/payroll.service.js";
import { validateCreatePayroll, validateListPayroll } from "../validators/payroll.validator.js";
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// منع الكاش لكل مسارات الرواتب
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('ETag', Date.now().toString());
  next();
});

router.post('/', authenticate, authorizeRole(['admin','accountant']), validateCreatePayroll, createPayroll);
router.get('/', authenticate, authorizeRole(['admin','accountant']), validateListPayroll, getPayrolls);
router.get('/summary', authenticate, authorizeRole(['admin','accountant']), async (req, res) => {
  try {
    const summary = await getPayrollSummaryService({ ...req.query });
    res.status(200).json(summary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.get('/:id', authenticate, authorizeRole(['admin','accountant']), getPayrollById);
router.put('/:id', authenticate, authorizeRole(['admin','accountant']), updatePayroll);
router.delete('/:id', authenticate, authorizeRole(['admin','accountant']), deletePayroll);

export default router;


