import { Octokit } from '@octokit/rest';
import { logger } from '../utils/logger.js';

export function getOctokit(accessToken) {
  if (accessToken) {
    return new Octokit({ auth: accessToken });
  }
  return new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });
}
