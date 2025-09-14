import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';

// Proxy OpenAPI docs từ các microservice về một endpoint thống nhất
// Spring Boot (SpringDoc): /v3/api-docs
// FastAPI: /openapi.json

const SPRING_SERVICES = new Set<string>([
  'authentication',
  // 'contract-management', // Tạm thời bỏ vì không có SpringDoc OpenAPI
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { service } = req.query;

  if (!service) {
    return res.status(400).json({ error: 'service param is required' });
  }

  const serviceKey = Array.isArray(service) ? service[0] : service;

  try {
    const axiosInstance = serviceManager.getService(serviceKey);
    if (!axiosInstance) {
      return res.status(404).json({ error: `Service ${serviceKey} not found` });
    }

    const path = SPRING_SERVICES.has(serviceKey) ? '/v3/api-docs' : '/openapi.json';
    const response = await axiosInstance.get(path, { headers: { Accept: 'application/json' } });
    const spec = response.data;
    // Rewrite servers của spec về Gateway để Try it out đi qua 8000
    const gwUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host || 'localhost:8000'}`;
    spec.servers = [{ url: gwUrl }];

    res.setHeader('Access-Control-Allow-Origin', '*');
    // Không ép Content-Type ở proxy docs
    return res.status(200).json(spec);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data || { error: 'Failed to fetch OpenAPI spec' };
    return res.status(status).json(message);
  }
}


