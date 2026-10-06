import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateReadmeQuality, calculateHealthScore, cosineSimilarity } from '../src/utils/heuristics.js';
import { encrypt, decrypt } from '../src/utils/crypto.js';

test('Heuristics - Evaluate README Quality', () => {
  const missing = evaluateReadmeQuality('');
  assert.equal(missing.status, 'MISSING');
  assert.equal(missing.score, 0);

  const fullText = '# Comprehensive Project Title\n\n' +
    'This is a full stack production application engineered with modern web standards, robust security, automated testing, continuous integration, and seamless deployment workflows.\n\n' +
    '## Installation\n\nClone repository and run `npm install` to install dependencies.\n\n' +
    '## Usage\n\nRun `npm run dev` to start the local development server.\n\n' +
    '## Features\n\n- AI powered README generation\n- Line by line PR reviews\n- Health score metrics\n\n' +
    '## License\n\nMIT License';

  const full = evaluateReadmeQuality(fullText);
  assert.equal(full.status, 'EXCELLENT');
  assert.equal(full.score >= 80, true);
});

test('Heuristics - Calculate Health Score', () => {
  const health = calculateHealthScore({
    hasReadme: true,
    readmeQualityScore: 90,
    openIssuesCount: 2,
    lastCommitDaysAgo: 1,
    codeQualityScore: 90
  });

  assert.equal(health.score >= 80, true);
  assert.equal(health.breakdown.readmeDocs, 90);
});

test('Heuristics - Vector Cosine Similarity', () => {
  const vecA = [1, 0, 1, 0];
  const vecB = [1, 0, 1, 0];
  const vecC = [0, 1, 0, 1];

  assert.ok(Math.abs(cosineSimilarity(vecA, vecB) - 1.0) < 0.0001);
  assert.equal(cosineSimilarity(vecA, vecC), 0);
});

test('Crypto - AES-256-GCM Encryption & Decryption', () => {
  const secretKey = 'ghp_test_1234567890_github_pat_example';
  const encrypted = encrypt(secretKey);
  assert.notEqual(encrypted, secretKey);

  const decrypted = decrypt(encrypted);
  assert.equal(decrypted, secretKey);
});
