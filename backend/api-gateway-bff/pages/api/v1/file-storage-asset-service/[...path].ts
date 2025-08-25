import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import logger from '@/lib/logger';

/**
 * File Storage Asset Service – expose đầy đủ endpoint trên Gateway theo đúng URL chuẩn
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/files:
 *   get:
 *     summary: Liệt kê files theo prefix
 *     tags: [File Storage Asset]
 *     parameters:
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *         example: documents/
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         example: 0
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Thành công
 *       204:
 *         description: Không có dữ liệu
 *   post:
 *     summary: Upload file lên S3/Filebase với scan
 *     tags: [File Storage Asset]
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
 *               folder:
 *                 type: string
 *                 example: documents
 *     responses:
 *       201:
 *         description: Tạo thành công
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/files/{key}/url:
 *   get:
 *     summary: Tạo presigned download URL
 *     tags: [File Storage Asset]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: expires
 *         schema:
 *           type: integer
 *         example: 3600
 *     responses:
 *       200:
 *         description: Thành công
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/files/{key}:
 *   delete:
 *     summary: Xóa file
 *     tags: [File Storage Asset]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/files/upload-with-scan:
 *   post:
 *     summary: Upload file với scan và versioning (v2)
 *     tags: [File Storage Asset]
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
 *               user_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/files/{file_id}/download:
 *   get:
 *     summary: Download file
 *     tags: [File Storage Asset]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: version
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/files/{file_id}/signed-url:
 *   post:
 *     summary: Tạo signed URL để download file
 *     tags: [File Storage Asset]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiration_minutes:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/files/{file_id}/versions:
 *   get:
 *     summary: Lấy danh sách phiên bản của file
 *     tags: [File Storage Asset]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/files/{file_id}:
 *   delete:
 *     summary: Xóa file hoặc phiên bản cụ thể
 *     tags: [File Storage Asset]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: version
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/scan/directory:
 *   post:
 *     summary: Quét file cho toàn bộ thư mục
 *     tags: [File Storage Asset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               directory_path:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /api/v1/file-storage-asset-service/scan/statistics:
 *   post:
 *     summary: Thống kê kết quả quét file
 *     tags: [File Storage Asset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
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

  try {
    const serviceKey = 'file-storage';
    const endpoint = `/api/v1/file-storage-asset-service/${fullPath}`;

    const contentType = String(req.headers['content-type'] || '');
    const isMultipart = contentType.startsWith('multipart/form-data');

    const svcCfg = serviceManager.getServiceConfig(serviceKey);
    if (!svcCfg) {
      return res.status(503).json({ error: 'Service Unavailable', message: 'File Storage chưa sẵn sàng', statusCode: 503 });
    }

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


