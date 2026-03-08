import {
    createClientProgressService,
    getClientProgressByUserService,
    updateClientProgressService,
    deleteClientProgressService,
    getAllClientProgressService,
    getClientProgressByTrainerService,
    getClientProgressByIdService
  } from '../services/clientProgress.service.js';
import cloudinary from '../config/cloudinary.js';
  
  // إنشاء سجل تقدم جديد
  export const createClientProgress = async (req, res) => {
    try {
      console.log('=== CREATE PROGRESS REQUEST ===');
      console.log('Request method:', req.method);
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      console.log('Request files:', req.files);
      
      let imageData = null;
      
      // إذا تم رفع صورة، استخدم البيانات من multer-storage-cloudinary
      if (req.file) {
        console.log('Processing image upload...');
        console.log('File object:', req.file);
        
        // مع multer-storage-cloudinary، البيانات تأتي مباشرة في req.file
        imageData = {
          url: req.file.path, // هذا هو URL الصورة في Cloudinary
          publicId: req.file.filename // هذا هو public_id
        };
        console.log('Image uploaded successfully:', imageData);
      }
      
      const progressData = {
        ...req.body,
        image: imageData
      };
      
      console.log('Final progress data:', progressData);
      
      const progress = await createClientProgressService(progressData);
      console.log('Progress created successfully:', progress);
      res.status(201).json(progress);
    } catch (err) {
      console.error('Error creating progress:', err);
      res.status(400).json({ message: err.message });
    }
  };
  
  // جلب كل السجلات لمستخدم
  export const getClientProgressByUser = async (req, res) => {
    try {
      const progress = await getClientProgressByUserService(req.params.userId);
      res.status(200).json(progress);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
  
  // جلب كل سجلات التقدم
  export const getAllClientProgress = async (req, res) => {
    try {
      const progress = await getAllClientProgressService();
      res.status(200).json(progress);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // جلب كل السجلات لمدرب
  export const getClientProgressByTrainer = async (req, res) => {
    try {
      const progress = await getClientProgressByTrainerService(req.params.trainerId);
      res.status(200).json(progress);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
  
  // تعديل سجل تقدم
  export const updateClientProgress = async (req, res) => {
    try {
      let imageData = null;
      
      // إذا تم رفع صورة جديدة، احفظها في Cloudinary
      if (req.file) {
        // احذف الصورة القديمة إذا كانت موجودة
        if (req.body.oldImagePublicId) {
          try {
            await cloudinary.uploader.destroy(req.body.oldImagePublicId);
          } catch (deleteErr) {
            console.log('Error deleting old image:', deleteErr.message);
          }
        }
        
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'client-progress',
          resource_type: 'image'
        });
        
        imageData = {
          url: result.secure_url,
          publicId: result.public_id
        };
      }
      
      const updateData = {
        ...req.body,
        image: imageData
      };
      
      // احذف الحقول التي لا يجب أن تكون في البيانات المحدثة
      delete updateData.oldImagePublicId;
      
      const progress = await updateClientProgressService(req.params.id, updateData);
      res.status(200).json(progress);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // حذف سجل تقدم
  export const deleteClientProgress = async (req, res) => {
    try {
      // احصل على بيانات السجل أولاً لحذف الصورة
      const progress = await getClientProgressByIdService(req.params.id);
      
      // احذف الصورة من Cloudinary إذا كانت موجودة
      if (progress && progress.image && progress.image.publicId) {
        try {
          await cloudinary.uploader.destroy(progress.image.publicId);
        } catch (deleteErr) {
          console.log('Error deleting image from Cloudinary:', deleteErr.message);
        }
      }
      
      await deleteClientProgressService(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  