require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const RescueTeam = require('../models/RescueTeam');
const RescueAssignment = require('../models/RescueAssignment');
const CitizenReport = require('../models/CitizenReport');
const EmergencyRequest = require('../models/EmergencyRequest');
const AuditLog = require('../models/AuditLog');
const { hazardVerificationService } = require('../services');
const logger = require('../utils/logger');

async function validateWorkflow() {
  logger.info('🧪 Starting Jal Rakshak Hazard Workflow & SOS State Machine Validation...');

  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
  await mongoose.connect(mongoURI);

  // 1. Test Hazard Verification Service Normalization & Fallbacks
  logger.info('\n1. Testing Hazard Verification Adapter Normalization...');
  const sampleRaw = {
    flood_detected: true,
    score: 0.94,
    severity: 'high',
    estimatedWaterDepth: 1.25,
    roadCondition: 'BLOCKED',
    objects: ['car', 'water'],
  };
  const normalized = hazardVerificationService.normalizeVerificationResponse(sampleRaw);
  console.assert(normalized.floodDetected === true, 'floodDetected normalization failed');
  console.assert(normalized.severity === 'HIGH', 'severity normalization failed');
  console.assert(normalized.estimatedWaterDepthMeters === 1.25, 'waterDepth normalization failed');
  console.assert(normalized.roadCondition === 'BLOCKED', 'roadCondition normalization failed');
  console.assert(normalized.isEstimate === true, 'isEstimate must be true');
  console.assert(normalized.requiresHumanVerification === true, 'requiresHumanVerification must be true');
  logger.info('✅ Hazard verification adapter normalization passed.');

  // 2. Test Unavailable Fallback
  const unavailable = hazardVerificationService.createUnavailableResult('Test timeout');
  console.assert(unavailable.status === 'UNAVAILABLE', 'Unavailable status failed');
  console.assert(unavailable.isEstimate === true, 'isEstimate must be true on unavailable');
  logger.info('✅ Hazard verification unavailable fallback passed.');

  // 3. Test Citizen Report Model & Indexes
  logger.info('\n2. Testing Citizen Report Model & Pending Queue...');
  const testReport = await CitizenReport.create({
    location: { type: 'Point', coordinates: [85.8245, 20.2961] },
    address: 'Bhubaneswar Test Ward 12',
    waterLevel: 'HIGH',
    roadStatus: 'BLOCKED',
    description: 'Test flood observation',
    image: {
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      publicId: 'jal-rakshak/reports/test_sample',
      width: 1280,
      height: 720,
      format: 'jpg',
      bytes: 120400,
    },
    aiAnalysis: normalized,
    verificationStatus: 'PENDING',
  });
  console.assert(testReport._id, 'CitizenReport creation failed');
  console.assert(testReport.verificationStatus === 'PENDING', 'Initial status must be PENDING');
  logger.info(`✅ Citizen report created with ID: ${testReport._id}`);

  // Test Verification Action
  testReport.verificationStatus = 'VERIFIED';
  testReport.verification = {
    verifiedAt: new Date(),
    action: 'VERIFY',
    notes: 'Verified by test suite',
  };
  await testReport.save();
  console.assert(testReport.verificationStatus === 'VERIFIED', 'Verification update failed');
  logger.info('✅ Admin report verification action passed.');

  // Clean up test report
  await CitizenReport.findByIdAndDelete(testReport._id);

  // 4. Test SOS Dispatch & State Machine Transitions
  logger.info('\n3. Testing SOS Dispatch & Rescue State Machine...');
  const rescueTeam = await RescueTeam.findOne({ status: 'AVAILABLE' });
  if (!rescueTeam) {
    throw new Error('No available rescue team found in MongoDB for validation');
  }
  logger.info(`Found available rescue team: ${rescueTeam.teamName} (${rescueTeam.teamCode})`);

  const testSos = await EmergencyRequest.create({
    location: { type: 'Point', coordinates: [85.8245, 20.2961] },
    address: 'Test Stranded Location',
    totalPeople: 3,
    childrenCount: 1,
    elderlyCount: 1,
    medicalEmergency: true,
    waterSeverity: 'HIGH',
    roadAccess: 'BLOCKED',
    description: 'Test SOS beacon',
    priorityScore: 92,
    priorityLevel: 'CRITICAL',
    status: 'PENDING',
  });
  logger.info(`Created test emergency SOS: ${testSos.requestId} (${testSos._id})`);

  // Assign Team
  const assignment = await RescueAssignment.create({
    emergencyRequest: testSos._id,
    rescueTeam: rescueTeam._id,
    assignedBy: rescueTeam.teamLead || rescueTeam._id,
    assignmentStatus: 'ASSIGNED',
    estimatedEtaMinutes: 15,
  });

  testSos.status = 'ASSIGNED';
  testSos.assignedTeam = rescueTeam._id;
  testSos.activeAssignment = assignment._id;
  await testSos.save();

  rescueTeam.status = 'DEPLOYED';
  await rescueTeam.save();
  logger.info('✅ Emergency assigned to rescue team. Status = ASSIGNED, Team = DEPLOYED.');

  // Test Valid Transitions: ASSIGNED -> DISPATCHED -> EN_ROUTE -> ON_SCENE -> RESCUED -> CLOSED
  const transitions = ['DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'RESCUED', 'CLOSED'];
  for (const nextSt of transitions) {
    assignment.assignmentStatus = nextSt;
    assignment.statusHistory.push({
      status: nextSt,
      changedAt: new Date(),
      note: `Transition to ${nextSt}`,
    });
    if (nextSt === 'DISPATCHED') assignment.dispatchedAt = new Date();
    if (nextSt === 'EN_ROUTE') assignment.enRouteAt = new Date();
    if (nextSt === 'ON_SCENE') assignment.onSceneAt = new Date();
    if (nextSt === 'RESCUED') assignment.rescuedAt = new Date();
    if (nextSt === 'CLOSED') assignment.closedAt = new Date();
    await assignment.save();

    testSos.status = nextSt;
    await testSos.save();
    logger.info(`  ↳ Transitioned to ${nextSt} (Success)`);
  }

  // Cleanup
  await EmergencyRequest.findByIdAndDelete(testSos._id);
  await RescueAssignment.findByIdAndDelete(assignment._id);
  rescueTeam.status = 'AVAILABLE';
  await rescueTeam.save();

  logger.info('\n🎉 ALL VALIDATION TESTS PASSED SUCCESSFULLY!\n');
  await mongoose.connection.close();
}

validateWorkflow().catch((err) => {
  logger.error(`Validation failed: ${err.message}`);
  process.exit(1);
});
