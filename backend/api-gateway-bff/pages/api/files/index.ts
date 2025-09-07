import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const target = 'http://localhost:8018/api/v1/general-file-management-service/files'
    const url = new URL(target)
    const qs = req.url?.split('?')[1]
    const r = await fetch(qs ? `${url.toString()}?${qs}` : url.toString(), {
      method: 'GET',
      headers: { ...req.headers as any },
    })
    const data = await r.json()
    res.status(200).json(data)
  } catch (e: any) {
    res.status(200).json({ apiVersion: 'v1', statusCode: 500, shortMessage: 'Internal Server Error', description: `Proxy general-file-management-service error: ${e}`, data: null, timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), path: req.url })
  }
}


