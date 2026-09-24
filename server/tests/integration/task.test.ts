import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';

describe('Task Endpoints (/tasks)', () => {
  const testUser = {
    email: 'taskuser@example.com',
    password: 'taskpassword123',
    fullName: 'Task User'
  };

  let token: string;
  let boardId: string;
  let col1Id: string;
  let col2Id: string;

  let task1Id: string;
  let task2Id: string;
  let task3Id: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });

    const userRes = await request(app).post('/auth/register').send(testUser);
    token = userRes.body.data.token;

    const boardRes = await request(app)
      .post('/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sprint Board',
        columns: [{ name: 'Backlog' }, { name: 'In Progress' }]
      });

    boardId = boardRes.body.data.id;
    col1Id = boardRes.body.data.columns[0].id;
    col2Id = boardRes.body.data.columns[1].id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  describe('POST /tasks', () => {
    it('should create tasks with subtasks and auto-incremented positions', async () => {
      const res1 = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          columnId: col1Id,
          title: 'Task One',
          description: 'First task',
          subtasks: [{ title: 'Subtask 1' }, { title: 'Subtask 2', isCompleted: true }]
        });

      expect(res1.status).toBe(201);
      expect(res1.body.data.title).toBe('Task One');
      expect(res1.body.data.position).toBe(0);
      expect(res1.body.data.status).toBe('Backlog');
      expect(res1.body.data.subtasks.length).toBe(2);
      task1Id = res1.body.data.id;

      const res2 = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          columnId: col1Id,
          title: 'Task Two'
        });

      expect(res2.status).toBe(201);
      expect(res2.body.data.position).toBe(1);
      task2Id = res2.body.data.id;

      const res3 = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          columnId: col1Id,
          title: 'Task Three'
        });

      expect(res3.status).toBe(201);
      expect(res3.body.data.position).toBe(2);
      task3Id = res3.body.data.id;
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update task details and subtasks', async () => {
      const res = await request(app)
        .put(`/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task One Updated',
          description: 'Updated description',
          subtasks: [{ title: 'New Subtask 1' }]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Task One Updated');
      expect(res.body.data.description).toBe('Updated description');
      expect(res.body.data.subtasks.length).toBe(1);
    });
  });

  describe('PATCH /tasks/:id/move (Same Column Reorder)', () => {
    it('should reorder task within the same column (move index 0 to 2)', async () => {
      const res = await request(app)
        .patch(`/tasks/${task1Id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetColumnId: col1Id,
          newPosition: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.data.position).toBe(2);

      const boardRes = await request(app)
        .get(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      const col1Tasks = boardRes.body.data.columns[0].tasks;
      expect(col1Tasks.find((t: any) => t.id === task2Id).position).toBe(0);
      expect(col1Tasks.find((t: any) => t.id === task3Id).position).toBe(1);
      expect(col1Tasks.find((t: any) => t.id === task1Id).position).toBe(2);
    });
  });

  describe('PATCH /tasks/:id/move (Cross Column Movement)', () => {
    it('should move task to target column and update columnId, status, and position', async () => {
      const res = await request(app)
        .patch(`/tasks/${task1Id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetColumnId: col2Id,
          newPosition: 0
        });

      expect(res.status).toBe(200);
      expect(res.body.data.columnId).toBe(col2Id);
      expect(res.body.data.status).toBe('In Progress');
      expect(res.body.data.position).toBe(0);

      const boardRes = await request(app)
        .get(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      const col1Tasks = boardRes.body.data.columns[0].tasks;
      const col2Tasks = boardRes.body.data.columns[1].tasks;

      expect(col1Tasks.length).toBe(2);
      expect(col1Tasks[0].position).toBe(0);
      expect(col1Tasks[1].position).toBe(1);

      expect(col2Tasks.length).toBe(1);
      expect(col2Tasks[0].id).toBe(task1Id);
      expect(col2Tasks[0].position).toBe(0);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete task and compact positions of remaining items', async () => {
      const res = await request(app)
        .delete(`/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const boardRes = await request(app)
        .get(`/boards/${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      const col1Tasks = boardRes.body.data.columns[0].tasks;
      expect(col1Tasks.length).toBe(1);
      expect(col1Tasks[0].id).toBe(task3Id);
      expect(col1Tasks[0].position).toBe(0);
    });
  });
});
