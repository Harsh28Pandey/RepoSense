import mongoose from 'mongoose';
import { Repo, Scan } from '../models/index.js';

export async function getUserRepos(userId) {
  if (!userId) return [];
  return await Repo.find({ userId }).sort({ updatedAt: -1 });
}

export async function getRepoById(repoId, userId) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    return null;
  }
  return await Repo.findOne({ _id: repoId, userId });
}

export async function connectRepo(repoUrl, userId) {
  if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

  const cleanUrl = repoUrl.trim().replace(/\/$/, '');
  const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
  if (!match) {
    throw { statusCode: 400, code: 'INVALID_URL', message: 'Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)' };
  }

  const [, owner, name] = match;
  const fullName = `${owner}/${name}`;

  let existing = await Repo.findOne({ fullName, userId });
  if (existing) return existing;

  const newRepo = await Repo.create({
    userId,
    githubRepoId: String(Date.now()),
    owner,
    name,
    fullName,
    url: cleanUrl,
    defaultBranch: 'main',
    hasReadme: false,
    healthScore: 0,
    readmeQualityScore: 0
  });
  return newRepo;
}

export async function disconnectRepo(repoId, userId) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    return { success: false };
  }
  const result = await Repo.deleteOne({ _id: repoId, userId });
  return { success: result.deletedCount > 0 };
}
