const logger = require('../utils/logger');

/**
 * Send SMS Broadcast or Emergency Alert
 */
const sendSMS = async ({ phone, message }) => {
  try {
    // In production, integrate with Twilio, Gupshup, or CDAC Emergency SMS Gateway
    logger.info(`[SMS Dispatch] Phone: ${phone} | Msg: "${message.substring(0, 60)}..."`);
    return {
      success: true,
      phone,
      dispatchedAt: new Date().toISOString(),
      gatewayStatus: 'DELIVERED_MOCK',
    };
  } catch (error) {
    logger.error(`SMS dispatch error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
};
