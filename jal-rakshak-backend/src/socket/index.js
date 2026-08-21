const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');
const RescueTeam = require('../models/RescueTeam');

let io = null;

/**
 * Initialize Socket.IO with HTTP server and authentication
 * @param {Object} httpServer - Node HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
const initializeSocket = (httpServer) => {
  const allowedOrigins = [
    process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        // Allow unauthenticated guest connections to public rooms only
        socket.user = null;
        return next();
      }

      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'jal_rakshak_super_secret_jwt_key_2024_disaster_response_platform');
      const user = await User.findById(decoded.id || decoded._id).select('-password');
      if (user) {
        socket.user = user;
      }
      next();
    } catch (err) {
      logger.warn(`Socket auth warning: ${err.message}. Proceeding as guest.`);
      socket.user = null;
      next();
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    logger.info(`Socket connected: ${socket.id} (User: ${user ? `${user.fullName} [${user.role}]` : 'Guest'})`);

    // Join role rooms
    if (user) {
      // Citizen personal room
      socket.join(`citizen:${user._id}`);
      socket.join(`citizen:${user.id}`);

      if (user.role === 'admin') {
        socket.join('admin');
        logger.info(`Admin socket joined room: admin (${socket.id})`);
      }

      if (user.role === 'rescue') {
        // Find rescue team associated with this rescue user
        try {
          const team = await RescueTeam.findOne({
            $or: [{ teamLead: user._id }, { members: user._id }],
          });
          if (team) {
            socket.join(`rescue:${team._id}`);
            socket.join(`rescue:${team.id}`);
            socket.rescueTeamId = team._id;
            logger.info(`Rescue socket joined room: rescue:${team._id} (${socket.id})`);
          }
          socket.join('rescue:all');
        } catch (teamErr) {
          logger.warn(`Error resolving rescue team for socket: ${teamErr.message}`);
        }
      }
    }

    // Explicit room subscription from client
    socket.on('subscribe:citizen', (userId) => {
      if (userId) {
        socket.join(`citizen:${userId}`);
      }
    });

    socket.on('subscribe:rescue', (teamId) => {
      if (teamId) {
        socket.join(`rescue:${teamId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
};

/**
 * Helper to retrieve initialized io instance
 */
const getIO = () => {
  return io;
};

// ==========================================
// Specialized Room Broadcasters
// ==========================================

/**
 * Emit new report to admin room
 */
const notifyNewReport = (report) => {
  if (!io) return;
  const reportSummary = {
    reportId: report._id,
    location: report.location,
    address: report.address,
    waterLevel: report.waterLevel,
    roadStatus: report.roadStatus,
    description: report.description,
    image: report.image,
    aiAnalysis: report.aiAnalysis,
    verificationStatus: report.verificationStatus,
    createdAt: report.createdAt,
  };
  io.to('admin').emit('report:new', reportSummary);
};

/**
 * Emit updated report to admin and citizen rooms
 */
const notifyReportUpdated = (report) => {
  if (!io) return;
  const adminSummary = {
    reportId: report._id,
    verificationStatus: report.verificationStatus,
    verification: report.verification,
    aiAnalysis: report.aiAnalysis,
    updatedAt: report.updatedAt,
  };
  io.to('admin').emit('report:updated', adminSummary);

  if (report.user) {
    const citizenSafe = {
      reportId: report._id,
      verificationStatus: report.verificationStatus,
      updatedAt: report.updatedAt,
      notice:
        report.verificationStatus === 'VERIFIED'
          ? 'Your report has been verified by emergency coordinators.'
          : report.verificationStatus === 'REJECTED'
          ? 'Your report was reviewed and marked unverified.'
          : 'Your report has been escalated for priority dispatch review.',
    };
    io.to(`citizen:${report.user}`).emit('report:updated', citizenSafe);
  }
};

/**
 * Emit new emergency to admin and citizen rooms
 */
