const aiService = require('./aiService');
const priorityService = require('./priorityService');
const geospatialService = require('./geospatialService');
const emailService = require('./emailService');
const smsService = require('./smsService');
const notificationService = require('./notificationService');
const cloudinaryService = require('./cloudinaryService');
const hazardVerificationService = require('./hazardVerificationService');

module.exports = {
  aiService,
  priorityService,
  geospatialService,
  emailService,
  smsService,
  notificationService,
  cloudinaryService,
  hazardVerificationService,
  ...priorityService,
  ...geospatialService,
  ...emailService,
  ...smsService,
  ...notificationService,
};
