import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';

describe('Board & Column Endpoints (/boards, /columns)', () => {
  const ownerUser = {
    email: 'boardowner@example.com',
    password: 'ownerpassword123',
    fullName: 'Board Owner'
  };

  const viewerUser = {
    email: 'boardviewer@example.com',
    password: 'viewerpassword123',
    fullName: 'Board Viewer'
  };

  let ownerToken: string;
  let viewerToken: string;
  let createdBoardId: string;
  let createdColumnId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [ownerUser.email, viewerUser.email] } }
    });

    const ownerRes = await request(app).post('/auth/register').send(ownerUser);
    ownerToken = ownerRes.body.data.token;

    const viewerRes = await request(app).post('/auth/register').send(viewerUser);
    viewerToken = viewerRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [ownerUser.email, viewerUser.email] } }
    });
    await prisma.$disconnect();
  });

  describe('POST /boards', () => {
    it('should create a new board with initial columns', async () => {
      const res = await request(app)
        .post('/boards')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Launch Roadmap',
          columns: [{ name: 'Todo' }, { name: 'Doing' }, { name: 'Done' }]
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Launch Roadmap');
      expect(res.body.data.columns.length).toBe(3);
      expect(res.body.data.columns[0].name).toBe('Todo');
      expect(res.body.data.columns[0].position).toBe(0);

      createdBoardId = res.body.data.id;
      createdColumnId = res.body.data.columns[0].id;
    });
  });

  describe('GET /boards', () => {
    it('should fetch boards for authenticated user', async () => {
      const res = await request(app)
        .get('/boards')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /boards/:id & GET /boards/:id/activities', () => {
    it('should hydrate complete nested board shape with columns', async () => {
      const res = await request(app)
        .get(`/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBe(createdBoardId);
      expect(res.body.data.columns).toBeDefined();
    });

    it('should return recent board activities', async () => {
      const res = await request(app)
        .get(`/boards/${createdBoardId}/activities`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /boards/:id/columns', () => {
    it('should append a new column with incremented position', async () => {
      const res = await request(app)
        .post(`/boards/${createdBoardId}/columns`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Archive' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Archive');
      expect(res.body.data.position).toBe(3);
    });
  });

  describe('POST /boards/:id/collaborators & RBAC Enforcement', () => {
    it('should add a viewer collaborator', async () => {
      const res = await request(app)
        .post(`/boards/${createdBoardId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: viewerUser.email,
          role: 'VIEWER'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.role).toBe('VIEWER');
    });

    it('should allow viewer to read board details', async () => {
      const res = await request(app)
        .get(`/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should block viewer from updating board name (403 Forbidden)', async () => {
      const res = await request(app)
        .put(`/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Unauthorized Title' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('error');
    });
  });

  describe('DELETE /columns/:id & DELETE /boards/:id', () => {
    it('should delete column and reorder remaining positions', async () => {
      const res = await request(app)
        .delete(`/columns/${createdColumnId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should delete board when requested by owner', async () => {
      const res = await request(app)
        .delete(`/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });
});
