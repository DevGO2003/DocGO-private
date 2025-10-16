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
  // Always set CORS for this route
  const origin = req.headers.origin || 'http://localhost:3000'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Vary', 'Origin')

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400')
    return res.status(200).end()
  }

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
      'application/json',
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

    // Add query parameters for Automation Service
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder || 'documents'
    const automationUserId = Array.isArray(fields.user_id) ? fields.user_id[0] : fields.user_id || userId
    
    // Build URL theo endpoint hợp nhất POST /files
    const automationUrl = new URL(`${process.env.AUTOMATION_SERVICE_URL}/api/v1/automation-service/files`)
    automationUrl.searchParams.append('folder', folder)
    automationUrl.searchParams.append('user_id', automationUserId)

    // Forward to Automation Service
    const response = await fetch(automationUrl.toString(), {
      method: 'POST',
      body: formData,
      headers: {
        'X-User-ID': userId,
      },
    })

    const result = await response.json()

    // Clean up temporary file
    fs.unlinkSync(file.filepath)

    // Set CORS headers for POST response
    // CORS headers already set at top

    if (response.ok) {
      return res.status(201).json(result)
    } else {
      return res.status(response.status).json(result)
    }

  } catch (error) {
    console.error('Upload proxy error:', error)
    
    // Set CORS headers for error response
    const origin = req.headers.origin || 'http://localhost:3000'
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


