import nodemailer from 'nodemailer';
import { logger } from './logger.js';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }
  }
  return transporter;
}

export async function sendOtpEmail(toEmail, otpCode, purpose = 'signup') {
  const mailer = getTransporter();
  const subject = purpose === 'signup'
    ? 'Verify your RepoSense Account'
    : 'Reset your RepoSense Password';

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #EEF1F5; padding: 30px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #F7F8FA; border: 1px solid #D3D9E2; border-radius: 16px; padding: 30px;">
        <h2 style="color: #1F2A37; margin-top: 0;">RepoSense OTP Verification</h2>
        <p style="color: #5B6778; font-size: 14px;">Your 6-digit verification code is:</p>
        <div style="background-color: #E8ECF1; border: 1px solid #D3D9E2; border-radius: 12px; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2F6FDE; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #5B6778; font-size: 12px;">This code will expire in 10 minutes. Do not share this code with anyone.</p>
      </div>
    </div>
  `;

  if (mailer) {
    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || 'RepoSense <noreply@reposense.dev>',
        to: toEmail,
        subject,
        html
      });
      logger.info(`OTP email sent to ${toEmail}`);
      return true;
    } catch (err) {
      logger.error(`Failed to send OTP email: ${err.message}`);
    }
  }

  // Console output fallback for dev environment when SMTP keys aren't added yet
  logger.info(`[DEV SMTP FALLBACK] OTP Code for ${toEmail}: ${otpCode}`);
  return true;
}

export async function sendActivityDigestEmail(toEmail, { repoName = 'Repository', summaryText = '', highlights = [] } = {}) {
  const mailer = getTransporter();
  const subject = `RepoSense Activity Digest: ${repoName}`;

  const highlightItems = (highlights || []).map(h => `<li style="margin-bottom: 6px; color: #1F2A37;">${h}</li>`).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #EEF1F5; padding: 30px;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #F7F8FA; border: 1px solid #D3D9E2; border-radius: 16px; padding: 30px;">
        <h2 style="color: #1F2A37; margin-top: 0;">📊 RepoSense Repository Activity Digest</h2>
        <p style="color: #2F6FDE; font-weight: bold; font-size: 14px;">${repoName}</p>
        <div style="background-color: #FAFBFC; border: 1px solid #D3D9E2; border-radius: 12px; padding: 20px; font-size: 14px; color: #1F2A37; line-height: 1.6; margin: 20px 0;">
          ${summaryText || 'Your repository activity metrics have been evaluated cleanly.'}
        </div>
        ${highlights && highlights.length > 0 ? `
          <h3 style="color: #1F2A37; font-size: 14px; margin-bottom: 10px;">Key Highlights</h3>
          <ul style="padding-left: 20px; font-size: 13px;">
            ${highlightItems}
          </ul>
        ` : ''}
        <p style="color: #5B6778; font-size: 12px; margin-top: 25px;">Automated activity digest delivered via RepoSense AI.</p>
      </div>
    </div>
  `;

  if (mailer) {
    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || 'RepoSense <noreply@reposense.dev>',
        to: toEmail,
        subject,
        html
      });
      logger.info(`Activity digest email sent to ${toEmail}`);
      return true;
    } catch (err) {
      logger.error(`Failed to send digest email: ${err.message}`);
    }
  }

  logger.info(`[DEV SMTP FALLBACK] Activity Digest sent to ${toEmail}`);
  return true;
}
