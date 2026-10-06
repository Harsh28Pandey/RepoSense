import express from 'express';
import { protect } from '../../middleware/auth.js';
import * as controllers from '../../controllers/apiControllers.js';
import notificationRoutes from '../notificationRoutes.js';

const router = express.Router();

// Custom Email + OTP Auth routes
router.get('/auth/check-github-username', controllers.checkGithubUsername);
router.post('/auth/signup', controllers.signup);
router.post('/auth/verify-otp', controllers.verifyOtp);
router.post('/auth/resend-otp', controllers.resendOtp);
router.post('/auth/signin', controllers.signin);
router.get('/auth/me', protect, controllers.getMe);
router.post('/auth/forgot-password', controllers.forgotPassword);
router.post('/auth/send-password-otp', controllers.sendPasswordOtp);
router.post('/auth/reset-password', controllers.resetPassword);
router.post('/auth/change-password', controllers.changePassword);
router.post('/auth/logout', controllers.logout);
router.post('/auth/refresh', protect, controllers.refreshToken);

// GitHub Access Connection
router.get('/github/status', protect, controllers.getGithubStatus);
router.post('/github/token', protect, controllers.connectGithubToken);
router.delete('/github/token', protect, controllers.disconnectGithubToken);

// Repos
router.get('/repos', protect, controllers.getRepos);
router.get('/repos/:id', protect, controllers.getRepoById);
router.post('/repos/connect', protect, controllers.connectRepo);
router.delete('/repos/:id', protect, controllers.disconnectRepo);

// Scan
router.post('/scans', protect, controllers.startScan);
router.get('/scans/:id/stream', protect, controllers.getScanStream);

// ReadMe
router.post('/readme/generate', protect, controllers.generateReadme);
router.post('/readme/commit-pr', protect, controllers.commitReadmePR);
router.get('/readme/history', protect, controllers.getReadmeHistory);

// Review
router.get('/review/prs', protect, controllers.getOpenPRs);
router.post('/review', protect, controllers.runReview);
router.post('/review/:id/post-comments', protect, controllers.postReviewComments);

// Docs
router.post('/docs/analyze', protect, controllers.analyzeDocs);
router.post('/docs/create-pr', protect, controllers.createDocsPR);

// Onboard
router.post('/onboard/generate', protect, controllers.generateOnboard);
router.get('/onboard/share/:slug', controllers.getPublicOnboardGuide);

// Issues
router.post('/issues/triage', protect, controllers.triageIssues);
router.post('/issues/apply-labels', protect, controllers.applyIssueLabels);

// Health
router.get('/health/:repoId', protect, controllers.getHealth);
router.put('/health/weights', protect, controllers.updateHealthWeights);

// Digest
router.post('/digest/generate', protect, controllers.generateDigest);
router.post('/digest/test-email', protect, controllers.sendTestEmail);

// Fix
router.post('/fix/detect', protect, controllers.detectFixes);
router.post('/fix/create-pr', protect, controllers.createFixPR);

import multer from 'multer';
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024, files: 5 } });

// Chat
router.get('/chat/sessions', protect, controllers.getChatSessions);
router.post('/chat/sessions', protect, controllers.createChatSession);
router.get('/chat/sessions/:id/messages', protect, controllers.getSessionMessages);
router.post('/chat/sessions/:id/messages', protect, controllers.sendMessage);
router.patch('/chat/sessions/:id', protect, controllers.updateChatSession);
router.post('/chat/sessions/:id/duplicate', protect, controllers.duplicateChatSession);
router.post('/chat/sessions/:id/clear', protect, controllers.clearChatMessages);
router.delete('/chat/sessions/:id', protect, controllers.deleteChatSession);
router.post('/chat/upload', protect, upload.array('files', 5), controllers.uploadChatFiles);
router.get('/chat/files/:fileId', protect, controllers.getChatFile);



// Notifications
router.use('/notifications', notificationRoutes);

// Contact
router.post('/contact', controllers.postContact);

// Webhook endpoint
router.post('/webhooks/github', (req, res) => {
  res.json({ success: true, message: 'Webhook event received' });
});

export default router;
