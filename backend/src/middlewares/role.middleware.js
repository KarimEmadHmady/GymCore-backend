export const authorizeRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
      next();
    };
  };

export const authorizeInvoiceAccess = (req, res, next) => {
  // إذا كان المستخدم admin أو manager، accountant يمكنه الوصول لجميع الفواتير
  if (req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'accountant' || req.user.role === 'super_admin') {
    return next();
  }
  
  // إذا كان المستخدم member، يمكنه الوصول لفواتيره فقط
  if (req.user.role === 'member') {
    const userId = req.user.id || req.user._id;
    
    // إذا كان هناك userId في query، تأكد أنه يطلب فواتيره فقط
    if (req.query.userId && req.query.userId !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only access your own invoices.' });
    }
    
    // إذا لم يكن هناك userId، أضف userId الخاص بالمستخدم
    if (!req.query.userId) {
      req.query.userId = userId;
    }
  }
  
  next();
};