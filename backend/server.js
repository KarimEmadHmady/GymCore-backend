// server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import compression from 'compression';

import connectDB from './src/config/index.js';
import errorHandler from './src/middlewares/error.middleware.js';
import { performanceMonitor } from './src/middlewares/performance.middleware.js';

// Routes
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/users.routes.js';
import attendanceRecordRoutes from './src/routes/attendanceRecords.route.js';
import paymentRoutes from './src/routes/payment.route.js';
import purchaseRoutes from './src/routes/purchase.routes.js';
import workoutPlanRoutes from './src/routes/workoutPlan.routes.js';
import dietPlanRoutes from './src/routes/dietPlan.route.js';
import messageRoutes from './src/routes/message.route.js';
import clientProgressRoutes from './src/routes/clientProgress.route.js';
import sessionScheduleRoutes from './src/routes/sessionSchedule.routes.js';
import feedbackRoutes from './src/routes/feedback.route.js';
import loyaltyPointsRoutes from './src/routes/loyaltyPoints.routes.js';
import financialRoutes from './src/routes/financial.routes.js';
import revenueRoutes from './src/routes/revenue.routes.js';
import expenseRoutes from './src/routes/expense.routes.js';
import invoiceRoutes from './src/routes/invoice.routes.js';
import payrollRoutes from './src/routes/payroll.routes.js';
import gymSettingsRoutes from './src/routes/gymSettings.routes.js';
import membershipCardRoutes from './src/routes/membershipCard.routes.js';
import attendanceScanRoutes from './src/routes/attendanceScan.routes.js';

// Load env
dotenv.config();

// Connect to MongoDB (singleton connection)
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// ================== Middleware ==================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-requested-with',
    'Content-Disposition',
  ],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
}));

// Logs (خفيف على Render)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware (after JSON parsing)
app.use(compression());

// Performance monitoring middleware
if (process.env.NODE_ENV === 'development') {
  app.use(performanceMonitor);
}


// ================== Routes ==================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRecordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/progress', clientProgressRoutes);
app.use('/api/schedules', sessionScheduleRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/loyalty-points', loyaltyPointsRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/finance/revenues', revenueRoutes);
app.use('/api/finance/expenses', expenseRoutes);
app.use('/api/finance/invoices', invoiceRoutes);
app.use('/api/finance/payrolls', payrollRoutes);
app.use('/api/gym-settings', gymSettingsRoutes);
app.use('/api/membership-cards', membershipCardRoutes);
app.use('/api/attendance-scan', attendanceScanRoutes);

// ================== Graceful Shutdown ==================
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected on app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB disconnection', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// ================== Error Handler ==================
app.use(errorHandler);

// ================== Health Check ==================
app.get('/', (req, res) => {
  res.send('Welcome to the Gym Management System!');
});

// ================== Start Server ==================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
