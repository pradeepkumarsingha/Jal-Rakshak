const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

/**
 * Initialize and cache Nodemailer Transporter
 */
const getTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const isRealConfig = smtpUser && smtpPass && smtpPass !== 'app_password_here' && !smtpUser.includes('demo.jalrakshak.org');

  if (isRealConfig) {
    const cleanPass = (smtpPass || '').trim().replace(/\s+/g, '');
    const isGmail =
      (process.env.SMTP_SERVICE || '').toLowerCase() === 'gmail' ||
      (process.env.SMTP_HOST || '').toLowerCase().includes('gmail') ||
      (smtpUser && smtpUser.toLowerCase().endsWith('@gmail.com'));

    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
      });
      logger.info(`[Nodemailer] Initialized Gmail SMTP transport for: ${smtpUser}`);
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: parseInt(process.env.SMTP_PORT, 10) === 465,
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      logger.info(`[Nodemailer] Initialized Custom SMTP transport (${process.env.SMTP_HOST}:${process.env.SMTP_PORT}) for: ${smtpUser}`);
    }
  } else {
    // If no real SMTP credentials provided, create an Ethereal test transport or mock transporter
    try {
      if (process.env.NODE_ENV !== 'test') {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info(`[Nodemailer] Using Ethereal test SMTP account: ${testAccount.user}`);
      }
    } catch (etherealErr) {
      logger.warn(`[Nodemailer] Could not create Ethereal account (${etherealErr.message}). Using local fallback.`);
    }
  }

  return transporter;
};

/**
 * Send Email via Nodemailer
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailTransporter = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || (process.env.SMTP_USER ? `"Jal Rakshak Alert System" <${process.env.SMTP_USER}>` : '"Jal Rakshak Alert System" <alerts@jalrakshak.org>'),
      to,
      subject,
      text,
      html,
    };

    if (mailTransporter) {
      const info = await mailTransporter.sendMail(mailOptions);
      logger.info(`[Nodemailer] Email dispatched to ${to} (MessageId: ${info.messageId})`);

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`[Nodemailer Preview URL]: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } else {
      logger.info(`[Nodemailer Mock] Sent to: ${to} | Subject: ${subject}`);
      return { success: true, messageId: `mock-${Date.now()}` };
    }
  } catch (error) {
    logger.warn(`[Nodemailer] Email sending error to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send New Password Email for Citizen Account Reset
 */
const sendNewPasswordEmail = async ({ to, name, newPassword }) => {
  const portalUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const loginUrl = `${portalUrl}/login?portal=citizen`;

  const subject = '🔐 Your New Password - Jal Rakshak Citizen Portal';

  const text = `Hello ${name || 'Citizen'},

A password reset was requested for your Jal Rakshak Citizen account. Your new password has been activated:

New Password: ${newPassword}

You can log in at: ${loginUrl}

Security Notice:
- Use this new password to sign into the Citizen Portal.
- If you did not request this password reset, please contact the emergency helpline immediately.

Stay Safe,
Jal Rakshak Disaster Response Team
Odisha State Emergency Operations Center`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jal Rakshak Password Reset</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
        .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .password-box { background: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .password-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 8px; }
        .password-value { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 700; color: #0369a1; letter-spacing: 2px; background: #e0f2fe; padding: 8px 16px; border-radius: 8px; display: inline-block; }
        .instructions { background: #eff6ff; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 13px; color: #1e40af; line-height: 1.5; }
        .btn-container { text-align: center; margin: 28px 0; }
        .btn { background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(2,132,199,0.3); }
        .security-notice { font-size: 12px; color: #64748b; line-height: 1.5; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 8px;">
            <svg width="48" height="48" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
              <path d="M60 8 L98 22 C98 22 102 60 98 72 C94 84 76 98 60 106 C44 98 26 84 22 72 C18 60 22 22 22 22 L60 8 Z" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="4.5" stroke-linejoin="round" />
              <path d="M44 26 C49 22 71 22 76 26" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
              <path d="M49 32 C53 29 67 29 71 32" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
              <path d="M60 38 C60 38 78 60 78 72 C78 82 70 90 60 90 C50 90 42 82 42 72 C42 60 60 38 60 38 Z" fill="#ffffff" />
              <circle cx="60" cy="62" r="3.5" fill="#0284c7" />
              <path d="M16 48 C14 36 28 34 28 34 C28 34 30 46 16 48 Z" fill="#4ade80" />
              <path d="M10 60 C6 48 22 45 22 45 C22 45 26 58 10 60 Z" fill="#22c55e" />
              <path d="M12 82 C28 98 52 86 60 92 C68 98 92 88 108 82 C94 100 68 98 60 94 C52 90 28 102 12 82 Z" fill="#ffffff" fill-opacity="0.5" />
            </svg>
          </div>
          <h1>Jal Rakshak AI</h1>
          <p>PREDICT • PROTECT • RESPOND — Flood Intelligence Network</p>
        </div>
        <div class="content">
          <div class="greeting">Namaste ${name || 'Citizen'},</div>
          <div class="message">
            We received a request to reset your password for the Jal Rakshak Citizen Portal. A new secure password has been generated and immediately activated for your account.
          </div>
          
          <div class="password-box">
            <div class="password-label">Your New Enabled Password</div>
            <div class="password-value">${newPassword}</div>
          </div>

          <div class="instructions">
            <strong>Next Steps:</strong><br/>
            1. Return to the Citizen Portal login page.<br/>
            2. Sign in using your registered email and this new password.<br/>
            3. You may keep using this password or update it anytime in your profile settings.
          </div>

          <div class="btn-container">
            <a href="${loginUrl}" class="btn" target="_blank">Sign In to Citizen Portal</a>
          </div>

          <div class="security-notice">
            <strong>Security Notice:</strong> If you did not make this request, please contact our 24/7 State Disaster Ops Center helpline immediately at <strong>1070 / 112</strong>.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Jal Rakshak AI • State Emergency Operations Center (SEOC), Odisha • NDRF & ODRAF Response Network
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendNewPasswordEmail,
};

