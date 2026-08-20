const { SEVERITY_LEVELS, WATER_SEVERITY, ROAD_ACCESS } = require('../utils/constants');

/**
 * Calculate Emergency Priority Score (0 - 100) and Level
 * Considers:
 * - Victims count & vulnerable demographics (infants, elderly, pregnant)
 * - Medical emergency flag
 * - Water depth / severity
 * - Road access cutoff
 */
const calculateEmergencyPriority = ({
  totalPeople = 1,
  victims = {},
  medicalEmergency = false,
  waterSeverity = 'MEDIUM',
  waterDepth = '1.0m',
  roadAccess = 'UNKNOWN',
}) => {
  let score = 20; // Base baseline score

  const infants = Number(victims.infants || 0);
  const children = Number(victims.children || 0);
  const elderly = Number(victims.elderly || 0);
  const pregnant = Number(victims.pregnant || 0);
  const people = Number(totalPeople || 1);

  // 1. Demographic Vulnerability Factors (up to 35 pts)
  if (infants > 0) score += Math.min(15, infants * 8);
  if (pregnant > 0) score += Math.min(15, pregnant * 10);
  if (elderly > 0) score += Math.min(12, elderly * 5);
  if (children > 0) score += Math.min(8, children * 3);
  if (people > 5) score += Math.min(10, (people - 5) * 2);

  // 2. Critical Medical Emergency (up to 30 pts)
  if (medicalEmergency) {
    score += 28;
  }

  // 3. Water Inundation Severity (up to 25 pts)
  const normWater = String(waterSeverity).toUpperCase();
  if (normWater === WATER_SEVERITY.SEVERE || normWater === 'CRITICAL' || String(waterDepth).includes('2.') || String(waterDepth).includes('First floor')) {
    score += 25;
  } else if (normWater === WATER_SEVERITY.HIGH || String(waterDepth).includes('Waist') || String(waterDepth).includes('1.')) {
    score += 18;
  } else if (normWater === WATER_SEVERITY.MEDIUM || String(waterDepth).includes('Knee')) {
    score += 10;
  } else {
    score += 4;
  }

  // 4. Road Cutoff & Isolation (up to 15 pts)
  const normRoad = String(roadAccess).toUpperCase();
  if (normRoad === ROAD_ACCESS.BLOCKED || normRoad === 'CUT_OFF') {
    score += 15;
  } else if (normRoad === ROAD_ACCESS.PARTIALLY_BLOCKED) {
    score += 8;
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(10, Math.round(score)));

  // Determine Level
  let level = SEVERITY_LEVELS.LOW;
  if (finalScore >= 85) {
    level = SEVERITY_LEVELS.CRITICAL;
  } else if (finalScore >= 70) {
    level = SEVERITY_LEVELS.HIGH;
  } else if (finalScore >= 50) {
    level = SEVERITY_LEVELS.MEDIUM;
  } else if (finalScore >= 35) {
    level = SEVERITY_LEVELS.MODERATE;
  }

  return {
    priorityScore: finalScore,
    priorityLevel: level,
  };
};

module.exports = {
  calculateEmergencyPriority,
};
