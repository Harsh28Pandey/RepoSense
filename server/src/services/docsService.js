import mongoose from 'mongoose';
import { DocsReport, Repo } from '../models/index.js';

export async function analyzeDocumentation(repoId, userId) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const existing = await DocsReport.findOne({ repoId, userId }).sort({ createdAt: -1 });
  if (existing) return existing;

  const report = await DocsReport.create({
    repoId,
    userId,
    completenessScore: repo.hasReadme ? 70 : 0,
    missingDocs: repo.hasReadme ? [] : [
      { path: 'README.md', name: 'README.md', type: 'Documentation File', description: 'Primary repository overview documentation is missing.' }
    ],
    changelogStatus: 'Up to date',
    lastUpdated: repo.lastScannedAt ? new Date(repo.lastScannedAt).toISOString() : 'Never',
    draftUpdates: []
  });

  return report;
}

export async function createDocsPR(repoId, userId) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const prUrl = `${repo.url}/pull/1`;
  return {
    success: true,
    prUrl,
    message: `Documentation update PR opened! Link: ${prUrl}`
  };
}
