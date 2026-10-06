import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, OtpToken, RefreshToken, GitHubAccount } from '../models/index.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { getOctokit } from '../config/octokit.js';
import { encrypt, decrypt } from '../utils/crypto.js';

/**
 * Validate GitHub username existence via GitHub API
 */
export async function checkGithubUsernameExists(username) {
  const octokit = getOctokit();
  try {
    const res = await octokit.users.getByUsername({ username });
    return { exists: true, data: res.data };
  } catch (err) {
    if (err.status === 404) {
      return { exists: false };
    }
    // If rate limited or network issue, fallback to basic regex format check
    const valid = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i.test(username);
    return { exists: valid };
  }
}

/**
 * Register a new unverified user and send 6-digit OTP
 */
export async function signup({ fullName, email, githubUsername, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedGithub = githubUsername.trim().toLowerCase();

  // 1. Check duplicate email
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw { statusCode: 400, code: 'EMAIL_EXISTS', message: 'An account with this email address already exists.' };
  }

  // 2. Check duplicate GitHub username in DB
  const existingGithub = await User.findOne({ githubUsername: normalizedGithub });
  if (existingGithub) {
    throw { statusCode: 400, code: 'GITHUB_EXISTS', message: 'This GitHub username is already registered.' };
  }

  // 3. Verify GitHub username actually exists on GitHub API
  const ghCheck = await checkGithubUsernameExists(githubUsername);
  if (!ghCheck.exists) {
    throw { statusCode: 400, code: 'GITHUB_USER_NOT_FOUND', message: 'GitHub user not found. Please enter a valid GitHub username.' };
  }

  // 4. Hash password with bcrypt cost 12
  const passwordHash = await bcrypt.hash(password, 12);

  // 5. Create unverified user
  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    githubUsername: normalizedGithub,
    githubUsernameDisplay: githubUsername.trim(),
    passwordHash,
    isVerified: false
  });

  // 6. Generate 6-digit OTP
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await OtpToken.create({
    userId: user._id,
    purpose: 'signup',
    otpHash,
    expiresAt
  });

  // 7. Send OTP Email
  await sendOtpEmail(normalizedEmail, otpCode, 'signup');

  return {
    userId: user._id,
    email: normalizedEmail,
    message: 'Registration successful! Verification OTP sent to your email.'
  };
}

/**
 * Verify OTP code
 */
export async function verifyOtp({ userId, email, otpCode }) {
  let user = null;
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    user = await User.findOne({ email: email.trim().toLowerCase() });
  }

  if (!user) {
    throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'Account not found.' };
  }

  const tokenDoc = await OtpToken.findOne({ userId: user._id, purpose: 'signup' }).sort({ createdAt: -1 });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
    throw { statusCode: 400, code: 'OTP_EXPIRED', message: 'Verification code has expired. Please request a new OTP.' };
  }

  if (tokenDoc.attempts >= 5) {
    throw { statusCode: 400, code: 'OTP_LOCKED', message: 'Maximum failed attempts reached. Please request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(otpCode, tokenDoc.otpHash);
  if (!isMatch) {
    tokenDoc.attempts += 1;
    await tokenDoc.save();
    throw { statusCode: 400, code: 'INVALID_OTP', message: 'Invalid verification code.' };
  }

  // Mark account verified & remove used OTP
  user.isVerified = true;
  await user.save();
  await OtpToken.deleteMany({ userId: user._id });

  // Issue Access & Refresh Tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      githubUsername: user.githubUsernameDisplay
    },
    accessToken,
    refreshToken
  };
}

/**
 * Resend OTP code with 60s cooldown & hourly limits
 */
export async function resendOtp({ userId, email }) {
  let user = null;
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    user = await User.findOne({ email: email.trim().toLowerCase() });
  }

  if (!user) {
    throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'Account not found.' };
  }

  const lastToken = await OtpToken.findOne({ userId: user._id }).sort({ createdAt: -1 });
  if (lastToken && lastToken.resendCooldownUntil && lastToken.resendCooldownUntil > new Date()) {
    throw { statusCode: 429, code: 'COOLDOWN_ACTIVE', message: 'Please wait 60 seconds before requesting another code.' };
  }

  if (lastToken && lastToken.resendCount >= 5) {
    throw { statusCode: 429, code: 'RESEND_LIMIT_EXCEEDED', message: 'Maximum hourly resend limit reached.' };
  }

  const resendCount = lastToken ? lastToken.resendCount + 1 : 1;
  await OtpToken.deleteMany({ userId: user._id });

  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const resendCooldownUntil = new Date(Date.now() + 60 * 1000);

  await OtpToken.create({
    userId: user._id,
    purpose: 'signup',
    otpHash,
    expiresAt,
    resendCount,
    resendCooldownUntil
  });

  await sendOtpEmail(user.email, otpCode, 'signup');
  return { message: 'A new verification code has been emailed to you.' };
}

