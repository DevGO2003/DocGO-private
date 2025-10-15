import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || 'http://localhost:3000'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const baseUrl = process.env.DS_BASE_URL || process.env.DOCUMENT_MANAGEMENT_SERVICE_URL || 'http://localhost:8002'
    const url = `${baseUrl}/api/v1/document-management-service/documents`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'X-User-ID': (req.headers['x-user-id'] as string) || 'system'
      },
      body: JSON.stringify(req.body)
    })

    const result = await response.json()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(200).json({
      apiVersion: 'v1',
      statusCode: 500,
      shortMessage: 'Internal Server Error',
      description: error instanceof Error ? error.message : 'Unknown error',
      data: null,
      path: '/api/documents'
    })
  }
}


