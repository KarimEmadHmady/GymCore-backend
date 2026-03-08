const errorHandler = (err, req, res, next) => {
  
    const statusCode = err.status || 500; // إذا لم يتم تحديد حالة، افترض أنها 500
    const message = err.message || 'Something went wrong.';
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack, // إخفاء التفاصيل في بيئة الإنتاج
    });
  };
  
  export default errorHandler;