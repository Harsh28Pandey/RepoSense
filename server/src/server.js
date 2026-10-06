import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';
import { initRedis } from './config/redis.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/v1/index.js';

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.string().default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/reposense'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  JWT_ACCESS_SECRET: z.string().default('default_jwt_access_secret_32_bytes_long_123'),
  JWT_REFRESH_SECRET: z.string().default('default_jwt_refresh_secret_32_bytes_long_123'),
  COOKIE_SECRET: z.string().default('default_cookie_secret_key_32_bytes_long_123'),
  ENCRYPTION_KEY: z.string().default('0123456789abcdef0123456789abcdef'),
});

const envParseResult = envSchema.safeParse(process.env);
if (!envParseResult.success) {
  console.error('❌ Environment validation failed! Please refer to hello.txt in the project root for setup instructions.');
  console.error(envParseResult.error.format());
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB & Redis
connectDB();
initRedis();

// Security Hardening
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for demo markdown previews
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser(process.env.COOKIE_SECRET || 'reposense_cookie_secret_2026'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' } }
});
app.use('/api/', limiter);

// Healthcheck
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), app: 'RepoSense API' });
});

// API Routes
app.use('/api/v1', apiRoutes);

// Centralized Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

export default app;
