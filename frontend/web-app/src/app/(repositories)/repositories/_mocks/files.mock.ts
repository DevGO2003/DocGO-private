// Default mock files (for repo 1 fallback)
export const defaultFiles = [
  {
    id: 'file-1',
    name: 'Report_Q3_2024.pdf',
    description: 'Báo cáo tài chính quý 3',
    category: 'REPORTS',
    createdAt: '2024-10-01T10:30:00Z',
    size: 2.5,
    mimeType: 'application/pdf'
  },
  // ... 19 more files
]

// Mock for repo 2 - Contracts
export const mockContracts = [
  {
    id: 'contract-1',
    name: 'Hợp đồng dịch vụ IT',
    description: 'Dịch vụ phát triển phần mềm',
    category: 'CONTRACTS',
    contractNumber: 'CT-2024-001',
    parties: ['Company A', 'Company B'],
    value: 50000000,
    currency: 'VND',
    createdAt: '2024-09-15T00:00:00Z',
    size: 1.2
  },
  // ... 9 more contracts
]

// Mock for repo 3 - Templates
export const mockTemplates = [
  {
    id: 'template-1',
    name: 'Mẫu hợp đồng lao động',
    description: 'Template chuẩn lao động',
    category: 'TEMPLATES',
    fileType: 'docx',
    downloads: 120,
    createdAt: '2024-01-01T00:00:00Z',
    size: 0.045
  },
  // ... 9 more templates
]

// Mock for repo 4 - Archives
export const mockArchives = [
  {
    id: 'archive-1',
    name: 'Báo cáo cũ 2023',
    description: 'Báo cáo tài chính 2023 (archived)',
    category: 'ARCHIVES',
    retentionPeriod: '5 years',
    status: 'ARCHIVED',
    createdAt: '2023-12-31T00:00:00Z',
    size: 5.0
  },
  // ... 9 more archives
]

// Mock files object keyed by repo ID
export const mockFiles = {
  '2': mockContracts,
  '3': mockTemplates,
  '4': mockArchives,
  default: defaultFiles
}
