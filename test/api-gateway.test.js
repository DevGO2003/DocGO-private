const request = require('supertest');
const app = require('../backend/api-gateway-bff/pages/api');

describe('API Gateway BFF', () => {
  test('Health check endpoint', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });

  test('Auth service proxy', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' })
      .expect(200);
    
    expect(response.body).toHaveProperty('token');
  });

  test('Contract service proxy', async () => {
    const response = await request(app)
      .get('/api/contracts')
      .expect(200);
    
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('AI service proxy', async () => {
    const response = await request(app)
      .post('/api/ai/extract')
      .attach('file', 'test-file.pdf')
      .expect(200);
    
    expect(response.body).toHaveProperty('extractedText');
  });

  test('File service proxy', async () => {
    const response = await request(app)
      .get('/api/files')
      .expect(200);
    
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
