import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

async function sendTestEmail() {
  const recipient = process.argv[2];
  if (!recipient) {
    console.error('Usage: npm run check:email <recipient@example.com>');
    process.exit(1);
  }

  console.log(`✉️ Sending test email to ${recipient}...`);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('ℹ️ SMTP credentials not found in env. Email payload logged below:');
    console.log(`To: ${recipient}\nSubject: RepoSense Email Verification Test\nBody: Hello! RepoSense email delivery system is working.`);
    process.exit(0);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"RepoSense" <noreply@reposense.dev>',
      to: recipient,
      subject: 'RepoSense Email Delivery Test',
      text: 'Hello! Your RepoSense email configuration is working perfectly.'
    });

    console.log('✅ Email sent successfully! MessageId:', info.messageId);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    process.exit(1);
  }
}

sendTestEmail();
