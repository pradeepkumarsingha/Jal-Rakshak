require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Shelter = require('../models/Shelter');
const RescueTeam = require('../models/RescueTeam');
const EmergencyRequest = require('../models/EmergencyRequest');
const CitizenReport = require('../models/CitizenReport');
const Alert = require('../models/Alert');
const logger = require('../utils/logger');

const seedAll = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
    await mongoose.connect(mongoURI);

    logger.info('🚀 Starting Master Database Seeding for Jal Rakshak...');

    // 1. Fetch existing users for relations (if any)
    const existingUsers = await User.find({});
    const createdUsers = {
      citizen: existingUsers.find(u => u.role === 'citizen') || null,
      admin: existingUsers.find(u => u.role === 'admin') || null,
      rescue: existingUsers.find(u => u.role === 'rescue') || null,
    };


    // 2. Seed Shelters
    logger.info('--- Seeding Relief Shelters ---');
    const sheltersData = [
      {
        shelterId: 'SH-01',
        name: 'Barabati Multi-Purpose Cyclone & Flood Shelter',
        locationName: 'Bidanasi, Cuttack',
        address: 'Near Barabati Stadium Ring Road, Bidanasi, Cuttack',
        district: 'Cuttack',
        state: 'Odisha',
        location: { type: 'Point', coordinates: [85.8654, 20.4812] },
        totalCapacity: 1200,
        currentOccupancy: 840,
        status: 'ACTIVE',
        riskLevel: 'LOW',
        isRecommended: true,
        contact: { person: 'Sub-Collector Cuttack', phone: '+91 671 2304921' },
        facilities: ['Medical Aid Camp', 'Drinking Water Plant', '24/7 Diesel Generator', 'Community Kitchen', 'Women & Child Room'],
        elevationMeters: 38,
        roadCondition: 'Safe & Clear (Elevated Ring Road)',
      },
      {
        shelterId: 'SH-02',
        name: 'Ravenshaw University Relief Shelter Complex',
        locationName: 'College Square, Cuttack',
        address: 'Ravenshaw University Campus, College Square, Cuttack',
        district: 'Cuttack',
        state: 'Odisha',
        location: { type: 'Point', coordinates: [85.8942, 20.4638] },
        totalCapacity: 2500,
        currentOccupancy: 1980,
        status: 'ACTIVE',
        riskLevel: 'LOW',
        isRecommended: true,
        contact: { person: 'Prof. S. Tripathy (Nodal Officer)', phone: '+91 671 2201987' },
        facilities: ['Field Hospital', 'Helipad Access', 'Clean Water', 'Food Packets', 'Power Backup', 'Livestock Enclosure'],
        elevationMeters: 41,
        roadCondition: 'Passable via Badambadi Overbridge',
      },
      {
        shelterId: 'SH-03',
        name: 'Kendrapara Town High School Shelter',
        locationName: 'Marsaghai, Kendrapara',
        address: 'High School Campus, Marsaghai, Kendrapara',
        district: 'Kendrapara',
        state: 'Odisha',
        location: { type: 'Point', coordinates: [86.421, 20.5015] },
        totalCapacity: 800,
        currentOccupancy: 760,
        status: 'NEAR_FULL',
        riskLevel: 'MEDIUM',
        isRecommended: false,
        contact: { person: 'BDO Marsaghai', phone: '+91 6727 220114' },
        facilities: ['First Aid', 'Dry Ration Packets', 'Solar Lighting'],
        elevationMeters: 24,
        roadCondition: 'Waterlogged at outer approach (Use Tractor/Boats)',
      },
      {
        shelterId: 'SH-04',
        name: 'Bhubaneswar KIIT Disaster Relief Center',
        locationName: 'Patia, Bhubaneswar',
        address: 'KIIT Campus 6, Patia, Bhubaneswar',
        district: 'Khordha',
        state: 'Odisha',
        location: { type: 'Point', coordinates: [85.8192, 20.3541] },
        totalCapacity: 3500,
        currentOccupancy: 1120,
        status: 'ACTIVE',
        riskLevel: 'LOW',
        isRecommended: true,
        contact: { person: 'Relief Coordinator KIIT', phone: '+91 674 2725113' },
        facilities: ['State-of-art Medical Ward', 'Ambulance Station', 'Hot Meals', 'Sanitation Kits', 'Wi-Fi Emergency Mesh'],
        elevationMeters: 55,
        roadCondition: 'All NH16 High-Speed Routes Open',
      },
      {
        shelterId: 'SH-05',
        name: 'Banki Sub-Divisional Flood Shelter',
        locationName: 'Banki, Mahanadi Bank',
        address: 'Near Old Tehsil Office, Banki, Cuttack',
        district: 'Cuttack',
        state: 'Odisha',
        location: { type: 'Point', coordinates: [85.5312, 20.3802] },
        totalCapacity: 650,
        currentOccupancy: 650,
        status: 'FULL',
        riskLevel: 'HIGH',
        isRecommended: false,
        contact: { person: 'Tehsildar Banki', phone: '+91 671 2894102' },
        facilities: ['Basic First Aid', 'Purified Water'],
        elevationMeters: 30,
        roadCondition: 'Access road submerged by 0.6m; NDRF boats assisting',
      },
    ];

    for (const s of sheltersData) {
      const exists = await Shelter.findOne({ shelterId: s.shelterId });
      if (!exists) {
        await Shelter.create(s);
        logger.info(`Created shelter: ${s.name}`);
      }
    }

    // 3. Seed Rescue Teams
    logger.info('--- Seeding Tactical Rescue Squads ---');
    const teamsData = [
      {
        teamName: '03rd NDRF Battalion Unit (Mundali)',
        teamCode: 'NDRF-03',
        district: 'Cuttack',
        state: 'Odisha',
        teamLead: createdUsers['rescue'] ? createdUsers['rescue']._id : null,
        members: createdUsers['rescue'] ? [createdUsers['rescue']._id] : [],
        currentLocation: { type: 'Point', coordinates: [85.861, 20.482] },
        status: 'DEPLOYED',
        vehicles: [
          { vehicleId: 'NDRF-BOAT-01', vehicleType: 'Inflatable Motor Boat (IRB)', status: 'DEPLOYED', capacity: 12, fuelPercent: 100 },
          { vehicleId: 'NDRF-BOAT-02', vehicleType: 'Rigid Inflatable Boat (RIB)', status: 'AVAILABLE', capacity: 15, fuelPercent: 95 },
        ],
        resources: { lifeJackets: 40, firstAidKits: 10, rescueBoats: 4, ropes: 20 },
      },
      {
        teamName: 'ODRAF Quick Response Unit 01 (Bhubaneswar)',
        teamCode: 'ODRAF-01',
        district: 'Khordha',
        state: 'Odisha',
        teamLead: createdUsers['rescue'] ? createdUsers['rescue']._id : null,
        members: createdUsers['rescue'] ? [createdUsers['rescue']._id] : [],
        currentLocation: { type: 'Point', coordinates: [85.8245, 20.2961] },
        status: 'AVAILABLE',
        vehicles: [
          { vehicleId: 'ODRAF-BOAT-01', vehicleType: 'Fiberglass Rescue Boat', status: 'AVAILABLE', capacity: 10, fuelPercent: 100 },
        ],
        resources: { lifeJackets: 30, firstAidKits: 8, rescueBoats: 3, ropes: 15 },
      },
      {
        teamName: 'Odisha Fire & Emergency Water Rescue Wing',
        teamCode: 'OFES-04',
        district: 'Cuttack',
        state: 'Odisha',
        teamLead: createdUsers['rescue'] ? createdUsers['rescue']._id : null,
        members: createdUsers['rescue'] ? [createdUsers['rescue']._id] : [],
        currentLocation: { type: 'Point', coordinates: [85.8621, 20.4625] },
        status: 'AVAILABLE',
        vehicles: [
          { vehicleId: 'FIRE-BOAT-03', vehicleType: 'Swift Water Inflatable Raft', status: 'AVAILABLE', capacity: 8, fuelPercent: 90 },
        ],
        resources: { lifeJackets: 25, firstAidKits: 5, rescueBoats: 2, ropes: 12 },
      },
    ];

    const createdTeams = {};
    for (const t of teamsData) {
      let team = await RescueTeam.findOne({ teamCode: t.teamCode });
      if (!team) {
        team = await RescueTeam.create(t);
        logger.info(`Created rescue team: ${t.teamName}`);
      }
      createdTeams[t.teamCode] = team;
    }

    // 4. Seed Emergency Requests
    logger.info('--- Seeding Emergency SOS Distress Beacons ---');
    const emergenciesData = [
      {
        requestId: 'SOS-8801',
        priorityScore: 97,
        priorityLevel: 'CRITICAL',
        location: { type: 'Point', coordinates: [85.851, 20.4798] },
        address: 'Bidanasi Lower Basti, Ward 4, Cuttack',
        totalPeople: 8,
        childrenCount: 1,
        elderlyCount: 2,
        waterSeverity: 'SEVERE',
        description: 'Water reached 1st floor ceiling. Family shifted to roof. No drinking water for 8 hours. Flashlights active.',
        contact: { name: 'Debendra Swain', phone: '+91 98610 23412' },
        assignedTeam: createdTeams['NDRF-03'] ? createdTeams['NDRF-03']._id : null,
        status: 'DISPATCHED',
      },
      {
        requestId: 'SOS-8802',
        priorityScore: 99,
        priorityLevel: 'CRITICAL',
        location: { type: 'Point', coordinates: [85.912, 20.459] },
        address: 'Near Old Jagannath Road, Chauliaganj',
        totalPeople: 3,
        elderlyCount: 1,
        medicalEmergency: true,
        waterSeverity: 'HIGH',
        description: 'Patient 68yo missed dialysis today. Oxygen concentrator running on dying battery. Urgent boat stretcher needed.',
        contact: { name: 'Mamata Panda', phone: '+91 94370 88219' },
        assignedTeam: createdTeams['ODRAF-01'] ? createdTeams['ODRAF-01']._id : null,
        status: 'ON_SCENE',
      },
      {
        requestId: 'SOS-8803',
        priorityScore: 82,
        priorityLevel: 'HIGH',
        location: { type: 'Point', coordinates: [85.859, 20.485] },
        address: 'Tulasipur Riverfront Colony, Cuttack',
        totalPeople: 6,
        childrenCount: 2,
        waterSeverity: 'HIGH',
        description: 'Compound wall gave way under river backwater surge. Family standing on wooden tables.',
        contact: { name: 'Niranjan Behera', phone: '+91 99371 54820' },
        assignedTeam: createdTeams['OFES-04'] ? createdTeams['OFES-04']._id : null,
        status: 'DISPATCHED',
      },
      {
        requestId: 'SOS-8804',
        priorityScore: 68,
        priorityLevel: 'MEDIUM',
        location: { type: 'Point', coordinates: [85.798, 20.512] },
        address: 'Nuapatna Weaver Cluster, Cuttack Outer',
        totalPeople: 2,
        elderlyCount: 2,
        waterSeverity: 'MEDIUM',
        description: 'Power cut off, water entered ground floor. Couple is mobile but unable to wade through strong current.',
        contact: { name: 'Anasuya Das', phone: '+91 97760 19022' },
        status: 'PENDING',
      },
    ];

    for (const e of emergenciesData) {
      const exists = await EmergencyRequest.findOne({ requestId: e.requestId });
      if (!exists) {
        await EmergencyRequest.create(e);
        logger.info(`Created emergency: ${e.requestId} [${e.priorityLevel}]`);
      }
    }

    // 5. Seed Citizen Reports
    logger.info('--- Seeding Citizen Crowd-Sourced Reports ---');
    const reportsData = [
      {
        reportId: 'REP-401',
        location: { type: 'Point', coordinates: [85.8521, 20.4795] },
        address: 'Bidanasi Embankment, Cuttack',
        waterLevel: 'HIGH',
        roadStatus: 'BLOCKED',
        description: 'Mahanadi backwater is breaching near the sluice gate. 20 houses inundated in lower ward.',
        verificationStatus: 'VERIFIED',
        aiAnalysis: {
          status: 'COMPLETED',
          floodDetected: true,
          confidence: 0.96,
          severity: 'HIGH',
          estimatedWaterDepthMeters: 1.18,
          waterCoveragePercent: 75,
          roadCondition: 'BLOCKED',
          vehicleTravelRecommendation: 'NOT_RECOMMENDED',
          hazardObjects: ['Breached embankment', 'Submerged vehicles'],
        },
      },
      {
        reportId: 'REP-402',
        location: { type: 'Point', coordinates: [85.8995, 20.4682] },
        address: 'Jobra Barrage Road, Cuttack',
        waterLevel: 'MEDIUM',
        roadStatus: 'PARTIALLY_BLOCKED',
        description: 'Drainage overflowed onto the highway. Sedans and autos stuck. NDRF barricading lane.',
        verificationStatus: 'VERIFIED',
        aiAnalysis: {
          status: 'COMPLETED',
          floodDetected: true,
          confidence: 0.91,
          severity: 'MEDIUM',
          estimatedWaterDepthMeters: 0.58,
          waterCoveragePercent: 45,
          roadCondition: 'PARTIALLY_BLOCKED',
          vehicleTravelRecommendation: 'CAUTION',
          hazardObjects: ['Stuck sedan', 'Waterlogged lane'],
        },
      },
      {
        reportId: 'REP-403',
        location: { type: 'Point', coordinates: [86.415, 20.4988] },
        address: 'Marsaghai Canal Bridge, Kendrapara',
        waterLevel: 'SEVERE',
        roadStatus: 'BLOCKED',
        description: '3 families with infants are waving red cloths from the rooftop of community center.',
        verificationStatus: 'ESCALATED',
        aiAnalysis: {
          status: 'COMPLETED',
          floodDetected: true,
          confidence: 0.98,
          severity: 'SEVERE',
          estimatedWaterDepthMeters: 1.85,
          waterCoveragePercent: 90,
          roadCondition: 'BLOCKED',
          vehicleTravelRecommendation: 'NOT_RECOMMENDED',
          hazardObjects: ['Rooftop stranded victims', 'Deep flood current'],
        },
      },
    ];

    for (const r of reportsData) {
      const exists = await CitizenReport.findOne({ reportId: r.reportId });
      if (!exists) {
        await CitizenReport.create(r);
        logger.info(`Created report: ${r.reportId}`);
      }
    }

    // 6. Seed Broadcast Alert
    logger.info('--- Seeding Broadcast Alerts ---');
    const alertExists = await Alert.findOne({ title: { $regex: /Hirakud/i } });
    if (!alertExists) {
      await Alert.create({
        alertType: 'CRITICAL',
        title: 'FLASH FLOOD RED ALERT: Hirakud Reservoir 28 Sluice Gates Opened',
        message: 'Mahanadi river water level at Naraj Barrage has breached danger mark (26.85m). All low-lying riverside communities must evacuate immediately to designated relief shelters.',
        messageHi: 'महानदी का जलस्तर खतरे के निशान (26.85 मीटर) को पार कर गया है। निचले इलाकों के सभी नागरिक तुरंत निकटतम राहत शिविरों में जाएं।',
        messageOr: 'ମହାନଦୀ ନରାଜ ବ୍ୟାରେଜ୍ ଠାରେ ବିପଦ ସଙ୍କେତ (୨୬.୮୫ ମିଟର) ଟପିଛି। ନିମ୍ନାଞ୍ଚଳ ବାସିନ୍ଦା ତୁରନ୍ତ ବାତ୍ୟା ଓ ବନ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ।',
        targetAreas: ['Bidanasi', 'Chauliaganj', 'Banki', 'Tulasipur', 'Marsaghai'],
        deliveryChannels: ['push', 'sms', 'email', 'siren'],
        isActive: true,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
        createdByName: 'State Emergency Operation Center (SEOC)',
      });
      logger.info('Created master red alert broadcast.');
    }

    await mongoose.connection.close();
    logger.info('✅ Master Database Seeding Completed Successfully! All collections populated.');
  } catch (error) {
    logger.error(`Master seed error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAll();
}

module.exports = seedAll;
