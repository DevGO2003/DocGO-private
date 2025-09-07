import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  try {
    const target = 'http://localhost:8017/api/v1/ai-processing-service/summarize'
    const r = await fetch(target, {
      method: 'POST',
      headers: { ...req.headers as any },
      body: req,
    })
    const data = await r.json()
    res.status(200).json(data)
  } catch (e: any) {
    res.status(200).json({ apiVersion: 'v1', statusCode: 500, shortMessage: 'Internal Server Error', description: `Proxy ai-processing-service error: ${e}`, data: null, timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), path: req.url })
  }
}


