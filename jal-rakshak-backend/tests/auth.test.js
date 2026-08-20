const request = require('supertest');
const app = require('../src/server');

describe('Auth API Endpoints', () => {
  it('should reject registration when email is missing or invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test User',
        email: 'invalid-email-format',
        password: 'password123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration when password is less than 6 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Short Password User',
        email: 'valid@jalrakshak.org',
        password: '123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login when password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'citizen@jalrakshak.org',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject access to protected /me endpoint without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow access to /me endpoint with mock token in simulation mode', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer mock-token');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('citizen');
  });

  it('should reject forgot-password when email is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'invalid-email-address',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should accept forgot-password and generate new password for citizen', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'citizen@demo.jalrakshak.org',
        portal: 'citizen',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('A new password has been enabled');
  });
});
