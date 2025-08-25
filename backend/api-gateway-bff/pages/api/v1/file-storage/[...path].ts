import { NextApiRequest, NextApiResponse } from 'next';
import serviceManager from '@/lib/services';
import logger from '@/lib/logger';

/**
 * @swagger
 * /api/v1/file-storage/{path}:
 *   get:
 *     summary: Proxy GET request đến File Storage Service
 *     description: Forward GET request đến File Storage Asset Service (Port 8012)
 *     tags: [File Storage Asset]
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
 *     summary: Proxy POST request đến File Storage Service
 *     description: Forward POST request đến File Storage Asset Service (Port 8012)
 *     tags: [File Storage Asset]
 *     parameters:
 *       - name: path
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: files
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File cần upload
 *               folder:
 *                 type: string
 *                 description: Thư mục lưu trữ
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Request thành công
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 *   put:
 *     summary: Proxy PUT request đến File Storage Service
 *     description: Forward PUT request đến File Storage Asset Service (Port 8012)
 *     tags: [File Storage Asset]
 *     parameters:
 *       - name: path
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: files/metadata
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Resource không tồn tại
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Proxy DELETE request đến File Storage Service
 *     description: Forward DELETE request đến File Storage Asset Service (Port 8012)
 *     tags: [File Storage Asset]
 *     parameters:
 *       - name: path
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: files/{key}
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       204:
 *         description: Không có nội dung
 *       404:
 *         description: Resource không tồn tại
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
    const serviceInstance = serviceManager.getService('file-storage');
    if (!serviceInstance) {
      logger.error(`❌ File Storage Service không tồn tại`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'File Storage Service không tồn tại',
        statusCode: 404
      });
    }

    // Xây dựng endpoint đầy đủ
    const endpoint = `/api/v1/file-storage-asset-service/${fullPath}`;
    
    logger.info(`🚀 Proxy ${req.method} request đến File Storage: ${endpoint}`, {
      service: 'file-storage',
      path: fullPath,
      method: req.method
    });

    // Forward request đến File Storage Service
    const response = await serviceManager.proxyRequest(
      'file-storage',
      req.method || 'GET',
      endpoint,
      req.body,
      req.headers
    );

    logger.info(`✅ Proxy response từ File Storage: ${endpoint}`);

    // Trả về response từ microservice
    return res.status(200).json(response);

  } catch (error: any) {
    logger.error(`❌ Proxy error cho File Storage:`, error);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
    
    return res.status(statusCode).json({
      error: 'Proxy Error',
      message: errorMessage,
      statusCode: statusCode,
      service: 'file-storage',
      path: fullPath
    });
  }
}
