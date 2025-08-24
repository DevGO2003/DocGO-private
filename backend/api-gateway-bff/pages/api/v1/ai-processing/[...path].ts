import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import logger from '@/lib/logger';

/**
 * @swagger
 * /api/v1/ai-processing/{path}:
 *   post:
 *     summary: Proxy POST request đến AI Processing Service
 *     description: Forward POST request đến AI Processing Service (Port 8017)
 *     tags: [AI Processing Service]
 *     parameters:
 *       - name: path
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: extract
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
 *                 description: File cần xử lý (docx, pdf)
 *     responses:
 *       200:
 *         description: Request thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  if (!path) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Path là bắt buộc',
      statusCode: 400
    });
  }

  const fullPath = Array.isArray(path) ? path.join('/') : path;

  try {
    // Kiểm tra service có tồn tại không
    const serviceInstance = serviceManager.getService('ai-processing');
    if (!serviceInstance) {
      logger.error(`❌ AI Processing Service không tồn tại`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'AI Processing Service không tồn tại',
        statusCode: 404
      });
    }

    // Xây dựng endpoint đầy đủ
    const endpoint = `/api/v1/ai-processing-service/${fullPath}`;
    
    logger.info(`🚀 Proxy ${req.method} request đến AI Processing: ${endpoint}`, {
      service: 'ai-processing',
      path: fullPath,
      method: req.method
    });

    // Forward request đến AI Processing Service
    const response = await serviceManager.proxyRequest(
      'ai-processing',
      req.method || 'POST',
      endpoint,
      req.body,
      req.headers
    );

    logger.info(`✅ Proxy response từ AI Processing: ${endpoint}`);

    // Trả về response từ microservice
    return res.status(200).json(response);

  } catch (error: any) {
    logger.error(`❌ Proxy error cho AI Processing:`, error);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
    
    return res.status(statusCode).json({
      error: 'Proxy Error',
      message: errorMessage,
      statusCode: statusCode,
      service: 'ai-processing',
      path: fullPath
    });
  }
}
