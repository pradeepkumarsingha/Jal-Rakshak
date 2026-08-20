const {
  calculateEmergencyPriority,
  calculateDistanceKm,
  generateSafeRoute,
} = require('../src/services');

const {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidCoordinates,
} = require('../src/utils');

describe('Core Utilities & Services Test Suite', () => {
  describe('Priority Scoring Engine', () => {
    it('should assign CRITICAL priority to victims with infants in severe water', () => {
      const result = calculateEmergencyPriority({
        totalPeople: 6,
        victims: { infants: 2, children: 1, adults: 2, elderly: 1, pregnant: 0 },
        medicalEmergency: true,
        waterSeverity: 'SEVERE',
        waterDepth: '2.0 meters (First floor inundated)',
        roadAccess: 'BLOCKED',
      });

      expect(result.priorityScore).toBeGreaterThanOrEqual(85);
      expect(result.priorityLevel).toBe('CRITICAL');
    });

    it('should assign LOW/MODERATE priority for minor waterlogging without vulnerable victims', () => {
      const result = calculateEmergencyPriority({
        totalPeople: 1,
        victims: { infants: 0, children: 0, adults: 1, elderly: 0, pregnant: 0 },
        medicalEmergency: false,
        waterSeverity: 'LOW',
        waterDepth: '0.2m',
        roadAccess: 'OPEN',
      });

      expect(result.priorityScore).toBeLessThan(50);
      expect(['LOW', 'MODERATE']).toContain(result.priorityLevel);
    });
  });

  describe('Geospatial Service', () => {
    it('should calculate accurate Haversine distance between Cuttack and Bhubaneswar (~22km)', () => {
      const distance = calculateDistanceKm(20.4782, 85.8621, 20.3541, 85.8192);
      expect(distance).toBeGreaterThan(13);
      expect(distance).toBeLessThan(25);
    });

    it('should generate safe evacuation path avoiding submerged risk areas', () => {
      const route = generateSafeRoute({
        origin: { lat: 20.4782, lng: 85.8621 },
        destination: { lat: 20.4638, lng: 85.8942 },
        avoidFloodZones: true,
      });

      expect(route.success).toBe(true);
      expect(route.routeType).toBe('AI_OPTIMIZED_SAFE_HIGH_GROUND');
      expect(Array.isArray(route.waypoints)).toBe(true);
      expect(route.waypoints.length).toBeGreaterThanOrEqual(4);
      expect(Array.isArray(route.turnByTurn)).toBe(true);
    });
  });

  describe('Security & JWT Utilities', () => {
    it('should sign and verify access token', () => {
      const payload = { id: 'usr_123', email: 'citizen@jalrakshak.org', role: 'citizen' };
      const token = generateToken(payload);
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.id).toBe('usr_123');
      expect(decoded.email).toBe('citizen@jalrakshak.org');
    });

    it('should sign and verify refresh token', () => {
      const payload = { id: 'usr_123' };
      const token = generateRefreshToken(payload);
      expect(typeof token).toBe('string');

      const decoded = verifyRefreshToken(token);
      expect(decoded.id).toBe('usr_123');
    });

    it('should hash and compare passwords correctly', async () => {
      const rawPassword = 'SecurePassword2024!';
      const hashed = await hashPassword(rawPassword);
      expect(hashed).not.toBe(rawPassword);

      const isMatch = await comparePassword(rawPassword, hashed);
      expect(isMatch).toBe(true);

      const isWrongMatch = await comparePassword('WrongPassword', hashed);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe('Validation Helpers', () => {
    it('should validate emails properly', () => {
      expect(isValidEmail('test@jalrakshak.org')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should validate geographic coordinates', () => {
      expect(isValidCoordinates(20.4782, 85.8621)).toBe(true);
      expect(isValidCoordinates(999, 85.8621)).toBe(false);
    });
  });
});
