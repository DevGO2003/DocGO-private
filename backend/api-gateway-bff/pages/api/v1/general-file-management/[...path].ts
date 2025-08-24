import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import logger from '@/lib/logger';

/**
 * @swagger
 * /api/v1/general-file-management/{path}:
 *   get:
 *     summary: Proxy GET request đến General File Management Service
 *     description: Forward GET request đến General File Management Service (Port 8018)
 *     tags: [General File Management]
 *     parameters:
 *       - name: path
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: files
 *     responses:
 *       200:
 *         description: Request thành công
 *       404:
 *         description: Resource không tồn tại
 *       500:
 *         description: Lỗi server
 *   
 *   post:
 *     summary: Proxy POST request đến General File Management Service
 *     description: Forward POST request đến General File Management Service (Port 8018)
 *     tags: [General File Management]
 *     parameters:
 *       - name: path
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: files/upload
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
 *                 description: File cần upload
 *               category:
 *                 type: string
 *                 description: Danh mục file
 *               tags:
 *                 type: string
 *                 description: Tags phân cách bởi dấu phẩy
 *               description:
 *                 type: string
 *                 description: Mô tả file
 *     responses:
 *       200:
 *         description: Request thành công
 *       201:
 *         description: Tạo thành công
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
    const serviceInstance = serviceManager.getService('general-file-management');
    if (!serviceInstance) {
      logger.error(`❌ General File Management Service không tồn tại`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'General File Management Service không tồn tại',
        statusCode: 404
      });
    }

    // Xây dựng endpoint đầy đủ
    const endpoint = `/api/v1/general-file-management-service/${fullPath}`;
    
    logger.info(`🚀 Proxy ${req.method} request đến General File Management: ${endpoint}`, {
      service: 'general-file-management',
      path: fullPath,
      method: req.method
    });

    // Forward request đến General File Management Service
    const response = await serviceManager.proxyRequest(
      'general-file-management',
      req.method || 'GET',
      endpoint,
      req.body,
      req.headers
    );

    logger.info(`✅ Proxy response từ General File Management: ${endpoint}`);

    // Trả về response từ microservice
    return res.status(200).json(response);

  } catch (error: any) {
    logger.error(`❌ Proxy error cho General File Management:`, error);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
    
    return res.status(statusCode).json({
      error: 'Proxy Error',
      message: errorMessage,
      statusCode: statusCode,
      service: 'general-file-management',
      path: fullPath
    });
  }
}
