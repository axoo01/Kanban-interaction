import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';

describe('Authentication Endpoints (/auth)', () => {
  const testUser = {
    email: 'testuser@example.com',
    password: 'securepassword123',
    fullName: 'Test User'
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.fullName).toBe(testUser.fullName);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject registration with duplicate email (409)', async () => {
      const res = await request(app).post('/auth/register').send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('already registered');
    });

    it('should reject registration with invalid payload (400)', async () => {
      const res = await request(app).post('/auth/register').send({
        email: 'invalid-email',
        password: '123'
      });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate valid user credentials (200)', async () => {
      const res = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should reject invalid password (401)', async () => {
      const res = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword'
      });
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /auth/me & PATCH /auth/theme', () => {
    let authToken: string;

    beforeAll(async () => {
      const res = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });
      authToken = res.body.data.token;
    });

    it('should reject request without Bearer token (401)', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('should return authenticated user profile with valid token (200)', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.fullName).toBe(testUser.fullName);
    });

    it('should update theme preference (200)', async () => {
      const res = await request(app)
        .patch('/auth/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ themePreference: 'light' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.themePreference).toBe('light');
    });
  });
});
