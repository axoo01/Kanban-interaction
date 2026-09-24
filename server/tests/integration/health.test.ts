import request from 'supertest';
import { app } from '../../src/app.js';

describe('GET /health', () => {
  it('should return 200 and healthy status envelope', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      data: {
        status: 'healthy',
        timestamp: expect.any(String)
      }
    });
  });
});
