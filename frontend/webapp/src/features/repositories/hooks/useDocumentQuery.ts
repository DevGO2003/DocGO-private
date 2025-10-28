'use client'

import { useEffect, useState } from 'react'
import type { Document } from '../models/types/docs'
import repositoryApi from '../models/api/repositoryApi'
import { mapRepoFileItemToUiDocument } from '../services/mappers/repo-file-mapper'

export function useDocumentQuery(id: string | undefined) {
  const [data, setData] = useState<Document | null>(null)
  const [loading, setLoading] = useState<boolean>(!!id)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    repositoryApi.getFileById(id)
      .then((file) => {
        const mapped = file ? mapRepoFileItemToUiDocument(file as any) : null
        setData(mapped)
      })
      .catch((e: any) => setError(e?.message || 'Failed to load document'))
      .finally(() => setLoading(false))
  }, [id])

  return { data, loading, error }
}
