import mongoose from 'mongoose';
import crypto from 'crypto';
import { OnboardGuide, Repo } from '../models/index.js';

export async function generateOnboardGuide({ repoId, skillLevel = 'Beginner', interestArea = 'Frontend', userId }) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  // Generate 128-bit (16-byte hex = 32 chars) unguessable slug
  const randomSlug = crypto.randomBytes(16).toString('hex');
  const slug = `${repo.name.toLowerCase()}-${randomSlug}`;

  const guide = await OnboardGuide.create({
    repoId,
    userId,
    skillLevel,
    interestArea,
    slug,
    roadmapSteps: [
      { step: 1, title: 'Environment Setup', description: 'Clone repository, set up Node.js v18+, and install packages using `npm install`.' },
      { step: 2, title: 'Understand Core Architecture', description: `Explore code structure and modules for ${repo.name}.` },
      { step: 3, title: 'Run Local Servers', description: 'Run development script to start local server environment.' },
      { step: 4, title: 'Pick Your First Task', description: 'Filter open GitHub issues tagged with good first issue.' }
    ],
    codebaseMap: [
      { path: 'src/', purpose: `Main source code for ${repo.name}` }
    ],
    goodFirstIssues: [],
    isPublic: true
  });

  return guide;
}

export async function getGuideBySlug(slug) {
  if (!slug) return null;
  const guide = await OnboardGuide.findOne({ slug, isPublic: true }).lean();
  if (!guide) return null;

  // Never return owner's userId or sensitive metadata on public route
  delete guide.userId;
  return guide;
}
