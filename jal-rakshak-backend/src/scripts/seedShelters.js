require('dotenv').config();
const mongoose = require('mongoose');
const Shelter = require('../models/Shelter');
const logger = require('../utils/logger');

const initialShelters = [
  {
    shelterId: 'SH-01',
    name: 'Barabati Multi-Purpose Cyclone & Flood Shelter',
    locationName: 'Bidanasi, Cuttack',
    address: 'Near Barabati Stadium Ring Road, Bidanasi, Cuttack',
    district: 'Cuttack',
    state: 'Odisha',
    location: {
      type: 'Point',
      coordinates: [85.8654, 20.4812],
    },
    totalCapacity: 1200,
    currentOccupancy: 840,
    status: 'ACTIVE',
    riskLevel: 'LOW',
    isRecommended: true,
    contact: {
      person: 'Sub-Collector Cuttack',
      phone: '+91 671 2304921',
      email: 'shelter.barabati@odisha.gov.in',
    },
    facilities: [
      'Medical Aid Camp',
      'Drinking Water Plant',
      '24/7 Diesel Generator',
      'Community Kitchen',
      'Women & Child Room',
    ],
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
    location: {
      type: 'Point',
      coordinates: [85.8942, 20.4638],
    },
    totalCapacity: 2500,
    currentOccupancy: 1980,
    status: 'ACTIVE',
    riskLevel: 'LOW',
    isRecommended: true,
    contact: {
      person: 'Prof. S. Tripathy (Nodal Officer)',
      phone: '+91 671 2201987',
      email: 'relief.ravenshaw@gov.in',
    },
    facilities: [
      'Field Hospital',
      'Helipad Access',
      'Clean Water',
      'Food Packets',
      'Power Backup',
      'Livestock Enclosure',
    ],
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
    location: {
      type: 'Point',
      coordinates: [86.421, 20.5015],
    },
    totalCapacity: 800,
    currentOccupancy: 760,
    status: 'NEAR_FULL',
    riskLevel: 'MEDIUM',
    isRecommended: false,
    contact: {
      person: 'Block Development Officer Marsaghai',
      phone: '+91 6727 220114',
    },
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
    location: {
      type: 'Point',
      coordinates: [85.8192, 20.3541],
    },
    totalCapacity: 3500,
    currentOccupancy: 1120,
    status: 'ACTIVE',
    riskLevel: 'LOW',
    isRecommended: true,
    contact: {
      person: 'Relief Coordinator KIIT',
      phone: '+91 674 2725113',
    },
    facilities: [
      'State-of-art Medical Ward',
      'Ambulance Station',
      'Hot Meals',
      'Sanitation Kits',
      'Wi-Fi Emergency Mesh',
    ],
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
    location: {
      type: 'Point',
      coordinates: [85.5312, 20.3802],
    },
    totalCapacity: 650,
    currentOccupancy: 650,
    status: 'FULL',
    riskLevel: 'HIGH',
    isRecommended: false,
    contact: {
      person: 'Tehsildar Banki',
      phone: '+91 671 2894102',
    },
    facilities: ['Basic First Aid', 'Purified Water'],
    elevationMeters: 30,
    roadCondition: 'Access road submerged by 0.6m; NDRF boats assisting',
  },
];

const seedShelters = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
    await mongoose.connect(mongoURI);

    logger.info('Connected to MongoDB for shelter seeding...');

    for (const s of initialShelters) {
      const exists = await Shelter.findOne({ shelterId: s.shelterId });
      if (!exists) {
        await Shelter.create(s);
        logger.info(`Seeded shelter: ${s.name} (${s.shelterId})`);
      } else {
        logger.info(`Shelter ${s.shelterId} already exists.`);
      }
    }

    await mongoose.connection.close();
    logger.info('Shelter seed completed.');
  } catch (error) {
    logger.error(`Shelter seed error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedShelters();
}

module.exports = seedShelters;