const notifyNewEmergency = (emergency) => {
  if (!io) return;
  const adminSummary = {
    emergencyId: emergency._id,
    requestId: emergency.requestId,
    location: emergency.location,
    address: emergency.address,
    totalPeople: emergency.totalPeople,
    priorityScore: emergency.priorityScore,
    priorityLevel: emergency.priorityLevel,
    status: emergency.status,
    createdAt: emergency.createdAt,
    contact: emergency.contact,
  };
  io.to('admin').emit('emergency:new', adminSummary);

  if (emergency.user) {
    const citizenSafe = {
      emergencyId: emergency._id,
      requestId: emergency.requestId,
      status: emergency.status,
      priorityLevel: emergency.priorityLevel,
      createdAt: emergency.createdAt,
    };
    io.to(`citizen:${emergency.user}`).emit('emergency:created', citizenSafe);
  }
};

/**
 * Emit emergency assignment
 */
const notifyEmergencyAssigned = (emergency, assignment, team) => {
  if (!io) return;

  const adminSummary = {
    emergencyId: emergency._id,
    status: emergency.status,
    assignedTeam: {
      id: team?._id,
      teamName: team?.teamName,
      teamCode: team?.teamCode,
    },
    estimatedEtaMinutes: assignment?.estimatedEtaMinutes || 15,
    assignedAt: assignment?.assignedAt || new Date(),
  };
  io.to('admin').emit('emergency:assigned', adminSummary);

  if (team) {
    const rescueDetails = {
      assignmentId: assignment?._id,
      emergencyId: emergency._id,
      requestId: emergency.requestId,
      status: assignment?.assignmentStatus || 'ASSIGNED',
      location: emergency.location,
      address: emergency.address,
      totalPeople: emergency.totalPeople,
      childrenCount: emergency.childrenCount,
      elderlyCount: emergency.elderlyCount,
      medicalEmergency: emergency.medicalEmergency,
      description: emergency.description,
      contact: emergency.contact,
      priorityScore: emergency.priorityScore,
      priorityLevel: emergency.priorityLevel,
      estimatedEtaMinutes: assignment?.estimatedEtaMinutes,
    };
    io.to(`rescue:${team._id}`).emit('rescue:assignment-created', rescueDetails);
    io.to('rescue:all').emit('rescue:assignment-created', rescueDetails);
  }

  if (emergency.user) {
    const citizenSafe = {
      emergencyId: emergency._id,
      requestId: emergency.requestId,
      status: 'ASSIGNED',
      teamName: team?.teamName || 'NDRF Rescue Unit',
      estimatedEtaMinutes: assignment?.estimatedEtaMinutes || 15,
      notice: 'A rescue unit has been assigned to your emergency and is preparing for dispatch.',
    };
    io.to(`citizen:${emergency.user}`).emit('emergency:assigned', citizenSafe);
  }
};

/**
 * Emit rescue status update
 */
const notifyRescueStatusUpdated = (emergency, assignment, team) => {
  if (!io) return;

  const adminSummary = {
    emergencyId: emergency._id,
    assignmentId: assignment?._id,
    status: emergency.status,
    updatedAt: new Date(),
  };
  io.to('admin').emit('emergency:status-updated', adminSummary);

  if (team) {
    const rescueSummary = {
      assignmentId: assignment?._id,
      emergencyId: emergency._id,
      status: assignment?.assignmentStatus,
      updatedAt: new Date(),
    };
    io.to(`rescue:${team._id}`).emit('rescue:assignment-updated', rescueSummary);
  }

  if (emergency.user) {
    let notice = `Status updated to ${emergency.status}`;
    if (emergency.status === 'DISPATCHED') notice = 'Rescue unit has been dispatched to your sector.';
    if (emergency.status === 'EN_ROUTE') notice = 'Rescue boat is en route to your location.';
    if (emergency.status === 'ON_SCENE') notice = 'Rescue crew has arrived at your scene.';
    if (emergency.status === 'RESCUED') notice = 'Rescue team has marked the case as rescued. Please confirm your safety if possible.';
    if (emergency.status === 'CLOSED') notice = 'Emergency mission closed and completed.';

    const citizenSafe = {
      emergencyId: emergency._id,
      requestId: emergency.requestId,
      status: emergency.status,
      teamName: team?.teamName || 'NDRF Unit',
      updatedAt: new Date(),
      notice,
    };
    io.to(`citizen:${emergency.user}`).emit('emergency:status-updated', citizenSafe);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  notifyNewReport,
  notifyReportUpdated,
  notifyNewEmergency,
  notifyEmergencyAssigned,
  notifyRescueStatusUpdated,
};
