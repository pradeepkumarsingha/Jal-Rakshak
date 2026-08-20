const aiService = require('./aiService');
const priorityService = require('./priorityService');
const geospatialService = require('./geospatialService');
const emailService = require('./emailService');
const smsService = require('./smsService');
const notificationService = require('./notificationService');

module.exports = {
  aiService,
  priorityService,
  geospatialService,
  emailService,
  smsService,
  notificationService,
  ...priorityService,
  ...geospatialService,
  ...emailService,
  ...smsService,
  ...notificationService,
};