/**
 * Sign in using GitHub Username and Password
 */
export async function signin({ githubUsername, password }) {
  const normalizedGithub = githubUsername.trim().toLowerCase();

  const user = await User.findOne({ githubUsername: normalizedGithub });
  if (!user) {
    throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid GitHub username or password.' };
  }

  // Account lockout check
  if (user.lockUntil && user.lockUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
    throw { statusCode: 423, code: 'ACCOUNT_LOCKED', message: `Account temporarily locked due to failed attempts. Retry in ${minutesLeft} minutes.` };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lockout
      user.failedAttempts = 0;
    }
    await user.save();
    throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid GitHub username or password.' };
  }

  // Reset failed attempts on success
  user.failedAttempts = 0;
  user.lockUntil = null;
  await user.save();

  // If unverified, resend OTP and return REQUIRES_OTP status
  if (!user.isVerified) {
    await resendOtp({ userId: user._id });
    return {
      requiresVerification: true,
      userId: user._id,
      email: user.email,
      message: 'Account is unverified. A new OTP has been sent to your email.'
    };
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      githubUsername: user.githubUsernameDisplay
    },
    accessToken,
    refreshToken
  };
}

/**
 * Connect GitHub OAuth or PAT with strict username match validation
 */
export async function connectGithubToken({ token, tokenType = 'pat', userId }) {
  const user = await User.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };

  // Validate token by calling GitHub API
  const octokit = getOctokit(token);
  let ghUser;
  try {
    const res = await octokit.users.getAuthenticated();
    ghUser = res.data;
  } catch (err) {
    throw { statusCode: 400, code: 'INVALID_GITHUB_TOKEN', message: 'Invalid GitHub access token or personal access token.' };
  }

  // STRICT USERNAME MATCH VERIFICATION
  if (ghUser.login.toLowerCase() !== user.githubUsername.toLowerCase()) {
    throw {
      statusCode: 400,
      code: 'GITHUB_USERNAME_MISMATCH',
      message: `Connected GitHub account (@${ghUser.login}) must match your RepoSense username (@${user.githubUsernameDisplay}).`
    };
  }

  const encryptedToken = encrypt(token);

  await GitHubAccount.findOneAndUpdate(
    { userId: user._id },
    {
      githubUsername: ghUser.login,
      encryptedToken,
      tokenType,
      scope: 'repo,read:user'
    },
    { upsert: true }
  );

  return {
    connected: true,
    githubUsername: ghUser.login
  };
}

/**
 * Send OTP for Password Reset / Change
 */
export async function sendPasswordResetOtp({ userId, githubUsername, email }) {
  let user = null;
  if (userId) {
    try {
      user = await User.findById(userId);
    } catch (e) {}
  }
  if (!user && email) {
    user = await User.findOne({ email: email.trim().toLowerCase() });
  }
  if (!user && githubUsername) {
    const norm = githubUsername.trim().toLowerCase();
    user = await User.findOne({ $or: [{ githubUsername: norm }, { email: norm }] });
  }

  if (!user) {
    throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'User account not found.' };
  }

  const lastToken = await OtpToken.findOne({ userId: user._id, purpose: 'reset' }).sort({ createdAt: -1 });
  if (lastToken && lastToken.resendCooldownUntil && lastToken.resendCooldownUntil > new Date()) {
    throw { statusCode: 429, code: 'COOLDOWN_ACTIVE', message: 'Please wait 60 seconds before requesting another code.' };
  }

  const resendCount = lastToken ? lastToken.resendCount + 1 : 1;
  await OtpToken.deleteMany({ userId: user._id, purpose: 'reset' });

  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const resendCooldownUntil = new Date(Date.now() + 60 * 1000);

  await OtpToken.create({
    userId: user._id,
    purpose: 'reset',
    otpHash,
    expiresAt,
    resendCount,
    resendCooldownUntil
  });

  await sendOtpEmail(user.email, otpCode, 'reset');

  const parts = user.email.split('@');
  const maskedEmail = parts[0].length > 2
    ? `${parts[0].slice(0, 2)}***@${parts[1]}`
    : `${parts[0]}***@${parts[1]}`;

  return {
    userId: user._id,
    email: user.email,
    maskedEmail,
    githubUsername: user.githubUsernameDisplay,
    message: 'Password reset OTP sent to your registered email.'
  };
}

