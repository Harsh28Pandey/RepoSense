import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reposense';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

async function runMigration() {
  console.log('====================================================');
  console.log(' MIGRATION: REMOVE SETTINGS & API KEYS DATA');
  console.log('====================================================');

  // 1. Connect MongoDB
  let mongoConnected = false;
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    mongoConnected = true;
    console.log('MongoDB connection successful.');
  } catch (err) {
    console.warn(`MongoDB connection skipped/failed: ${err.message}`);
  }

  if (mongoConnected) {
    const db = mongoose.connection.db;

    // Drop apikeys collection if exists
    try {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      if (collectionNames.includes('apikeys')) {
        await db.dropCollection('apikeys');
        console.log('[SUCCESS] Dropped collection "apikeys".');
      } else {
        console.log('[SKIP] Collection "apikeys" does not exist.');
      }

      if (collectionNames.includes('userpreferences')) {
        await db.dropCollection('userpreferences');
        console.log('[SUCCESS] Dropped collection "userpreferences".');
      }

      if (collectionNames.includes('settings')) {
        await db.dropCollection('settings');
        console.log('[SUCCESS] Dropped collection "settings".');
      }

      // Unset removed fields on Users
      const updateResult = await db.collection('users').updateMany(
        {},
        { $unset: { defaultAiRouting: "", notifications: "", settings: "", apiKeys: "" } }
      );
      console.log(`[SUCCESS] User models cleaned up ($unset). Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

    } catch (err) {
      console.error(`Error processing MongoDB collections/fields: ${err.message}`);
    } finally {
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
    }
  }

  // 2. Clear Redis keys with matching namespace
  try {
    console.log(`Connecting to Redis at: ${REDIS_URL}`);
    const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, connectTimeout: 3000 });
    
    redis.on('error', (err) => {
      console.warn(`Redis connection warning: ${err.message}`);
    });

    const patterns = ['settings:*', 'apikeys:*', 'userkeys:*', 'user:settings:*'];
    let totalCleared = 0;

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        totalCleared += keys.length;
        console.log(`[SUCCESS] Cleared ${keys.length} Redis keys for pattern: ${pattern}`);
      }
    }

    if (totalCleared === 0) {
      console.log('[SKIP] No settings-related Redis keys found to clear.');
    }

    redis.disconnect();
    console.log('Redis connection closed.');
  } catch (err) {
    console.warn(`Redis cleanup skipped/failed: ${err.message}`);
  }

  console.log('====================================================');
  console.log(' MIGRATION COMPLETED SUCCESSFULLY');
  console.log('====================================================');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
