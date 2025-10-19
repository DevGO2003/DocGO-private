export interface Repository {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isReal: boolean
  category: 'FILES' | 'CONTRACTS' | 'TEMPLATES' | 'ARCHIVES'
}

export const REPOSITORIES: Repository[] = [
  {
    id: '1',
    name: 'File Management',
    description: 'Quản lý tất cả files và tài liệu',
    icon: 'FolderIcon',
    color: 'blue',
    isReal: true,
    category: 'FILES'
  },
  {
    id: '2',
    name: 'Contract Repository',
    description: 'Kho lưu trữ hợp đồng và thỏa thuận',
    icon: 'DocumentTextIcon',
    color: 'green',
    isReal: false,
    category: 'CONTRACTS'
  },
  {
    id: '3',
    name: 'Template Library',
    description: 'Thư viện mẫu và templates',
    icon: 'DocumentDuplicateIcon',
    color: 'purple',
    isReal: false,
    category: 'TEMPLATES'
  },
  {
    id: '4',
    name: 'Archive Storage',
    description: 'Lưu trữ dữ liệu archived',
    icon: 'ArchiveBoxIcon',
    color: 'gray',
    isReal: false,
    category: 'ARCHIVES'
  }
]

export function getRepositoryById(id: string): Repository | undefined {
  return REPOSITORIES.find(repo => repo.id === id)
}

export function isRealRepository(id: string): boolean {
  const repo = getRepositoryById(id)
  return repo?.isReal || false
}
