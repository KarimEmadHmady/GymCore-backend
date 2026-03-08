import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // dbName: 'q-gym',
      // Connection pool settings for better performance
      maxPoolSize: 50, // Maximum number of sockets in the connection pool
      minPoolSize: 5,  // Minimum number of sockets in the connection pool
      maxIdleTimeMS: 30000, // How long a connection can be idle before being closed
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server before giving up
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out
    });

    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;