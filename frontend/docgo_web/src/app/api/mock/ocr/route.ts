import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const now = new Date().toISOString()
  try {
    const contentType = req.headers.get('content-type') || ''
    let text = ''

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({})) as any
      text = (body?.text || '').toString()
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as File | null
      if (file) {
        // Mock đọc file: chỉ lấy tên file để sinh dữ liệu
        text = `Extracted from: ${file.name}`
      }
    }

    // Sinh dữ liệu trích xuất giả lập
    const title = text ? `Hợp đồng từ "${text.slice(0, 24)}"` : 'Hợp đồng mẫu (mock OCR)'
    const extracted = {
      title,
      contractType: 'Dịch vụ',
      tags: ['ưu_tiên', 'đối_tác_mới'],
      object: 'Cung cấp dịch vụ công nghệ thông tin',
      effectiveDate: new Date().toISOString().slice(0, 10),
      term: '12 tháng',
      terminationConditions: 'Thông báo trước 30 ngày',
      content: text || 'Nội dung hợp đồng mẫu được trích xuất từ tài liệu (mock).',
      paymentDetails: {
        totalValue: 150000000,
        schedule: '30% khi ký, 70% khi bàn giao',
        currency: 'VND',
        paymentMethod: 'Chuyển khoản',
      },
      parties: [
        { name: 'Công ty ABC', role: 'Bên A', representative: 'Nguyễn Văn A', taxCode: '0101', contact: 'a@abc.com', address: 'Hà Nội', businessLicense: 'ABC-2024' },
        { name: 'Công ty XYZ', role: 'Bên B', representative: 'Trần Thị B', taxCode: '0202', contact: 'b@xyz.com', address: 'TP.HCM', businessLicense: 'XYZ-2024' },
      ],
      keyClauses: [
        { name: 'Phạm vi dịch vụ', description: 'Mô tả phạm vi công việc', source: 'Tài liệu' },
        { name: 'Bảo mật', description: 'Cam kết bảo mật thông tin', source: 'Tài liệu' },
      ],
      favorableClauses: [
        { clauseName: 'Điều khoản thanh toán nhanh', description: 'Chiết khấu khi thanh toán sớm', benefitTo: 'Bên A' },
      ],
      unfavorableClauses: [
        { clauseName: 'Phạt chậm tiến độ', description: '1%/ngày', riskTo: 'Bên A' },
      ],
      reminders: [
        { type: 'RENEWAL', date: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 10), content: 'Nhắc gia hạn trước 5 ngày' },
      ],
      riskAssessment: { riskLevel: 'MEDIUM', riskFactors: ['Chậm tiến độ'], mitigationMeasures: ['Theo dõi tiến độ hàng tuần'] },
      complianceStatus: { status: 'COMPLIANT', issues: [], recommendations: [] },
    }

    return NextResponse.json({
      apiVersion: 'v1',
      statusCode: 200,
      shortMessage: 'Success',
      description: 'Trích xuất OCR mock thành công',
      data: extracted,
      timestamp: now,
      requestId: crypto.randomUUID(),
      path: '/api/mock/ocr'
    })
  } catch (e: any) {
    return NextResponse.json({
      apiVersion: 'v1',
      statusCode: 500,
      shortMessage: 'Internal Server Error',
      description: 'Lỗi xử lý OCR mock',
      data: null,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      path: '/api/mock/ocr'
    }, { status: 500 })
  }
}


