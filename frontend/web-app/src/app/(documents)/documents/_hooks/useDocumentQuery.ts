'use client'

import { useEffect, useState } from 'react'
import type { Document } from '../_types'
import { fetchDocument } from '../_services/documentsApi'

export function useDocumentQuery(id: string | undefined) {
  const [data, setData] = useState<Document | null>(null)
  const [loading, setLoading] = useState<boolean>(!!id)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    fetchDocument(id)
      .then((d) => setData(d))
      .catch((e: any) => setError(e?.message || 'Failed to load document'))
      .finally(() => setLoading(false))
  }, [id])

  return { data, loading, error }
}


