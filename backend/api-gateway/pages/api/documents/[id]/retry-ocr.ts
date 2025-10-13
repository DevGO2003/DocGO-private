import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { documentId } = req.query
    
    if (!documentId || typeof documentId !== 'string') {
      return res.status(400).json({ error: 'Document ID is required' })
    }

    // Forward to Automation Service
    const response = await fetch(`${process.env.AUTOMATION_SERVICE_URL}/api/v1/automation-service/v1/document/retry-ocr/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (response.ok) {
      return res.status(200).json(result)
    } else {
      return res.status(response.status).json(result)
    }

  } catch (error) {
    console.error('Retry OCR proxy error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


