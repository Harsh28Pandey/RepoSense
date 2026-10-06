import jwt from 'jsonwebtoken';
import * as authService from '../services/authService.js';
import * as repoService from '../services/repoService.js';
import * as scanService from '../services/scanService.js';
import * as readmeService from '../services/readmeService.js';
import * as reviewService from '../services/reviewService.js';
import * as docsService from '../services/docsService.js';
import * as onboardService from '../services/onboardService.js';
import * as issuesService from '../services/issuesService.js';
import * as healthService from '../services/healthService.js';
import * as digestService from '../services/digestService.js';
import * as fixService from '../services/fixService.js';
import * as chatService from '../services/chatService.js';
import { ContactMessage, GitHubAccount } from '../models/index.js';
import { setAuthCookies, clearAuthCookies, generateAccessToken } from '../middleware/auth.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'reposense_jwt_access_secret_2026';

function extractUserIdFromReq(req) {
  if (req.user?._id || req.user?.id) return req.user._id || req.user.id;
  try {
    const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      if (decoded?.id) return decoded.id;
    }
  } catch (e) {}
  return null;
}

// 1. Auth Controllers
export async function checkGithubUsername(req, res, next) {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ success: false, error: { message: 'Username is required' } });
    const result = await authService.checkGithubUsernameExists(username);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyOtp(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json({ success: true, data: { user: result.user } });
  } catch (err) { next(err); }
}

