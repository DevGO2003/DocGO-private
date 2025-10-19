'use client'

import React from 'react'
import { notFound } from 'next/navigation'
import { Repository, getRepositoryById, isRealRepository } from '../_services/repositoryConfig'
import { useRepositoryData } from '../_hooks/useRepositoryData'
import { RepositoryHeader } from '../_components/headers/RepositoryHeader'
import { RepositoryLayout } from '../_components/layout/RepositoryLayout'
import { FilesTable } from '../_components/tables/FilesTable'

interface RepositoryPageProps {
  params: {
    repositoryId: string
  }
}

export default function RepositoryPage({ params }: RepositoryPageProps) {
  const { repositoryId } = params
  const repository = getRepositoryById(repositoryId)

  if (!repository) {
    notFound()
  }

  // Filters cho table
  const [filters, setFilters] = React.useState({
    pageNumber: 0,
    pageSize: 10,
    searchTerm: '',
  })

  // Smart hook - real or mock based on ID
  const { data, isLoading, error } = useRepositoryData({
    repositoryId,
    filters
  })

  return (
    <RepositoryLayout>
      <RepositoryHeader
        title={repository.name}
        description={repository.description}
        badge={repository.isReal ? 'REAL DATA' : 'MOCK DATA'}
        badgeColor={repository.isReal ? 'green' : 'gray'}
        actions={[
          { label: 'Upload', onClick: () => console.log('Upload') },
          { label: 'Create', onClick: () => console.log('Create') }
        ]}
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">Loading repository data...</div>
        ) : error ? (
          <div className="text-red-600 p-4 bg-red-50 rounded">Error: {error.message}</div>
        ) : (
          <FilesTable
            files={data?.data || []}
            totalPages={data?.totalPages || 0}
            currentPage={filters.pageNumber}
            onPageChange={(page) => setFilters(prev => ({ ...prev, pageNumber: page }))}
          />
        )}
      </div>
    </RepositoryLayout>
  )
}
