import { NextResponse } from 'next/server'

export async function GET() {
  const users = Array.from({ length: 12 }).map((_, i) => ({
    id: `U-${100 + i}`,
    name: `Người dùng ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 2 === 0 ? 'Reviewer' : 'User',
    status: i % 2 === 0 ? 'Active' : 'Locked',
  }))
  return NextResponse.json({ items: users })
}


