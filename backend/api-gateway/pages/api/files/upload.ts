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
    // Passthrough streaming proxy: không parse multipart, forward nguyên request stream
    const baseUrl = process.env.AS_BASE_URL || process.env.AUTOMATION_SERVICE_URL || 'http://localhost:8003'
    const automationUrl = new URL(`${baseUrl}/api/v1/automation-service/v1/documents/upload`)

    // Sao chép headers, giữ nguyên Content-Type (boundary) và Content-Length nếu có
    const forwardedHeaders: Record<string, string> = {}
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === 'string') forwardedHeaders[k] = v
    }
    delete forwardedHeaders['host']

    const upstream = await fetch(automationUrl.toString(), {
      method: 'POST',
      // @ts-ignore
      duplex: 'half',
      headers: forwardedHeaders,
      // @ts-ignore
      body: req as any,
    })

    const text = await upstream.text()
    try {
      const json = JSON.parse(text)
      return res.status(200).json(json)
    } catch {
      res.status(200).setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
      return res.send(text)
    }
  } catch (error) {
    console.error('Upload proxy error (passthrough):', error)
    const origin = req.headers.origin || 'http://localhost:3000'
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    return res.status(200).json({
      apiVersion: 'v1',
      statusCode: 500,
      shortMessage: 'Internal Server Error',
      description: error instanceof Error ? error.message : 'Unknown error',
      data: null,
      path: '/api/files/upload'
    })
  }
}


