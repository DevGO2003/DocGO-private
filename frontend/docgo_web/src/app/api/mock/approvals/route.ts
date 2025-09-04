import { NextResponse } from 'next/server'

const approvals = Array.from({ length: 6 }).map((_, i) => ({
  id: `A-${1000 + i}`,
  email: `requester${i + 1}@example.com`,
  requestedAt: `2025-01-${(i + 1).toString().padStart(2, '0')} 09:${(30 + i).toString().padStart(2, '0')}`,
}))

export async function GET() {
  return NextResponse.json({ items: approvals })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as any
  if (!body || !body.id || !body.action) return NextResponse.json({ ok: false }, { status: 400 })
  return NextResponse.json({ ok: true, id: body.id, action: body.action })
}


