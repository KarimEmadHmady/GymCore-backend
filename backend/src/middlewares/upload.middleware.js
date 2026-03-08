import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure storage to upload directly to Cloudinary with your requested options
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'users/avatars',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        // transformation: [{ width: 500, height: 500, crop: 'limit' }]
    })
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Invalid file type. Only jpg, jpeg, png, webp are allowed.');
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    }
});

// رفع صور تمارين الخطط
export const uploadExerciseImage = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => ({
            folder: 'workouts/exercises',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
        })
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Invalid file type. Only jpg, jpeg, png, webp are allowed.');
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    }
});

// رفع صور تقدم العملاء
export const uploadProgressImage = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => ({
            folder: 'client-progress',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
        })
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Invalid file type. Only jpg, jpeg, png, webp are allowed.');
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    }
});

export const uploadGymSettingsImage = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: 'gym-settings',
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
    })
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Invalid file type. Only jpg, jpeg, png, webp are allowed.');
      error.status = 400;
      return cb(error);
    }
    cb(null, true);
  }
});

// رفع صور المصروفات
export const uploadExpenseImage = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => ({
            folder: 'expenses',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
        })
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Invalid file type. Only jpg, jpeg, png, webp are allowed.');
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    }
});

export default upload;


