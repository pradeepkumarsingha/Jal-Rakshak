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

    // 1. Seed Users
    logger.info('--- Seeding Users ---');
    const usersData = [
      {
        fullName: 'Ramesh Mohanty',
        email: 'ramesh.citizen@jalrakshak.org',
        password: 'password123',
        role: 'citizen',
        phone: '+91 98612 34567',
        district: 'Cuttack',
        state: 'Odisha',
        location: { type: 'Point', coordinates: [85.8621, 20.4782], address: 'Bidanasi, Cuttack' },
        familyMembers: 4,
      },
      {
        fullName: 'Dr. Anita Sharma (IAS)',
        email: 'anita.src@odisha.gov.in',
        password: 'password123',
        role: 'admin',
        phone: '+91 674 2534100',
        district: 'State Disaster Ops Center',
        designation: 'Special Relief Commissioner (SRC)',
        state: 'Odisha',
        location: { type: 'Point', coordinates: [85.8245, 20.2961], address: 'Secretariat, Bhubaneswar' },
      },
      {
        fullName: 'Cmdr. Vikram Rathore',
        email: 'vikram.ndrf@gov.in',
        password: 'password123',
        role: 'rescue',
        unitId: 'TEAM-NDRF-07',
        phone: '+91 98110 54321',
        battalion: '03rd NDRF Battalion, Mundali',
        state: 'Odisha',
        location: { type: 'Point', coordinates: [85.861, 20.482], address: 'Mundali Basecamp, Cuttack' },
      },
    ];

    const createdUsers = {};
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        logger.info(`Created user: ${u.email} [${u.role}]`);
      }
      createdUsers[u.role] = user;
    }

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
        teamId: 'TEAM-NDRF-07',
        name: 'NDRF 03rd Battalion (Unit 07 - Bravo)',
        commander: 'Inspector Vikram Rathore',
        phone: '+91 98110 54321',
        unitType: 'Inflatable Motor Boat (IRB) & Dive Team',
        capacityPersons: 16,
        locationName: 'Bidanasi Ghat Basecamp',
        currentLocation: { type: 'Point', coordinates: [85.861, 20.482] },
        status: 'ON_MISSION',
        equipment: ['2x Gemini 40HP Inflatable Boats', '12x Life Jackets', 'Satellite Comm Radio', 'First Aid Trauma Kit', 'Hydraulic Cutters'],
      },
      {
        teamId: 'TEAM-ODRAF-02',
        name: 'ODRAF Specialized Unit 02 (Medical Evac)',
        commander: 'Sub-Inspector Tapas Nayak',
        phone: '+91 94371 99012',
        unitType: 'Heavy Rescue Amphibious Craft',
        capacityPersons: 12,
        locationName: 'Chauliaganj Embankment Point',
        currentLocation: { type: 'Point', coordinates: [85.908, 20.461] },
        status: 'ON_SCENE',
        equipment: ['Amphibious Stretcher Craft', 'Portable Oxygen Cylinder', 'AED Defibrillator', 'Floating Rope Throw Bags'],
      },
      {
        teamId: 'TEAM-SDRF-ALPHA',
        name: 'SDRF Team Alpha (Evacuation Support)',
        commander: 'Officer Sangram Rout',
        phone: '+91 99380 44109',
        unitType: 'High-Clearance 4x4 Truck + FRP Rescue Boat',
        capacityPersons: 20,
        locationName: 'Tulasipur Cantonment Road',
        currentLocation: { type: 'Point', coordinates: [85.865, 20.488] },
        status: 'DISPATCHED',
        equipment: ['FRP Rigid Rescue Boat', 'Searchlights (5000 Lumens)', 'Life Buoys', 'Megaphones'],
      },
      {
        teamId: 'TEAM-VOLUNTEER-01',
        name: 'Civil Defense Volunteer Boat Group',
        commander: 'Captain (Retd.) A. K. Patnaik',
        phone: '+91 94380 11223',
        unitType: 'Country Motorized Boats (x3)',
        capacityPersons: 24,
        locationName: 'Jobra Barrage Staging Area',
        currentLocation: { type: 'Point', coordinates: [85.898, 20.469] },
        status: 'STANDBY_READY',
        equipment: ['3x Motorized River Country Crafts', '30x Life Vests', 'Dry Food & Water Crates'],
      },
    ];

    const createdTeams = {};
    for (const t of teamsData) {
      let team = await RescueTeam.findOne({ teamId: t.teamId });
      if (!team) {
        team = await RescueTeam.create(t);
        logger.info(`Created rescue team: ${t.name}`);
      }
      createdTeams[t.teamId] = team;
    }

    // 4. Seed Emergency Requests
    logger.info('--- Seeding Emergency SOS Distress Beacons ---');
    const emergenciesData = [
      {
        requestId: 'SOS-8801',
        category: 'Rooftop Stranded + Infants',
        priorityScore: 97,
        priorityLevel: 'CRITICAL',
        location: { type: 'Point', coordinates: [85.851, 20.4798] },
        address: 'Bidanasi Lower Basti, Ward 4, Cuttack',
        totalPeople: 8,
        childrenCount: 1,
        infantsCount: 2,
        elderlyCount: 2,
        victims: { infants: 2, children: 1, adults: 3, elderly: 2, pregnant: 0 },
        waterDepth: '2.1 meters (First floor inundated)',
        waterSeverity: 'SEVERE',
        description: 'Water reached 1st floor ceiling. Family shifted to roof. No drinking water for 8 hours. Flashlights active.',
        contact: { name: 'Debendra Swain', phone: '+91 98610 23412' },
        assignedTeamName: 'NDRF Unit 07 (Bravo Boat)',
        assignedTeam: createdTeams['TEAM-NDRF-07'] ? createdTeams['TEAM-NDRF-07']._id : null,
        status: 'IN_PROGRESS',
        etaMinutes: 14,
      },
      {
        requestId: 'SOS-8802',
        category: 'Critical Medical (Dialysis Patient)',
        priorityScore: 99,
        priorityLevel: 'CRITICAL',
        location: { type: 'Point', coordinates: [85.912, 20.459] },
        address: 'Near Old Jagannath Road, Chauliaganj',
        totalPeople: 3,
        victims: { infants: 0, children: 0, adults: 2, elderly: 1, pregnant: 0 },
        medicalEmergency: true,
        waterDepth: '1.4 meters',
        waterSeverity: 'HIGH',
        description: 'Patient 68yo missed dialysis today. Oxygen concentrator running on dying battery. Urgent boat stretcher needed.',
        contact: { name: 'Mamata Panda', phone: '+91 94370 88219' },
        assignedTeamName: 'ODRAF Quick Response 02',
        assignedTeam: createdTeams['TEAM-ODRAF-02'] ? createdTeams['TEAM-ODRAF-02']._id : null,
        status: 'ON_SCENE',
        etaMinutes: 2,
      },
      {
        requestId: 'SOS-8803',
        category: 'Collapsed Boundary Wall & Rising Surge',
        priorityScore: 82,
        priorityLevel: 'HIGH',
        location: { type: 'Point', coordinates: [85.859, 20.485] },
        address: 'Tulasipur Riverfront Colony, Cuttack',
        totalPeople: 6,
        victims: { infants: 1, children: 2, adults: 3, elderly: 0, pregnant: 1 },
        waterDepth: '1.1 meters',
        waterSeverity: 'HIGH',
        description: 'Compound wall gave way under river backwater surge. Family standing on wooden tables.',
        contact: { name: 'Niranjan Behera', phone: '+91 99371 54820' },
        assignedTeamName: 'SDRF Alpha Squad',
        assignedTeam: createdTeams['TEAM-SDRF-ALPHA'] ? createdTeams['TEAM-SDRF-ALPHA']._id : null,
        status: 'DISPATCHED',
        etaMinutes: 22,
      },
      {
        requestId: 'SOS-8804',
        category: 'Elderly Couple Stranded with Pets',
        priorityScore: 68,
        priorityLevel: 'MEDIUM',
        location: { type: 'Point', coordinates: [85.798, 20.512] },
        address: 'Nuapatna Weaver Cluster, Cuttack Outer',
        totalPeople: 2,
        victims: { infants: 0, children: 0, adults: 0, elderly: 2, pregnant: 0 },
        waterDepth: '0.8 meters',
        waterSeverity: 'MEDIUM',
        description: 'Power cut off, water entered ground floor. Couple is mobile but unable to wade through strong current.',
        contact: { name: 'Anasuya Das', phone: '+91 97760 19022' },
        status: 'PENDING_ASSIGNMENT',
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
        userName: 'Subhasish Dash',
        location: { type: 'Point', coordinates: [85.8521, 20.4795] },
        address: 'Bidanasi Embankment, Cuttack',
        waterLevel: 'HIGH',
        waterDepth: '1.2 meters (Waist Level)',
        category: 'Embankment Seepage & Road Cutoff',
        description: 'Mahanadi backwater is breaching near the sluice gate. 20 houses inundated in lower ward.',
        imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        trappedPeople: 45,
        needsBoat: true,
        verificationStatus: 'VERIFIED',
        aiAnalysis: {
          floodDetected: true,
          confidence: 96,
          estimatedWaterDepth: 1.18,
          depthCategory: 'Waist Level (~1.18m)',
          roadCondition: 'Submerged',
          hazardObjectsDetected: ['Breached embankment', 'Submerged vehicles'],
          recommendedPriority: 'HIGH',
          suggestedEvacuation: true,
        },
      },
      {
        reportId: 'REP-402',
        userName: 'Priyanka Mohapatra',
        location: { type: 'Point', coordinates: [85.8995, 20.4682] },
        address: 'Jobra Barrage Road, Cuttack',
        waterLevel: 'MEDIUM',
        waterDepth: '0.6 meters (Knee Level)',
        category: 'Waterlogged Main Arterial Road',
        description: 'Drainage overflowed onto the highway. Sedans and autos stuck. NDRF barricading lane.',
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
        trappedPeople: 0,
        needsBoat: false,
        verificationStatus: 'VERIFIED',
        aiAnalysis: {
          floodDetected: true,
          confidence: 91,
          estimatedWaterDepth: 0.58,
          depthCategory: 'Knee Level (~0.58m)',
          roadCondition: 'Partially Blocked',
          hazardObjectsDetected: ['Stuck sedan', 'Waterlogged lane'],
          recommendedPriority: 'MEDIUM',
          suggestedEvacuation: false,
        },
      },
      {
        reportId: 'REP-403',
        userName: 'Alok Jena',
        location: { type: 'Point', coordinates: [86.415, 20.4988] },
        address: 'Marsaghai Canal Bridge, Kendrapara',
        waterLevel: 'SEVERE',
        waterDepth: '1.8 meters (Chest Level)',
        category: 'Trapped Families on Roof',
        description: '3 families with infants are waving red cloths from the rooftop of community center.',
        imageUrl: 'https://images.unsplash.com/photo-1600336153113-d66c79de3e91?auto=format&fit=crop&w=800&q=80',
        trappedPeople: 14,
        needsBoat: true,
        verificationStatus: 'ESCALATED_TO_RESCUE',
        aiAnalysis: {
          floodDetected: true,
          confidence: 98,
          estimatedWaterDepth: 1.85,
          depthCategory: 'Chest Level (~1.85m)',
          roadCondition: 'Completely Blocked',
          hazardObjectsDetected: ['Rooftop stranded victims', 'Deep flood current'],
          recommendedPriority: 'CRITICAL',
          suggestedEvacuation: true,
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
