import {
    createMessageService,
    getMessagesForUserService,
    updateMessageStatusService,
    updateMessageService,
    deleteMessageService,
    getAllMessagesService,
    markMessageAsReadService
  } from '../services/message.service.js';
  
  // إنشاء رسالة جديدة
  export const createMessage = async (req, res) => {
    try {
      const message = await createMessageService(req.body);
      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // جلب الرسائل لمستخدم معين
  export const getMessagesForUser = async (req, res) => {
    try {
      const messages = await getMessagesForUserService(req.params.userId);
      res.status(200).json(messages);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
  
  // تحديث حالة قراءة الرسالة
  export const updateMessageStatus = async (req, res) => {
    try {
      const message = await updateMessageStatusService(req.params.id, req.body.read);
      res.status(200).json(message);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // تحديث محتوى الرسالة
  export const updateMessage = async (req, res) => {
    try {
      const message = await updateMessageService(req.params.id, req.body);
      res.status(200).json(message);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // حذف رسالة
  export const deleteMessage = async (req, res) => {
    try {
      await deleteMessageService(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // جلب جميع الرسائل
  export const getAllMessages = async (req, res) => {
    try {
      const messages = await getAllMessagesService();
      res.status(200).json(messages);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // تحديد الرسالة كمقروءة
  export const markMessageAsRead = async (req, res) => {
    try {
      const message = await markMessageAsReadService(req.params.id);
      res.status(200).json({ 
        message: 'Message marked as read successfully',
        data: message 
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  