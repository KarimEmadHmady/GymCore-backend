import express from 'express';
import upload from '../middlewares/upload.middleware.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';
import { 
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserById,
    deleteUserById,
    deleteUserByIdHard,
    getMyClients,
    changeUserPassword
 } from '../controllers/users.controller.js';

const router = express.Router();

router.get('/', authenticate,  authorizeRole(['admin','manager', 'trainer','accountant' , 'super_admin']), getAllUsers);
router.put('/role', authenticate, authorizeRole(['admin','manager','accountant' , 'super_admin']), updateUserRole);
router.get('/my-clients', authenticate, authorizeRole(['admin','manager', 'trainer','accountant' , 'super_admin']), getMyClients);
router.get('/:id', authenticate, getUserById);

router.put('/:id', authenticate, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('MULTER UPLOAD ERROR:', {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.status,
        stack: err.stack,
      });
      console.error('MULTER UPLOAD ERROR RAW:', err);
      return next(err);
    }
    console.log('MULTER UPLOAD OK:', {
      filePresent: !!req.file,
      fieldname: req.file?.fieldname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
    });
    next();
  });
}, updateUserById);
router.put('/:id/change-password', authenticate, changeUserPassword);

router.delete('/:id', authenticate,  authorizeRole(['admin','manager','accountant' , 'super_admin']), deleteUserById);
router.delete('/:id/hard', authenticate, authorizeAdmin, deleteUserByIdHard);

export default router;
