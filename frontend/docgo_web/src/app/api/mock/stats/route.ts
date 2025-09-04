import { NextResponse } from 'next/server'

export async function GET() {
  const data = {
    totalContracts: 128,
    approved: 64,
    pending: 18,
    rejected: 6,
    byMonth: Array.from({ length: 12 }).map((_, i) => ({ month: i + 1, value: Math.floor(20 + Math.random() * 40) })),
  }
  return NextResponse.json(data)
}