export async function resendOtp(req, res, next) {
  try {
    const result = await authService.resendOtp(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function signin(req, res, next) {
  try {
    const result = await authService.signin(req.body);
    if (result.requiresVerification) {
      return res.json({ success: true, data: result });
    }
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json({ success: true, data: { user: result.user } });
  } catch (err) { next(err); }
}

export async function getMe(req, res, next) {
  try {
    const ghAccount = await GitHubAccount.findOne({ userId: req.user._id });
    res.json({
      success: true,
      data: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        githubUsername: req.user.githubUsernameDisplay,
        githubConnected: !!ghAccount
      }
    });
  } catch (err) { next(err); }
}

export async function logout(req, res, next) {
  try {
    clearAuthCookies(res);
    res.json({ success: true, message: 'Signed out successfully' });
  } catch (err) { next(err); }
}

export async function refreshToken(req, res, next) {
  try {
    const token = generateAccessToken(req.user._id);
    setAuthCookies(res, token, null);
    res.json({ success: true, data: { token } });
  } catch (err) { next(err); }
}



export async function forgotPassword(req, res, next) {
  try {
    const userId = extractUserIdFromReq(req);
    const result = await authService.sendPasswordResetOtp({
      userId,
      githubUsername: req.body.githubUsername,
      email: req.body.email
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function sendPasswordOtp(req, res, next) {
  try {
    const userId = extractUserIdFromReq(req) || req.body.userId;
    const email = req.user?.email || req.body.email;
    const githubUsername = req.user?.githubUsername || req.body.githubUsername;
    const result = await authService.sendPasswordResetOtp({
      userId,
      githubUsername,
      email
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function resetPassword(req, res, next) {
  try {
    const userId = extractUserIdFromReq(req) || req.body.userId;
    const email = req.user?.email || req.body.email;
    const githubUsername = req.user?.githubUsername || req.body.githubUsername;
    const result = await authService.resetPasswordWithOtp({
      userId,
      githubUsername,
      email,
      otpCode: req.body.otpCode,
      newPassword: req.body.newPassword
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    const userId = extractUserIdFromReq(req) || req.body.userId;
    const email = req.user?.email || req.body.email;
    const result = await authService.changePassword({
      userId,
      email,
      otpCode: req.body.otpCode,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getGithubStatus(req, res, next) {
  try {
    const result = await authService.getGithubStatus(req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function connectGithubToken(req, res, next) {
  try {
    const result = await authService.connectGithubToken({
      token: req.body.token,
      tokenType: req.body.tokenType || 'pat',
      userId: req.user._id
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function disconnectGithubToken(req, res, next) {
  try {
    const result = await authService.disconnectGithubToken(req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// 2. Repo Controllers (STRICT PER-USER ISOLATION)
export async function getRepos(req, res, next) {
  try {
    const repos = await repoService.getUserRepos(req.user._id);
    res.json({ success: true, data: repos });
  } catch (err) { next(err); }
}

export async function getRepoById(req, res, next) {
  try {
    const repo = await repoService.getRepoById(req.params.id, req.user._id);
    if (!repo) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Repository not found' } });
    res.json({ success: true, data: repo });
  } catch (err) { next(err); }
}

export async function connectRepo(req, res, next) {
  try {
    const repo = await repoService.connectRepo(req.body.repoUrl, req.user._id);
    res.json({ success: true, data: repo });
  } catch (err) { next(err); }
}

export async function disconnectRepo(req, res, next) {
  try {
    const result = await repoService.disconnectRepo(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// 3. Scan Controllers
export async function startScan(req, res, next) {
  try {
    const scan = await scanService.createScanJob(req.body.repoId, req.body.focusOptions, req.user._id);
    res.json({ success: true, data: scan });
  } catch (err) { next(err); }
}

export async function getScanStream(req, res, next) {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const repo = await repoService.getRepoById(req.params.id, req.user._id);

    const steps = [
      { progress: 20, step: 'Fetching repo files & tree structure...' },
      { progress: 45, step: 'Evaluating README & documentation completeness...' },
      { progress: 70, step: 'Analyzing activity metrics & issue data...' },
      { progress: 90, step: 'Generating AI summary report...' }
    ];

    for (const s of steps) {
      res.write(`data: ${JSON.stringify(s)}\n\n`);
      await new Promise(r => setTimeout(r, 500));
    }

    const report = await scanService.finishScan(req.params.id, repo, req.user._id);
    res.write(`data: ${JSON.stringify({ progress: 100, step: 'Scan complete!', report })}\n\n`);
    res.end();
  } catch (err) { next(err); }
}

// 4. ReadMe Controllers
export async function generateReadme(req, res, next) {
  try {
    const content = await readmeService.generateReadmeContent({
      ...req.body,
      userId: req.user._id
    });
    res.json({ success: true, data: { content } });
  } catch (err) { next(err); }
}

export async function commitReadmePR(req, res, next) {
  try {
    const result = await readmeService.commitReadmePR({
      ...req.body,
      userId: req.user._id
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getReadmeHistory(req, res, next) {
  try {
    const history = await readmeService.getReadmeHistory(req.query.repoId, req.user._id);
    res.json({ success: true, data: history });
  } catch (err) { next(err); }
}

// 5. Review Controllers
export async function getOpenPRs(req, res, next) {
  try {
    const prs = await reviewService.getOpenPRs(req.query.repoId, req.user._id);
    res.json({ success: true, data: prs });
  } catch (err) { next(err); }
}

export async function runReview(req, res, next) {
  try {
    const report = await reviewService.runPRReview({
      ...req.body,
      userId: req.user._id
    });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function postReviewComments(req, res, next) {
  try {
    const result = await reviewService.postReviewComments(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// 6. Docs Controllers
export async function analyzeDocs(req, res, next) {
  try {
    const report = await docsService.analyzeDocumentation(req.body.repoId, req.user._id);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function createDocsPR(req, res, next) {
  try {
    const result = await docsService.createDocsPR(req.body.repoId, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// 7. Onboard Controllers
export async function generateOnboard(req, res, next) {
  try {
    const guide = await onboardService.generateOnboardGuide({
      ...req.body,
      userId: req.user._id
    });
    res.json({ success: true, data: guide });
  } catch (err) { next(err); }
}

export async function getPublicOnboardGuide(req, res, next) {
  try {
    const guide = await onboardService.getGuideBySlug(req.params.slug);
    if (!guide) return res.status(404).json({ success: false, error: { message: 'Guide not found' } });
    res.json({ success: true, data: guide });
  } catch (err) { next(err); }
}

// 8. Issues Controllers
export async function triageIssues(req, res, next) {
  try {
    const report = await issuesService.triageIssues({
      ...req.body,
      userId: req.user._id
    });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function applyIssueLabels(req, res, next) {
  try {
    const result = await issuesService.applyIssueLabels(req.body.repoId, req.body.issuesToUpdate, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// 9. Health Controllers
export async function getHealth(req, res, next) {
  try {
    const report = await healthService.getRepoHealth(req.params.repoId, req.user._id);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function updateHealthWeights(req, res, next) {
  try {
    const report = await healthService.updateHealthWeights(req.body.repoId, req.body.weights, req.user._id);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

// 10. Digest Controllers
export async function generateDigest(req, res, next) {
  try {
    const digest = await digestService.generateDigest({
      ...req.body,
      userId: req.user._id
    });
    res.json({ success: true, data: digest });
  } catch (err) { next(err); }
}

export async function sendTestEmail(req, res, next) {
  try {
    const result = await digestService.sendTestEmail(req.body.email, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// 11. Fix Controllers
export async function detectFixes(req, res, next) {
  try {
    const report = await fixService.detectAutoFixes(req.body.repoId, req.body.categories, req.user._id);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function createFixPR(req, res, next) {
  try {
    const result = await fixService.createFixPR(req.body.repoId, req.body.selectedFixIds, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// 12. Chat Controllers
export async function getChatSessions(req, res, next) {
  try {
    const sessions = await chatService.getChatSessions(req.user._id);
    res.json({ success: true, data: sessions });
  } catch (err) { next(err); }
}

export async function createChatSession(req, res, next) {
  try {
    const session = await chatService.createChatSession({ ...req.body, userId: req.user._id });
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
}

export async function getSessionMessages(req, res, next) {
  try {
    const messages = await chatService.getSessionMessages(req.params.id, req.user._id);
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
}

export async function sendMessage(req, res, next) {
  try {
    const msg = await chatService.sendMessageToSession({
      sessionId: req.params.id,
      userContent: req.body.content,
      repoId: req.body.repoId,
      preferredAi: req.body.preferredAi,
      attachmentUrl: req.body.attachmentUrl,
      userId: req.user._id
    });
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
}

export async function deleteChatSession(req, res, next) {
  try {
    const result = await chatService.deleteChatSession(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function updateChatSession(req, res, next) {
  try {
    const session = await chatService.updateChatSession(req.params.id, req.user._id, req.body);
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
}

export async function duplicateChatSession(req, res, next) {
  try {
    const session = await chatService.duplicateChatSession(req.params.id, req.user._id);
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
}

export async function clearChatMessages(req, res, next) {
  try {
    const result = await chatService.clearChatSessionMessages(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function uploadChatFiles(req, res, next) {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No files received' } });
    }

    const { saveUploadedFile, validateFile } = await import('../services/fileService.js');
    const uploadedResults = [];

    for (const f of files) {
      const val = validateFile(f);
      if (!val.valid) {
        return res.status(415).json({ success: false, error: { message: val.reason } });
      }
      const saved = saveUploadedFile(f, req.user._id);
      uploadedResults.push({
        id: saved.id,
        name: saved.name,
        size: saved.size,
        mimeType: saved.mimeType,
        kind: saved.kind,
        url: `/api/v1/chat/files/${saved.id}`
      });
    }

    res.json({ success: true, data: uploadedResults });
  } catch (err) { next(err); }
}

export async function getChatFile(req, res, next) {
  try {
    const { getFileMetadata } = await import('../services/fileService.js');
    const meta = getFileMetadata(req.params.fileId, req.user._id);
    if (!meta) {
      return res.status(404).json({ success: false, error: { message: 'File not found' } });
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', meta.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${meta.name}"`);
    res.sendFile(meta.storagePath);
  } catch (err) { next(err); }
}


// 14. Contact Controller
export async function postContact(req, res, next) {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message || !name.trim() || !email.trim() || !message.trim()) {
      throw { statusCode: 400, message: 'Name, email, and message are all required.' };
    }
    const doc = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });
    res.json({ success: true, data: { id: doc._id, message: 'Message received! We will respond shortly.' } });
  } catch (err) { next(err); }
}
