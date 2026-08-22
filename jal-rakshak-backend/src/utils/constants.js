// User Roles
const ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  RESCUE: 'rescue',
};

// Emergency & Risk Severity Levels
const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

// Emergency Request Types
const EMERGENCY_TYPES = {
  RESCUE_REQUIRED: 'RESCUE_REQUIRED',
  MEDICAL_EMERGENCY: 'MEDICAL_EMERGENCY',
  FOOD_REQUIRED: 'FOOD_REQUIRED',
  WATER_REQUIRED: 'WATER_REQUIRED',
  OTHER: 'OTHER',
};

// Emergency Request Statuses
const EMERGENCY_STATUS = {
  PENDING: 'PENDING',
  PENDING_ASSIGNMENT: 'PENDING_ASSIGNMENT',
  ASSIGNED: 'ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_SCENE: 'ON_SCENE',
  RESCUED: 'RESCUED',
  CLOSED: 'CLOSED',
};

// Report Verification Statuses
const REPORT_STATUS = {
  PENDING: 'PENDING',
  PENDING_REVIEW: 'PENDING_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  ESCALATED: 'ESCALATED',
  ESCALATED_TO_RESCUE: 'ESCALATED_TO_RESCUE',
};

// Shelter Statuses
const SHELTER_STATUS = {
  OPEN: 'OPEN',
  ACTIVE: 'ACTIVE',
  NEAR_FULL: 'NEAR_FULL',
  FULL: 'FULL',
  CLOSED: 'CLOSED',
};

// Rescue Team Statuses
const RESCUE_STATUS = {
  STANDBY_READY: 'STANDBY_READY',
  DISPATCHED: 'DISPATCHED',
  ON_SCENE: 'ON_SCENE',
  ON_MISSION: 'ON_MISSION',
  OFF_DUTY: 'OFF_DUTY',
};

// Alert Types
const ALERT_TYPES = {
  NORMAL: 'NORMAL',
  WATCH: 'WATCH',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
};

// Water Severity
const WATER_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  SEVERE: 'SEVERE',
};

// Road Access
const ROAD_ACCESS = {
  OPEN: 'OPEN',
  PARTIALLY_BLOCKED: 'PARTIALLY_BLOCKED',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
};

// Shelter Facilities
const SHELTER_FACILITIES = [
  'Medical',
  'Food',
  'Water',
  'Power',
  'Toilets',
  'Wheelchair Access',
  'Medical Aid Camp',
  'Drinking Water Plant',
  '24/7 Diesel Generator',
  'Community Kitchen',
  'Women & Child Room',
  'Field Hospital',
  'Helipad Access',
  'Clean Water',
  'Food Packets',
  'Power Backup',
  'Livestock Enclosure',
  'First Aid',
  'Dry Ration Packets',
  'Solar Lighting',
  'State-of-art Medical Ward',
  'Ambulance Station',
  'Hot Meals',
  'Sanitation Kits',
  'Wi-Fi Emergency Mesh',
];

// Major Indian River & Dam Telemetry Stations
const RIVERS_TELEMETRY = [
  {
    id: 'hirakud-dam',
    name: 'Hirakud Dam (Sambalpur, Mahanadi)',
    state: 'Odisha',
    currentLevel: 629.80, // Feet (FRL: 630.00 ft)
    warningLevel: 628.00,
    dangerLevel: 630.00,
    status: 'CRITICAL',
    trend: 'RISING',
    inflow: '11.45 Lakh Cusecs',
    outflow: '11.20 Lakh Cusecs',
    gatesOpen: '28 / 64 Sluice Gates',
    capacityPct: 99.6,
    downstreamTransitTime: '~24h to Mundali / Naraj',
    coordinates: [83.8710, 21.5273],
  },
  {
    id: 'mahanadi-naraj',
    name: 'Mahanadi (Naraj Barrage, Cuttack)',
    state: 'Odisha',
    currentLevel: 26.85, // Meters (Danger mark: 26.41m)
    warningLevel: 25.41,
    dangerLevel: 26.41,
    status: 'CRITICAL',
    trend: 'RISING',
    inflow: '11.45 Lakh Cusecs',
    outflow: '11.20 Lakh Cusecs',
    gatesOpen: '28 / 64 Gates',
    coordinates: [85.8621, 20.4782],
  },
  {
    id: 'brahmani-jenapur',
    name: 'Brahmani (Jenapur Gauge)',
    state: 'Odisha',
    currentLevel: 67.20,
    warningLevel: 66.00,
    dangerLevel: 67.00,
    status: 'HIGH',
    trend: 'RISING',
    inflow: '3.80 Lakh Cusecs',
    outflow: '3.75 Lakh Cusecs',
    gatesOpen: '14 / 24 Gates',
    coordinates: [86.20, 20.85],
  },
  {
    id: 'baitarani-akhua',
    name: 'Baitarani (Akhuapada Station)',
    state: 'Odisha',
    currentLevel: 18.10,
    warningLevel: 17.83,
    dangerLevel: 18.00,
    status: 'CRITICAL',
    trend: 'STABLE',
    inflow: '1.95 Lakh Cusecs',
    outflow: '1.90 Lakh Cusecs',
    gatesOpen: 'All open',
    coordinates: [86.50, 20.70],
  },
  {
    id: 'ganga-patna',
    name: 'Ganga (Digha Ghat, Patna)',
    state: 'Bihar',
    currentLevel: 50.12,
    warningLevel: 49.50,
    dangerLevel: 50.50,
    status: 'MEDIUM',
    trend: 'RISING',
    inflow: '7.20 Lakh Cusecs',
    outflow: '7.10 Lakh Cusecs',
    gatesOpen: 'Normal flow',
    coordinates: [85.12, 25.61],
  },
  {
    id: 'yamuna-delhi',
    name: 'Yamuna (Old Railway Bridge, Delhi)',
    state: 'Delhi',
    currentLevel: 205.80,
    warningLevel: 204.50,
    dangerLevel: 205.33,
    status: 'HIGH',
    trend: 'FALLING',
    inflow: '1.45 Lakh Cusecs',
    outflow: '1.40 Lakh Cusecs',
    gatesOpen: 'Hathnikund barrage controlled',
    coordinates: [77.30, 28.66],
  },
];

module.exports = {
  ROLES,
  SEVERITY_LEVELS,
  EMERGENCY_TYPES,
  EMERGENCY_STATUS,
  REPORT_STATUS,
  SHELTER_STATUS,
  RESCUE_STATUS,
  ALERT_TYPES,
  WATER_SEVERITY,
  ROAD_ACCESS,
  SHELTER_FACILITIES,
  RIVERS_TELEMETRY,
};
