'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  FolderIcon, 
  DocumentTextIcon, 
  DocumentDuplicateIcon, 
  ArchiveBoxIcon 
} from '@heroicons/react/24/outline'

interface Repository {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  isReal: boolean
  color: string
  href: string
}

const repositories: Repository[] = [
  {
    id: '1',
    name: 'File Management',
    description: 'Quản lý tất cả files và tài liệu',
    icon: FolderIcon,
    isReal: true,
    color: 'blue',
    href: '/repository/1'
  },
  {
    id: '2',
    name: 'Contract Repository',
    description: 'Kho lưu trữ hợp đồng và thỏa thuận',
    icon: DocumentTextIcon,
    isReal: false,
    color: 'green',
    href: '/repository/2'
  },
  {
    id: '3',
    name: 'Template Library',
    description: 'Thư viện mẫu và templates',
    icon: DocumentDuplicateIcon,
    isReal: false,
    color: 'purple',
    href: '/repository/3'
  },
  {
    id: '4',
    name: 'Archive Storage',
    description: 'Lưu trữ dữ liệu archived',
    icon: ArchiveBoxIcon,
    isReal: false,
    color: 'gray',
    href: '/repository/4'
  }
]

export default function RepositoryLanding() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Repository Management</h1>
        <p className="mt-2 text-gray-600">Quản lý kho lưu trữ động theo ID</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            onClick={() => router.push(repo.href)}
            className={`
              cursor-pointer rounded-lg border-2 p-6 shadow-sm hover:shadow-lg transition-all
              bg-white hover:bg-gray-50
              border-${repo.color}-200 hover:border-${repo.color}-400
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${repo.color}-100`}>
                <repo.icon className={`w-6 h-6 text-${repo.color}-600`} />
              </div>
              <span className={`
                text-xs px-2 py-1 rounded-full font-medium
                ${repo.isReal 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'}
              `}>
                {repo.isReal ? 'REAL' : 'MOCK'}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{repo.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{repo.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {/* Item count - fetch dynamically for real */}
                {repo.isReal ? 'Loading...' : '24+'}
              </span>
              <span className="text-sm text-gray-500">items</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
