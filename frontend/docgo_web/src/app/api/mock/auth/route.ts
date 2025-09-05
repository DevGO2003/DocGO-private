export async function POST(req: Request) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action') || 'login'
  const body = await req.json().catch(() => ({})) as any

  const now = new Date().toISOString()

  const users = [
    { id: 'u1', email: 'admin@docgo.local', name: 'Admin', role: 'ADMIN', status: 'APPROVED' },
    { id: 'u2', email: 'manager@docgo.local', name: 'Manager', role: 'MANAGER', status: 'APPROVED' },
    { id: 'u3', email: 'staff@docgo.local', name: 'Staff', role: 'STAFF', status: 'APPROVED' },
    { id: 'u4', email: 'pending@docgo.local', name: 'Pending', role: 'STAFF', status: 'PENDING' },
  ]

  if (action === 'login') {
    const found = users.find(u => u.email === body?.email)
    if (!found) {
      return new Response(JSON.stringify({
        apiVersion: 'v1', statusCode: 404, shortMessage: 'Not Found', description: 'Email không tồn tại', data: null, timestamp: now, requestId: crypto.randomUUID(), path: '/api/mock/auth?action=login'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify({
      apiVersion: 'v1', statusCode: 200, shortMessage: 'Success', description: 'Đăng nhập thành công', data: { token: 'mock-token', user: found }, timestamp: now, requestId: crypto.randomUUID(), path: '/api/mock/auth?action=login'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  if (action === 'register') {
    const newUser = { id: crypto.randomUUID(), email: body?.email, name: body?.name || body?.email, role: 'STAFF', status: 'PENDING' }
    return new Response(JSON.stringify({
      apiVersion: 'v1', statusCode: 201, shortMessage: 'Created', description: 'Đăng ký thành công, chờ phê duyệt', data: { user: newUser }, timestamp: now, requestId: crypto.randomUUID(), path: '/api/mock/auth?action=register'
    }), { status: 201, headers: { 'Content-Type': 'application/json' } })
  }

  if (action === 'logout') {
    return new Response(JSON.stringify({
      apiVersion: 'v1', statusCode: 200, shortMessage: 'Success', description: 'Đăng xuất thành công', data: null, timestamp: now, requestId: crypto.randomUUID(), path: '/api/mock/auth?action=logout'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({
    apiVersion: 'v1', statusCode: 400, shortMessage: 'Bad Request', description: 'Hành động không hợp lệ', data: null, timestamp: now, requestId: crypto.randomUUID(), path: '/api/mock/auth'
  }), { status: 400, headers: { 'Content-Type': 'application/json' } })
}

export async function GET() {
  const now = new Date().toISOString()
  // Giả lập lấy user hiện tại từ token (mock)
  const current = { id: 'u1', email: 'admin@docgo.local', name: 'Admin', role: 'ADMIN', status: 'APPROVED' }
  return new Response(JSON.stringify({
    apiVersion: 'v1', statusCode: 200, shortMessage: 'Success', description: 'Thông tin người dùng hiện tại', data: { user: current }, timestamp: now, requestId: crypto.randomUUID(), path: '/api/mock/auth'
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}