/**
 * Reset / Change Password with OTP (No old password required!)
 */
export async function resetPasswordWithOtp({ userId, githubUsername, email, otpCode, newPassword }) {
  let user = null;
  if (userId) {
    try {
      user = await User.findById(userId);
    } catch (e) {}
  }
  if (!user && email) {
    user = await User.findOne({ email: email.trim().toLowerCase() });
  }
  if (!user && githubUsername) {
    const norm = githubUsername.trim().toLowerCase();
    user = await User.findOne({ $or: [{ githubUsername: norm }, { email: norm }] });
  }

  if (!user) {
    throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'User account not found.' };
  }

  if (!otpCode || !otpCode.trim()) {
    throw { statusCode: 400, code: 'OTP_REQUIRED', message: 'Verification code is required.' };
  }

  if (!newPassword || newPassword.length < 8 || newPassword.length > 72) {
    throw { statusCode: 400, message: 'Password must be between 8 and 72 characters' };
  }
  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    throw { statusCode: 400, message: 'Password must contain uppercase, lowercase, and numbers' };
  }

  const tokenDoc = await OtpToken.findOne({ userId: user._id, purpose: 'reset' }).sort({ createdAt: -1 });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
    throw { statusCode: 400, code: 'OTP_EXPIRED', message: 'Verification code has expired. Please request a new OTP.' };
  }

  if (tokenDoc.attempts >= 5) {
    throw { statusCode: 400, code: 'OTP_LOCKED', message: 'Maximum failed attempts reached. Please request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(otpCode, tokenDoc.otpHash);
  if (!isMatch) {
    tokenDoc.attempts += 1;
    await tokenDoc.save();
    throw { statusCode: 400, code: 'INVALID_OTP', message: 'Invalid verification code.' };
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  await OtpToken.deleteMany({ userId: user._id, purpose: 'reset' });

  try {
    const { createNotification } = await import('./notificationService.js');
    await createNotification({
      userId: user._id,
      type: 'auth.password_changed',
      title: 'Password changed',
      body: 'Your account password was updated successfully.',
      severity: 'info'
    });
  } catch (err) {}

  return { success: true, message: 'Password changed successfully' };
}

/**
 * Change User Password (supports OTP-based or current password if provided)
 */
export async function changePassword({ userId, currentPassword, newPassword, otpCode }) {
  if (otpCode) {
    return await resetPasswordWithOtp({ userId, otpCode, newPassword });
  }

  if (!userId || !newPassword) {
    throw { statusCode: 400, message: 'New password is required' };
  }

  const user = await User.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };

  if (currentPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Invalid current password' };
    }
  }

  if (newPassword.length < 8 || newPassword.length > 72) {
    throw { statusCode: 400, message: 'Password must be between 8 and 72 characters' };
  }
  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    throw { statusCode: 400, message: 'Password must contain uppercase, lowercase, and numbers' };
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  try {
    const { createNotification } = await import('./notificationService.js');
    await createNotification({
      userId: user._id,
      type: 'auth.password_changed',
      title: 'Password changed',
      body: 'Your account password was updated successfully.',
      severity: 'info'
    });
  } catch (err) {}

  return { success: true, message: 'Password changed successfully' };
}

/**
 * Get GitHub connection status
 */
export async function getGithubStatus(userId) {
  if (!userId) return { connected: false };
  const ghAcc = await GitHubAccount.findOne({ userId });
  if (!ghAcc || !ghAcc.encryptedToken) {
    return { connected: false, status: 'disconnected' };
  }

  const decryptedToken = decrypt(ghAcc.encryptedToken);
  if (!decryptedToken) {
    return { connected: false, status: 'disconnected' };
  }

  // Mask token hint
  const maskedToken = decryptedToken.length > 8
    ? `${decryptedToken.slice(0, 10)}••••${decryptedToken.slice(-4)}`
    : '••••••••';

  return {
    connected: true,
    status: 'connected',
    githubUsername: ghAcc.githubUsername,
    maskedToken,
    tokenType: ghAcc.tokenType || 'pat',
    repoPermissions: { canOpenPRs: true }
  };
}

/**
 * Disconnect GitHub Token
 */
export async function disconnectGithubToken(userId) {
  await GitHubAccount.deleteOne({ userId });
  return { connected: false, status: 'disconnected' };
}

