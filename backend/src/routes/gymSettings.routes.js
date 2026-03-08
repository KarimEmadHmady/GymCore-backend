import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import { getGymSettings, updateGymSettings } from '../controllers/gymSettings.controller.js';
import { uploadGymSettingsImage } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', authenticate, authorizeRole(['admin','manager' ,'super_admin']), getGymSettings);
router.put(
  '/',
  authenticate,
  authorizeRole(['admin','manager' ,'super_admin']),
  uploadGymSettingsImage.fields([
    { name: 'logoUrl', maxCount: 1 },
    { name: 'membershipCardBackgroundImage', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'patternImage', maxCount: 1 },
    { name: 'centerLogoUrl', maxCount: 1 },
  ]),
  updateGymSettings
);

export default router;
