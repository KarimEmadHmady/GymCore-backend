import {
    createFeedbackService,
    getFeedbackForUserService,
    updateFeedbackService,
    deleteFeedbackService,
    getAllFeedbackService
  } from '../services/feedback.service.js';
  
  // إنشاء تقييم جديد
  export const createFeedback = async (req, res) => {
    try {
      const feedback = await createFeedbackService(req.body);
      res.status(201).json(feedback);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // جلب التقييمات لمستخدم معين
  export const getFeedbackForUser = async (req, res) => {
    try {
      const feedbacks = await getFeedbackForUserService(req.params.userId);
      res.status(200).json(feedbacks);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
  
  // تعديل تقييم
  export const updateFeedback = async (req, res) => {
    try {
      const feedback = await updateFeedbackService(req.params.id, req.body);
      res.status(200).json(feedback);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // حذف تقييم
  export const deleteFeedback = async (req, res) => {
    try {
      await deleteFeedbackService(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // جلب جميع التقييمات
  export const getAllFeedback = async (req, res) => {
    try {
      const feedbacks = await getAllFeedbackService();
      res.status(200).json(feedbacks);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  