const request = require('supertest');
const app = require('../src/server');

describe('Flood, GIS, & AI Assistant Endpoints', () => {
  it('should return API health check', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Jal Rakshak');
  });

  it('should get flood risk prediction for Cuttack', async () => {
    const res = await request(app).get('/api/v1/flood/risk/Cuttack');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.riskScore).toBeDefined();
    expect(res.body.data.riskLevel).toBeDefined();
  });

  it('should get 24-hour predictive forecast', async () => {
    const res = await request(app).get('/api/v1/flood/forecast');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get river telemetry', async () => {
    const res = await request(app).get('/api/v1/flood/rivers');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get GIS risk polygons', async () => {
    const res = await request(app).get('/api/v1/gis/risk-map');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.features || Array.isArray(res.body.data)).toBeDefined();
  });

  it('should calculate safe evacuation route avoiding flood zones', async () => {
    const res = await request(app)
      .post('/api/v1/gis/safe-route')
      .send({
        origin: { lat: 20.4782, lng: 85.8621 },
        destination: { lat: 20.4638, lng: 85.8942 },
        avoidFloodZones: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.waypoints).toBeDefined();
    expect(res.body.data.turnByTurn).toBeDefined();
  });

  it('should interact with AI Flood Assistant with safety RAG advice', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .send({
        message: 'How to purify drinking water during floods?',
        language: 'en',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reply).toBeDefined();
    expect(res.body.citations).toBeDefined();
  });
});
