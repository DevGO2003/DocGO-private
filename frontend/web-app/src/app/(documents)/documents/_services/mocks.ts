import type { Document, Paginated } from '../_types'

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMockDocument(idNum: number): Document {
  const id = String(idNum)
  const types = ['SERVICE_AGREEMENT','PURCHASE_AGREEMENT','PARTNERSHIP_AGREEMENT','EMPLOYMENT_CONTRACT','CONFIDENTIALITY_AGREEMENT']
  const statuses = ['DRAFT','PENDING_REVIEW','APPROVED','ACTIVE','EXPIRED']
  const tags = ['IT','Pháp lý','Tài chính','Mua sắm','Hợp tác']
  const created = new Date(Date.now() - idNum * 86400000)
  const effective = new Date(created.getTime() + 3 * 86400000)
  const expiry = new Date(effective.getTime() + 180 * 86400000)

  return {
    id,
    title: `Tài liệu #${id}`,
    description: 'Mô tả ngắn về tài liệu mẫu dùng để hiển thị khi backend không khả dụng.',
    status: randomChoice(statuses),
    contractType: randomChoice(types),
    tags: [randomChoice(tags)],
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
  const total = 45
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


