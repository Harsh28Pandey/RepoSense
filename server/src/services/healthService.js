import mongoose from 'mongoose';
import { Repo, HealthSnapshot } from '../models/index.js';
import { calculateHealthScore } from '../utils/heuristics.js';

export async function getRepoHealth(repoId, userId) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const weights = repo.healthWeights || { readmeDocs: 30, activity: 30, community: 20, codeQuality: 20 };

  const healthData = calculateHealthScore({
    hasReadme: repo.hasReadme,
    readmeQualityScore: repo.readmeQualityScore || 0,
    openIssuesCount: repo.openIssuesCount || 0,
    lastCommitDaysAgo: repo.lastScannedAt ? Math.round((Date.now() - new Date(repo.lastScannedAt)) / (1000 * 3600 * 24)) : 30,
    codeQualityScore: repo.readmeQualityScore || 0
  }, weights);

  const snapshots = await HealthSnapshot.find({ repoId, userId }).sort({ createdAt: 1 });
  const trendData = snapshots.map((s, idx) => ({
    week: `Scan ${idx + 1}`,
    score: s.score
  }));

  const recommendations = [];
  if (!repo.hasReadme) recommendations.push('Generate a README.md file to instantly boost documentation score by +30 points.');
  if (repo.openIssuesCount > 5) recommendations.push('Triage and resolve open issues to improve community score.');
  if (recommendations.length === 0) recommendations.push('Maintain clean documentation and periodic code reviews.');

  return {
    repoId: repo._id,
    repoName: repo.fullName,
    healthScore: snapshots.length > 0 ? healthData.score : (repo.healthScore || 0),
    weights,
    breakdown: healthData.breakdown,
    trend: snapshots.length >= 2 ? 'improving' : 'neutral',
    trendData,
    recommendations
  };
}

export async function updateHealthWeights(repoId, weights, userId) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const total = (weights.readmeDocs || 0) + (weights.activity || 0) + (weights.community || 0) + (weights.codeQuality || 0);
  const normalized = {
    readmeDocs: Math.round(((weights.readmeDocs || 0) / (total || 100)) * 100),
    activity: Math.round(((weights.activity || 0) / (total || 100)) * 100),
    community: Math.round(((weights.community || 0) / (total || 100)) * 100),
    codeQuality: Math.round(((weights.codeQuality || 0) / (total || 100)) * 100)
  };

  await Repo.findOneAndUpdate({ _id: repoId, userId }, { healthWeights: normalized });
  return getRepoHealth(repoId, userId);
}
