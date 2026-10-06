import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export let isMongoConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reposense';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    logger.info("MongoDB Database Connected");
  } catch (error) {
    logger.warn(`MongoDB Connection Failed (${error.message}). Running in-memory / fallback data mode.`);
    isMongoConnected = false;
  }
}
