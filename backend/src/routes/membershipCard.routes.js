import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import {
  generateUserCard,
  generateBatchCardsController,
  generateAllMemberCardsController,
  getGeneratedCardsController,
  downloadCard,
  downloadCombinedCards,
  downloadCombinedCardsAll,
  generateDoubleSidedUserCard,
  generateSequentialCardsController
} from '../controllers/membershipCard.controller.js';

const router = express.Router();

// Generate cards for multiple users (place before :userId)
router.post('/generate/batch', (req, res, next) => {
  next();
}, authenticate, authorizeRole(['admin', 'manager' , 'super_admin']), generateBatchCardsController);

// Generate cards for all active members (place before :userId)
router.post('/generate/all', authenticate, authorizeRole(['admin', 'manager', 'super_admin']), generateAllMemberCardsController);

// Generate sequential cards
router.post('/generate/sequential', authenticate, authorizeRole(['admin', 'manager', 'super_admin']), generateSequentialCardsController);

// Generate single user card (keep after batch/all)
router.post('/generate/:userId', authenticate, authorizeRole(['admin', 'manager', 'super_admin']), generateUserCard);

// Generate double-sided user card
router.post('/generate-double/:userId', authenticate, authorizeRole(['admin', 'manager', 'super_admin']), generateDoubleSidedUserCard);

// Get list of generated cards
router.get('/list', authenticate, authorizeRole(['admin', 'manager', 'super_admin']), getGeneratedCardsController);

// Download specific card
router.get('/download/:fileName', authenticate, authorizeRole(['admin', 'manager', 'super_admin']), downloadCard);

// Generate and download combined PDF for selected users
router.post('/download/combined', authenticate, authorizeRole(['admin', 'manager', 'super_admin']), downloadCombinedCards);

// Generate and download combined PDF for all active members
router.post('/download/combined/all', authenticate, authorizeRole(['admin', 'manager', 'super_admin']), downloadCombinedCardsAll);

export default router;

