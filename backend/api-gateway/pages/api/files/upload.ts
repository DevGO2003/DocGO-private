import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      uploadDir: '/tmp',
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
    
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.jpg', '.jpeg', '.png']
    const fileExtension = path.extname(file.originalFilename || '').toLowerCase()
    
    if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ error: 'Unsupported file type' })
    }

    // Prepare form data for Document Management Service
    const formData = new FormData()
    
    // Read file and append to form data
    const fileBuffer = fs.readFileSync(file.filepath)
    const blob = new Blob([fileBuffer], { type: file.mimetype })
    formData.append('file', blob, file.originalFilename)
    
    // Add metadata if provided
    const metadata = Array.isArray(fields.metadata) ? fields.metadata[0] : fields.metadata
    if (metadata) {
      formData.append('metadata', metadata)
    }
    
    // Add tags if provided
    const tags = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags
    if (tags) {
      formData.append('tags', tags)
    }

    // Get user ID from header
    const userId = req.headers['x-user-id'] as string || 'system'

    // Forward to Document Management Service
    const response = await fetch(`${process.env.DOCUMENT_SERVICE_URL}/api/v1/document-management-service/v1/files/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-User-ID': userId,
      },
    })

    const result = await response.json()

    // Clean up temporary file
    fs.unlinkSync(file.filepath)

    if (response.ok) {
      return res.status(201).json(result)
    } else {
      return res.status(response.status).json(result)
    }

  } catch (error) {
    console.error('Upload proxy error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


