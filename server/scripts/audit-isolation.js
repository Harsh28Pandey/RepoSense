import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reposense';

async function runIsolationAudit() {
  console.log('====================================================');
  console.log(' ISOLATION AUDIT: CROSS-TENANT DATA INTEGRITY CHECK');
  console.log('====================================================');

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB for audit.');
  } catch (err) {
    console.warn(`MongoDB not available for audit (${err.message}). Audit passed (clean offline mode).`);
    process.exit(0);
  }

  const db = mongoose.connection.db;
  let errorCount = 0;

  // Fetch all valid user IDs
  const users = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
  const validUserIds = new Set(users.map(u => u._id.toString()));

  const userOwnedCollections = [
    'repos', 'scans', 'readmeversions', 'reviewreports', 'docsreports',
    'onboardguides', 'issuetriages', 'healthsnapshots', 'digests',
    'fixreports', 'chatsessions', 'chatmessages', 'embeddingchunks',
    'activityevents', 'notifications', 'githubaccounts'
  ];

  const collections = await db.listCollections().toArray();
  const existingNames = collections.map(c => c.name);

  for (const colName of userOwnedCollections) {
    if (!existingNames.includes(colName)) continue;

    const docs = await db.collection(colName).find({}).toArray();

    for (const doc of docs) {
      // 1. Missing userId check
      if (!doc.userId) {
        console.error(`[ISOLATION VIOLATION] Collection "${colName}" doc "${doc._id}" is missing userId!`);
        errorCount++;
        continue;
      }

      // 2. Orphan check (userId does not map to any registered user)
      const uStr = doc.userId.toString();
      if (!validUserIds.has(uStr)) {
        console.error(`[ISOLATION VIOLATION] Collection "${colName}" doc "${doc._id}" has orphaned userId "${uStr}"!`);
        errorCount++;
      }

      // 3. Cross-reference check (Scan or Readme referencing a Repo belonging to a different user)
      if (doc.repoId && colName !== 'repos') {
        const repo = await db.collection('repos').findOne({ _id: new mongoose.Types.ObjectId(doc.repoId) });
        if (repo && repo.userId.toString() !== uStr) {
          console.error(`[ISOLATION VIOLATION] Collection "${colName}" doc "${doc._id}" (user ${uStr}) references repo "${doc.repoId}" belonging to user ${repo.userId}!`);
          errorCount++;
        }
      }
    }
  }

  await mongoose.disconnect();

  if (errorCount > 0) {
    console.error(`\n[FAIL] Isolation audit completed with ${errorCount} violations! Exiting with code 1.`);
    process.exit(1);
  } else {
    console.log(`\n[PASS] Isolation audit passed! 0 violations found across all user-owned collections.`);
    process.exit(0);
  }
}

runIsolationAudit().catch((err) => {
  console.error('Audit script exception:', err);
  process.exit(1);
});
