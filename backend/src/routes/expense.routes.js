import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseSummary } from "../controllers/expense.controller.js";
import { validateCreateExpense, validateListExpense } from "../validators/expense.validator.js";
import { authorizeRole } from '../middlewares/role.middleware.js';
import { uploadExpenseImage } from '../middlewares/upload.middleware.js';


const router = express.Router();

router.post('/', authenticate, authorizeRole(['admin','manager','accountant']), uploadExpenseImage.single('image'), validateCreateExpense, createExpense);
router.get('/', authenticate, authorizeRole(['admin','accountant']), validateListExpense, getExpenses);
router.get('/summary', authenticate, authorizeRole(['admin','accountant']), validateListExpense, getExpenseSummary);
router.get('/:id', authenticate, authorizeRole(['admin','accountant']), getExpenseById);
router.put('/:id', authenticate, authorizeRole(['admin','accountant']), uploadExpenseImage.single('image'), updateExpense);
router.delete('/:id', authenticate, authorizeRole(['admin','accountant']), deleteExpense);

export default router;


