const request = require('supertest');
const app = require('../backend/api-gateway-bff/pages/api');

describe('Performance Tests', () => {
  test('API Gateway response time < 100ms', async () => {
    const start = Date.now();
    await request(app).get('/api/health');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
  });

  test('Concurrent requests handling', async () => {
    const promises = Array(10).fill().map(() => 
      request(app).get('/api/health')
    );
    
    const responses = await Promise.all(promises);
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });

  test('File upload performance', async () => {
    const start = Date.now();
    await request(app)
      .post('/api/files/upload')
      .attach('file', 'large-file.pdf');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
});
