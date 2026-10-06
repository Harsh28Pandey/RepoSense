import mongoose from 'mongoose';
import { Scan, Repo, HealthSnapshot } from '../models/index.js';
import { evaluateReadmeQuality, calculateHealthScore } from '../utils/heuristics.js';
import { executeAiQuery } from '../utils/llmRouter.js';

export async function createScanJob(repoId, focusOptions, userId) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const scanObj = await Scan.create({
    repoId,
    userId,
    status: 'in_progress',
    progress: 10,
    currentStep: 'Fetching files & tree structure...'
  });

  return scanObj;
}

export async function processScanStep(scanId, currentProgress, stepMessage, resStream) {
  if (resStream) {
    resStream.write(`data: ${JSON.stringify({ progress: currentProgress, step: stepMessage })}\n\n`);
  }
}

export async function finishScan(scanId, repoObj, userId) {
  if (!userId || !repoObj || !repoObj._id) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const repo = await Repo.findOne({ _id: repoObj._id, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const aiResult = await executeAiQuery({
    prompt: `Analyze repo ${repo.fullName}. Summarize state in 2 clear sentences. Mention if README is missing or good, health status, and key recommendation.`
  });

  const healthData = calculateHealthScore({
    hasReadme: repo.hasReadme,
    readmeQualityScore: repo.readmeQualityScore || 0,
    openIssuesCount: repo.openIssuesCount || 0,
    lastCommitDaysAgo: 1,
    codeQualityScore: repo.hasReadme ? 85 : 40
  }, repo.healthWeights);

  const report = {
    scanId,
    repoId: repo._id,
    repoName: repo.fullName,
    status: 'completed',
    progress: 100,
    currentStep: 'Scan complete!',
    readmeStatus: repo.hasReadme ? 'GOOD' : 'MISSING',
    docsCompletenessScore: repo.readmeQualityScore || (repo.hasReadme ? 80 : 0),
    onboardingReadiness: repo.hasReadme ? 'High' : 'Low',
    openIssuesCount: repo.openIssuesCount || 0,
    pendingPrsCount: 0,
    healthScore: healthData.score,
    activityTrend: 'Stable',
    plainSummary: aiResult.text || `Repository ${repo.fullName} analysis complete.`,
    completedAt: new Date()
  };

  await Scan.findByIdAndUpdate(scanId, report);
  repo.lastScannedAt = new Date();
  repo.healthScore = healthData.score;
  await repo.save();

  await HealthSnapshot.create({
    userId,
    repoId: repo._id,
    score: healthData.score,
    breakdown: healthData.breakdown,
    trend: 'improving',
    recommendations: repo.hasReadme ? ['Maintain README docs'] : ['Generate README.md']
  });

  return report;
}
