const request = require('supertest');
const app = require('../src/server');

describe('Emergency SOS Endpoints', () => {
  it('should create an emergency SOS request with automated priority scoring', async () => {
    const res = await request(app)
      .post('/api/v1/emergency/request')
      .send({
        category: 'Rooftop Stranded + Infants',
        address: 'Bidanasi Lower Basti, Ward 4',
        totalPeople: 6,
        victims: { infants: 2, children: 1, adults: 2, elderly: 1, pregnant: 0 },
        medicalEmergency: true,
        waterSeverity: 'SEVERE',
        waterDepth: '2.0 meters',
        roadAccess: 'BLOCKED',
        contactName: 'Debendra Swain',
        contactPhone: '+91 98610 23412',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.priorityScore).toBeGreaterThanOrEqual(80);
    expect(res.body.data.priorityLevel).toBe('CRITICAL');
  });

  it('should list all emergency requests', async () => {
    const res = await request(app).get('/api/v1/emergency/requests');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
