'use client'

import { useEffect, useState } from 'react'
import type { Document } from '../_types'
import { automationAPI } from '@/lib/api'
import { mapFileApiToUiDocument } from '../_services/file-mapper'

export function useDocumentQuery(id: string | undefined) {
  const [data, setData] = useState<Document | null>(null)
  const [loading, setLoading] = useState<boolean>(!!id)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    automationAPI.getFileById(id)
      .then((axiosRes) => {
        const apiData = axiosRes?.data?.data
        const mapped = apiData ? mapFileApiToUiDocument(apiData) : null
        setData(mapped)
      })
      .catch((e: any) => setError(e?.message || 'Failed to load document'))
      .finally(() => setLoading(false))
  }, [id])

  return { data, loading, error }
}


