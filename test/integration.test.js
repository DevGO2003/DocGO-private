const request = require('supertest');
const app = require('../backend/api-gateway-bff/pages/api');

describe('Integration Tests', () => {
  let authToken;
  let contractId;
  let fileId;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' });
    
    authToken = loginResponse.body.data.token;
  });

  test('Complete workflow: Upload file -> AI process -> Create contract', async () => {
    // 1. Upload file
    const uploadResponse = await request(app)
      .post('/api/files/upload')
      .attach('file', 'test-contract.pdf')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    fileId = uploadResponse.body.data.fileId;

    // 2. AI extract text
    const extractResponse = await request(app)
      .post('/api/ai/extract')
      .attach('file', 'test-contract.pdf')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    const extractedText = extractResponse.body.data.extractedText;

    // 3. Create contract
    const contractResponse = await request(app)
      .post('/api/contracts')
      .send({
        title: 'Test Contract',
        content: extractedText,
        fileId: fileId
      })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    contractId = contractResponse.body.data.id;

    // 4. Verify contract created
    const getContractResponse = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(getContractResponse.body.data.title).toBe('Test Contract');
  });

  test('Complete workflow: Contract approval -> Notification', async () => {
    // 1. Approve contract
    const approvalResponse = await request(app)
      .post(`/api/contracts/${contractId}/approve`)
      .send({
        status: 'APPROVED',
        comment: 'Approved by manager'
      })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 2. Check notification sent
    const notificationResponse = await request(app)
      .get('/api/ai/notifications/history')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(notificationResponse.body.data.length).toBeGreaterThan(0);
  });
});
