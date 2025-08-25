import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';

/**
 * General File Management Service – expose đầy đủ endpoint trên Gateway theo đúng URL chuẩn
 */

/**
 * @swagger
 * /api/v1/general-file-management-service/files/upload:
 *   post:
 *     summary: Upload File
 *     tags: [General File Management]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 */

/**
 * @swagger
 * /api/v1/general-file-management-service/files:
 *   get:
 *     summary: Get Files
 *     tags: [General File Management]
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/general-file-management-service/files/{file_id}:
 *   get:
 *     summary: Get File Info
 *     tags: [General File Management]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     summary: Delete File
 *     tags: [General File Management]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/general-file-management-service/files/{file_id}/metadata:
 *   put:
 *     summary: Update File Metadata
 *     tags: [General File Management]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/general-file-management-service/categories:
 *   get:
 *     summary: Get Categories
 *     tags: [General File Management]
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/general-file-management-service/search:
 *   post:
 *     summary: Search Files
 *     tags: [General File Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: OK
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'Bad Request', message: 'Path là bắt buộc', statusCode: 400 });
  }

  const fullPath = Array.isArray(path) ? path.join('/') : path;
  const serviceKey = 'general-file-management';
  const endpoint = `/api/v1/general-file-management-service/${fullPath}`;

  try {
    const svcCfg = serviceManager.getServiceConfig(serviceKey);
    if (!svcCfg) {
      return res.status(503).json({ error: 'Service Unavailable', message: 'General File Management chưa sẵn sàng', statusCode: 503 });
    }

    const contentType = String(req.headers['content-type'] || '');
    const isMultipart = contentType.startsWith('multipart/form-data');

    if ((req.method === 'POST' || req.method === 'PUT') && isMultipart) {
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers[k] = v;
      }
      delete headers['host'];
      delete headers['content-length'];

      const upstream = await fetch(`${svcCfg.url}${endpoint}`, { method: req.method, headers, body: req as any } as any);
      const buf = Buffer.from(await upstream.arrayBuffer());
      const ct = upstream.headers.get('content-type') || 'application/json';
      res.setHeader('content-type', ct);
      return res.status(upstream.status).send(buf);
    }

    const data = await serviceManager.proxyRequest(serviceKey, req.method || 'GET', endpoint, req.body, req.headers);
    return res.status(200).json(data);
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Lỗi không xác định';
    return res.status(statusCode).json({ error: 'Proxy Error', message, statusCode });
  }
}

export const config = { api: { bodyParser: false } };


