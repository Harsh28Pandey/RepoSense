import mongoose from 'mongoose';
import { Digest, Repo, User } from '../models/index.js';
import { executeAiQuery } from '../utils/llmRouter.js';
import { sendActivityDigestEmail } from '../utils/mailer.js';

export async function generateDigest({ repoId, frequency = 'weekly', delivery = 'dashboard', userId }) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const aiResult = await executeAiQuery({
    prompt: `Generate a concise ${frequency} summary digest for repository ${repo.fullName}.`,
    userId,
    contextData: `Repo: ${repo.fullName}`
  });

  const summaryText = aiResult.text;
  const highlights = [
    `Updated repository metrics for ${repo.name}`,
    `Scanned README documentation status: ${repo.hasReadme ? 'Good' : 'Missing'}`,
    `Open issues tracking: ${repo.openIssuesCount || 0} issues`
  ];

  const digestObj = await Digest.create({
    repoId,
    userId,
    frequency,
    delivery,
    summaryText,
    highlights,
    sentAt: new Date()
  });

  if (delivery === 'email') {
    const user = await User.findById(userId);
    if (user?.email) {
      await sendActivityDigestEmail(user.email, {
        repoName: repo.fullName,
        summaryText,
        highlights
      });
    }
  }

  return digestObj;
}

export async function sendTestEmail(email, userId) {
  let targetEmail = email;
  if (!targetEmail && userId) {
    const user = await User.findById(userId);
    targetEmail = user?.email;
  }

  if (!targetEmail) throw { statusCode: 400, message: 'Email recipient is required' };

  await sendActivityDigestEmail(targetEmail, {
    repoName: 'RepoSense Demo Project',
    summaryText: 'This is a test activity digest delivered to verify your email notifications setup.',
    highlights: [
      'Automated code quality scans active',
      'Pull request auto-review ready',
      'Documentation health monitoring online'
    ]
  });

  return {
    success: true,
    message: `Test activity digest email sent to ${targetEmail}!`
  };
}
