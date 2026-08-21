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

  it('should predict flood risk for coordinate payload (Bhubaneswar)', async () => {
    const res = await request(app)
      .post('/api/v1/flood/predict')
      .send({
        latitude: 20.2961,
        longitude: 85.8245,
        locationName: 'Bhubaneswar, Odisha',
        simulationMode: false,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.location.latitude).toBe(20.2961);
    expect(res.body.data.location.longitude).toBe(85.8245);
    expect(res.body.data.location.name).toBe('Bhubaneswar, Odisha');
    expect(res.body.data.riskScore).toBeDefined();
    expect(res.body.data.isSimulation).toBe(false);
  });

  it('should return simulated scenario when simulationMode is true', async () => {
    const res = await request(app)
      .post('/api/v1/flood/predict')
      .send({
        latitude: 20.4625,
        longitude: 85.8830,
        locationName: 'Cuttack (Simulation)',
        simulationMode: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.riskScore).toBe(88);
    expect(res.body.data.isSimulation).toBe(true);
    expect(res.body.data.source).toBe('simulation');
  });

  it('should reject invalid coordinates in predict endpoint', async () => {
    const res = await request(app)
      .post('/api/v1/flood/predict')
      .send({
        latitude: 195.0,
        longitude: 85.8245,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should get unified location dashboard data via GET /api/v1/dashboard/location', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/location?latitude=20.2961&longitude=85.8245')
      .set('Authorization', 'Bearer mock-token');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.location).toBeDefined();
    expect(res.body.data.location.latitude).toBe(20.2961);
    expect(res.body.data.location.longitude).toBe(85.8245);
    expect(res.body.data.dataStatus).toBeDefined();
  });
});
