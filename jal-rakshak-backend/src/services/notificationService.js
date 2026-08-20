const logger = require('../utils/logger');
const { sendEmail } = require('./emailService');
const { sendSMS } = require('./smsService');

/**
 * Multi-channel Emergency Alert Broadcast
 */
const broadcastAlert = async ({
  alertType,
  title,
  message,
  targetAreas = [],
  deliveryChannels = ['push'],
  recipients = [],
}) => {
  logger.info(`[Broadcast Alert] [${alertType}] "${title}" to channels: [${deliveryChannels.join(', ')}]`);

  const results = {
    pushSent: 0,
    smsSent: 0,
    emailSent: 0,
  };

  if (deliveryChannels.includes('email') || deliveryChannels.includes('all')) {
    for (const recipient of recipients) {
      if (recipient.email) {
        await sendEmail({
          to: recipient.email,
          subject: `🚨 [JAL RAKSHAK ${alertType}] ${title}`,
          text: message,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border-left: 6px solid #DC2626; background: #FEF2F2;">
              <h2 style="color: #DC2626; margin-top: 0;">🚨 JAL RAKSHAK ${alertType} ALERT</h2>
              <h3>${title}</h3>
              <p style="font-size: 16px; line-height: 1.5;">${message}</p>
              <p><strong>Target Sectors:</strong> ${targetAreas.join(', ') || 'All Low-Lying Riverine Sectors'}</p>
              <hr />
              <p style="font-size: 12px; color: #6B7280;">National Disaster Response Force (NDRF) | State Emergency Ops Center</p>
            </div>
          `,
        });
        results.emailSent++;
      }
    }
  }

  if (deliveryChannels.includes('sms') || deliveryChannels.includes('all')) {
    for (const recipient of recipients) {
      if (recipient.phone) {
        await sendSMS({
          phone: recipient.phone,
          message: `[JAL RAKSHAK ${alertType}] ${title}: ${message}`,
        });
        results.smsSent++;
      }
    }
  }

  if (deliveryChannels.includes('push') || deliveryChannels.includes('all')) {
    results.pushSent = recipients.length || 1500; // Simulated push reach
  }

  return results;
};

module.exports = {
  broadcastAlert,
};
