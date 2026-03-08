import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import { createRevenue, getRevenues, getRevenueById, updateRevenue, deleteRevenue, getRevenueSummary } from "../controllers/revenue.controller.js";
import { validateCreateRevenue, validateListRevenue } from "../validators/revenue.validator.js";
import { authorizeRole } from '../middlewares/role.middleware.js';


const router = express.Router();

router.post('/', authenticate,  authorizeRole(['admin','manager','accountant']), validateCreateRevenue, createRevenue);
router.get('/', authenticate, authorizeRole(['admin','accountant']), validateListRevenue, getRevenues);
router.get('/summary', authenticate, authorizeRole(['admin','accountant']), validateListRevenue, getRevenueSummary);
router.get('/:id', authenticate, authorizeRole(['admin','accountant']), getRevenueById);
router.put('/:id', authenticate, authorizeRole(['admin','accountant']), updateRevenue);
router.delete('/:id', authenticate, authorizeRole(['admin','accountant']), deleteRevenue);

export default router;


