import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Redis from 'ioredis';
import nodemailer from 'nodemailer';

async function checkEnv() {
  console.log('🔍 Running RepoSense Environment Check...\n');

  const required = [
    'PORT', 'NODE_ENV', 'CLIENT_URL', 'MONGODB_URI', 'REDIS_URL',
    'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET', 'ENCRYPTION_KEY'
  ];

  const statusTable = [];

  // 1. Env Variables Presence
  required.forEach((key) => {
    const value = process.env[key];
    statusTable.push({
      Variable: key,
      Status: value ? '✅ Present' : '❌ Missing',
      Configured: value ? (key.includes('SECRET') || key.includes('KEY') ? '••••••••' : value) : 'None'
    });
  });

  console.table(statusTable);

  // 2. Database Live Connection
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reposense';
    await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB Connection: SUCCESSFUL');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB Connection: FAILED ->', err.message);
  }

  // 3. Redis Live Connection
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const redis = new Redis(redisUrl, { connectTimeout: 3000, maxRetriesPerRequest: 1, enableOfflineQueue: false });
    redis.on('error', () => {});
    await redis.ping();
    console.log('✅ Redis Connection: SUCCESSFUL');
    redis.disconnect();
  } catch (err) {
    console.warn('⚠️ Redis Connection: FAILED -> Falling back to in-memory mode');
  }

  // 4. SMTP Check
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.verify();
      console.log('✅ SMTP Mailer: VERIFIED AND READY');
    } catch (err) {
      console.warn('⚠️ SMTP Mailer: FAILED ->', err.message);
    }
  } else {
    console.log('ℹ️ SMTP Mailer: Not configured (Dev console log mode enabled)');
  }

  // 5. LLM Keys Check
  const aiProviders = [
    { name: 'Gemini', key: process.env.GEMINI_API_KEY },
    { name: 'Groq', key: process.env.GROQ_API_KEY },
    { name: 'OpenAI', key: process.env.OPENAI_API_KEY }
  ];

  console.log('\n🤖 AI Provider Status:');
  aiProviders.forEach((p) => {
    if (p.key) {
      console.log(`  - ${p.name}: ✅ Key Configured (••••${p.key.slice(-4)})`);
    } else {
      console.log(`  - ${p.name}: ℹ️ Key Not Configured`);
    }
  });

  console.log('\n✨ Environment Check Complete! Refer to hello.txt for full setup instructions.\n');
  process.exit(0);
}

checkEnv();
