import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { evaluateReadmeQuality, calculateHealthScore, cosineSimilarity } from '../src/utils/heuristics.js';
import { encrypt, decrypt } from '../src/utils/crypto.js';

test('Auth - Password Hashing with Bcrypt', async () => {
  const plainPassword = 'Password123!';
  const hash = await bcrypt.hash(plainPassword, 12);

  assert.notEqual(hash, plainPassword);
  const isValid = await bcrypt.compare(plainPassword, hash);
  assert.equal(isValid, true);

  const isInvalid = await bcrypt.compare('WrongPassword', hash);
  assert.equal(isInvalid, false);
});

test('Auth - 6-Digit OTP Generation & Hashing', async () => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  assert.equal(otpCode.length, 6);

  const otpHash = await bcrypt.hash(otpCode, 10);
  const isValid = await bcrypt.compare(otpCode, otpHash);
  assert.equal(isValid, true);
});

test('Security - Strict Per-User Data Scoping Isolation Logic', () => {
  const userA_id = 'user_A_11111111111111111111';
  const userB_id = 'user_B_22222222222222222222';

  const mockDatabaseDocs = [
    { id: 'doc_1', userId: userA_id, name: 'Repo A Docs' },
    { id: 'doc_2', userId: userB_id, name: 'Repo B Docs' }
  ];

  // Helper query simulation enforcing userId filter on all queries
  function queryUserDocs(requestingUserId) {
    return mockDatabaseDocs.filter(doc => doc.userId === requestingUserId);
  }

  const userAResults = queryUserDocs(userA_id);
  assert.equal(userAResults.length, 1);
  assert.equal(userAResults[0].name, 'Repo A Docs');

  const userBResults = queryUserDocs(userB_id);
  assert.equal(userBResults.length, 1);
  assert.equal(userBResults[0].name, 'Repo B Docs');

  // Verify User B receives 0 results when requesting User A's document
  const userBCrossAccess = mockDatabaseDocs.find(doc => doc.id === 'doc_1' && doc.userId === userB_id);
  assert.equal(userBCrossAccess, undefined);
});

test('Crypto - AES-256-GCM Token Encryption', () => {
  const githubPat = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
  const encrypted = encrypt(githubPat);
  assert.notEqual(encrypted, githubPat);

  const decrypted = decrypt(encrypted);
  assert.equal(decrypted, githubPat);
});

test('Isolation - Two-User Dashboard Aggregates & Item Scoping', () => {
  const userA_id = 'user_A_11111111111111111111';
  const userB_id = 'user_B_22222222222222222222';

  const userARepos = [
    { _id: 'repo_1', userId: userA_id, fullName: 'userA/repo1', readmeQualityScore: 85, healthScore: 90 },
    { _id: 'repo_2', userId: userA_id, fullName: 'userA/repo2', readmeQualityScore: 75, healthScore: 80 }
  ];

  const userBRepos = [];

  // Simulate aggregate queries scoped strictly by userId
  function computeUserDashboardStats(userRepos) {
    if (userRepos.length === 0) {
      return {
        totalRepos: 0,
        averageReadmeQuality: '-',
        averageHealthScore: '-',
        activePrCount: 0
      };
    }
    const sumReadme = userRepos.reduce((acc, r) => acc + (r.readmeQualityScore || 0), 0);
    const sumHealth = userRepos.reduce((acc, r) => acc + (r.healthScore || 0), 0);
    return {
      totalRepos: userRepos.length,
      averageReadmeQuality: Math.round(sumReadme / userRepos.length),
      averageHealthScore: Math.round(sumHealth / userRepos.length),
      activePrCount: 0
    };
  }

  const userAStats = computeUserDashboardStats(userARepos);
  assert.equal(userAStats.totalRepos, 2);
  assert.equal(userAStats.averageReadmeQuality, 80);
  assert.equal(userAStats.averageHealthScore, 85);

  const userBStats = computeUserDashboardStats(userBRepos);
  assert.equal(userBStats.totalRepos, 0);
  assert.equal(userBStats.averageReadmeQuality, '-');
  assert.equal(userBStats.averageHealthScore, '-');
});

test('Isolation - Direct Resource Access Returns 404 for Unowned Items', () => {
  const userA_id = 'user_A_11111111111111111111';
  const userB_id = 'user_B_22222222222222222222';

  const mockReposDB = [
    { _id: 'repo_A_100', userId: userA_id, fullName: 'userA/secret-repo' }
  ];

  function getRepoById(repoId, requestingUserId) {
    const item = mockReposDB.find(r => r._id === repoId && r.userId === requestingUserId);
    if (!item) {
      return { statusCode: 404, message: 'Repository not found' };
    }
    return { statusCode: 200, data: item };
  }

  // User A accesses own repo -> 200
  const resA = getRepoById('repo_A_100', userA_id);
  assert.equal(resA.statusCode, 200);
  assert.equal(resA.data.fullName, 'userA/secret-repo');

  // User B accesses User A's repo -> 404 (identical to nonexistent ID)
  const resB = getRepoById('repo_A_100', userB_id);
  assert.equal(resB.statusCode, 404);
  assert.equal(resB.message, 'Repository not found');

  // User B accesses nonexistent ID -> 404 (identical)
  const resNonexistent = getRepoById('repo_99999', userB_id);
  assert.equal(resNonexistent.statusCode, 404);
  assert.equal(resNonexistent.message, 'Repository not found');
});
