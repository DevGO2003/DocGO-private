import type { Document, Paginated } from '../_types'

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMockDocument(idNum: number): Document {
  const id = String(idNum)
  const types = ['SERVICE_AGREEMENT','PURCHASE_AGREEMENT','PARTNERSHIP_AGREEMENT','EMPLOYMENT_CONTRACT','CONFIDENTIALITY_AGREEMENT']
  const statuses = ['DRAFT','PENDING_REVIEW','APPROVED','ACTIVE','EXPIRED']
  const allTags = [
    'IT', 'Pháp lý', 'Tài chính', 'Mua sắm', 'Hợp tác', 'Nhân sự', 'Marketing', 
    'Bán hàng', 'Kỹ thuật', 'Quản lý', 'Bảo mật', 'Chất lượng', 'Vận hành', 
    'Phát triển', 'Nghiên cứu', 'Đào tạo', 'Tư vấn', 'Dịch vụ', 'Sản phẩm', 'Dự án'
  ]
  
  // Tạo số lượng tags ngẫu nhiên từ 1-8
  const numTags = Math.floor(Math.random() * 8) + 1
  const shuffledTags = [...allTags].sort(() => Math.random() - 0.5)
  const tags = shuffledTags.slice(0, numTags)
  
  const created = new Date(Date.now() - idNum * 86400000)
  const effective = new Date(created.getTime() + 3 * 86400000)
  const expiry = new Date(effective.getTime() + 180 * 86400000)

  return {
    id,
    title: `Tài liệu #${id}`,
    description: 'Mô tả ngắn về tài liệu mẫu dùng để hiển thị khi backend không khả dụng.',
    status: randomChoice(statuses),
    contractType: randomChoice(types),
    tags: tags,
    contractNumber: `HD-${id.padStart(4,'0')}`,
    createdAt: created.toISOString(),
    updatedAt: created.toISOString(),
    parties: [{ name: 'Công ty ABC', role: 'Khách hàng' }, { name: 'DocGO', role: 'Nhà cung cấp' }],
    totalValue: 10000000 + idNum * 1000000,
    currency: 'VND',
    effectiveDate: effective.toISOString().slice(0,10),
    expiryDate: expiry.toISOString().slice(0,10),
    riskLevel: randomChoice(['Low','Medium','High']),
    attachments: [],
  }
}

export function mockDocumentsPage(pageNumber = 0, pageSize = 9): Paginated<Document> {
  const total = 100
  const start = pageNumber * pageSize
  const end = Math.min(start + pageSize, total)
  const content: Document[] = []
  for (let i = start + 1; i <= end; i++) {
    content.push(generateMockDocument(i))
  }
  return { content, totalElements: total, totalPages: Math.ceil(total / pageSize) }
}

export function mockDocument(id: string): Document | null {
  const idNum = Number(id)
  if (!Number.isFinite(idNum) || idNum <= 0 || idNum > 9999) return null
  return generateMockDocument(idNum)
}

// Tạo một số documents với số lượng tags cố định để test
export function createTestDocuments(): Document[] {
  const testDocs: Document[] = []
  
  // Document với 1 tag
  testDocs.push({
    id: 'test-1',
    title: 'Hợp đồng dịch vụ IT',
    description: 'Hợp đồng cung cấp dịch vụ công nghệ thông tin cho công ty ABC',
    status: 'ACTIVE',
    contractType: 'SERVICE_AGREEMENT',
    tags: ['IT'],
    contractNumber: 'HD-TEST-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parties: [{ name: 'Công ty ABC', role: 'Khách hàng' }, { name: 'DocGO', role: 'Nhà cung cấp' }],
    totalValue: 50000000,
    currency: 'VND',
    effectiveDate: '2024-01-01',
    expiryDate: '2024-12-31',
    riskLevel: 'Low',
    attachments: [],
  })
  
  // Document với 2 tags
  testDocs.push({
    id: 'test-2',
    title: 'Hợp đồng mua bán thiết bị',
    description: 'Hợp đồng mua bán thiết bị máy tính và phần mềm',
    status: 'APPROVED',
    contractType: 'PURCHASE_AGREEMENT',
    tags: ['Mua sắm', 'IT'],
    contractNumber: 'HD-TEST-002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parties: [{ name: 'Công ty XYZ', role: 'Nhà cung cấp' }, { name: 'DocGO', role: 'Khách hàng' }],
    totalValue: 25000000,
    currency: 'VND',
    effectiveDate: '2024-02-01',
    expiryDate: '2024-08-31',
    riskLevel: 'Medium',
    attachments: [],
  })
  
  // Document với 3 tags
  testDocs.push({
    id: 'test-3',
    title: 'Hợp đồng hợp tác kinh doanh',
    description: 'Hợp đồng hợp tác phát triển sản phẩm và marketing',
    status: 'PENDING_REVIEW',
    contractType: 'PARTNERSHIP_AGREEMENT',
    tags: ['Hợp tác', 'Marketing', 'Phát triển'],
    contractNumber: 'HD-TEST-003',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parties: [{ name: 'Công ty DEF', role: 'Đối tác' }, { name: 'DocGO', role: 'Đối tác' }],
    totalValue: 100000000,
    currency: 'VND',
    effectiveDate: '2024-03-01',
    expiryDate: '2025-02-28',
    riskLevel: 'High',
    attachments: [],
  })
  
  // Document với 5 tags
  testDocs.push({
    id: 'test-4',
    title: 'Hợp đồng nhân sự và đào tạo',
    description: 'Hợp đồng tuyển dụng, đào tạo nhân viên và quản lý dự án',
    status: 'ACTIVE',
    contractType: 'EMPLOYMENT_CONTRACT',
    tags: ['Nhân sự', 'Đào tạo', 'Quản lý', 'Dự án', 'Tài chính'],
    contractNumber: 'HD-TEST-004',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parties: [{ name: 'Công ty GHI', role: 'Nhà tuyển dụng' }, { name: 'DocGO', role: 'Nhà cung cấp dịch vụ' }],
    totalValue: 75000000,
    currency: 'VND',
    effectiveDate: '2024-04-01',
    expiryDate: '2024-10-31',
    riskLevel: 'Medium',
    attachments: [],
  })
  
  // Document với 8 tags
  testDocs.push({
    id: 'test-5',
    title: 'Hợp đồng toàn diện',
    description: 'Hợp đồng bao gồm nhiều lĩnh vực: IT, pháp lý, tài chính, marketing, nhân sự, bảo mật, chất lượng, vận hành',
    status: 'DRAFT',
    contractType: 'SERVICE_AGREEMENT',
    tags: ['IT', 'Pháp lý', 'Tài chính', 'Marketing', 'Nhân sự', 'Bảo mật', 'Chất lượng', 'Vận hành'],
    contractNumber: 'HD-TEST-005',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parties: [{ name: 'Công ty JKL', role: 'Khách hàng' }, { name: 'DocGO', role: 'Nhà cung cấp' }],
    totalValue: 200000000,
    currency: 'VND',
    effectiveDate: '2024-05-01',
    expiryDate: '2025-04-30',
    riskLevel: 'High',
    attachments: [],
  })
  
  return testDocs
}


