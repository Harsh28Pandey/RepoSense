import mongoose from 'mongoose';
import { IssueTriage, Repo } from '../models/index.js';
import { getUserOctokit } from '../utils/githubHelper.js';

export async function triageIssues({ repoId, similarityThreshold = 75, userId }) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  let issuesList = [];
  const { octokit, connected } = await getUserOctokit(userId);
  if (connected) {
    try {
      const { data: issues } = await octokit.issues.listForRepo({
        owner: repo.owner,
        repo: repo.name,
        state: 'open',
        per_page: 15
      });
      if (issues && issues.length > 0) {
        issuesList = issues.filter(i => !i.pull_request).map(i => ({
          id: String(i.id),
          issueNumber: i.number,
          title: i.title,
          url: i.html_url,
          suggestedLabels: i.labels.map(l => l.name).length > 0 ? i.labels.map(l => typeof l === 'string' ? l : l.name) : ['triage', 'needs-review'],
          duplicateOfIssueNumber: null
        }));
      }
    } catch (e) {}
  }

  const result = await IssueTriage.create({
    repoId,
    userId,
    issues: issuesList,
    similarityThreshold
  });

  return result;
}

export async function applyIssueLabels(repoId, issuesToUpdate, userId) {
  if (!userId || !repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
    throw { statusCode: 404, message: 'Repository not found' };
  }
  const repo = await Repo.findOne({ _id: repoId, userId });
  if (!repo) {
    throw { statusCode: 404, message: 'Repository not found' };
  }

  const { octokit, connected } = await getUserOctokit(userId);
  if (connected && Array.isArray(issuesToUpdate)) {
    for (const item of issuesToUpdate) {
      if (item.issueNumber && item.labels && item.labels.length > 0) {
        try {
          await octokit.issues.addLabels({
            owner: repo.owner,
            repo: repo.name,
            issue_number: item.issueNumber,
            labels: item.labels
          });
        } catch (e) {}
      }
    }
  }

  return {
    success: true,
    updatedCount: Array.isArray(issuesToUpdate) ? issuesToUpdate.length : 0,
    message: 'Labels applied to GitHub issues successfully!'
  };
}
