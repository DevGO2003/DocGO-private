'use client'

import { useEffect, useRef, useState } from 'react'
import { DEFAULT_PAGE_SIZE, DEFAULT_SORT_BY, DEFAULT_SORT_DIRECTION } from '../constants'
import type { Document } from '../models/types/docs'
import { mapRepoFileItemToUiDocument } from '../services/mappers/repo-file-mapper'
import repositoryApi from '../models/api/repositoryApi'

export type UseDocumentsParams = {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
  searchTerm?: string
  includeDeleted?: boolean
  status?: string
  type?: string
  tags?: string[]
  documentType?: string
}

export function useDocumentsQuery(initial?: Partial<UseDocumentsParams>) {
  const [params, setParams] = useState<UseDocumentsParams>({
    pageNumber: 0,
    pageSize: initial?.pageSize ?? DEFAULT_PAGE_SIZE,
    sortBy: initial?.sortBy ?? DEFAULT_SORT_BY,
    sortDirection: initial?.sortDirection ?? (DEFAULT_SORT_DIRECTION as 'ASC' | 'DESC'),
    searchTerm: initial?.searchTerm ?? '',
    includeDeleted: false,
    status: initial?.status ?? 'ALL',
    type: initial?.type ?? 'ALL',
    tags: initial?.tags ?? [],
    documentType: initial?.documentType,
  })
  const [data, setData] = useState<{ content: Document[]; totalElements: number; totalPages: number }>({ content: [], totalElements: 0, totalPages: 1 })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)
  const [refreshIndex, setRefreshIndex] = useState<number>(0)
  const tagsString = (params.tags || []).join(',')

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller
    setLoading(true)
    setError('')

    const query: Record<string, any> = {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      includeDeleted: params.includeDeleted,
    }
    if ((params.searchTerm || '').trim().length >= 2) query.searchTerm = params.searchTerm
    if (params.sortBy) query.sortBy = params.sortBy
    if (params.sortDirection) query.sortDirection = params.sortDirection
    if (params.status && params.status !== 'ALL') query.status = params.status
    if (params.type && params.type !== 'ALL') query.type = params.type
    if (params.tags && params.tags.length > 0) query.tags = params.tags.join(',')
    if (params.documentType) query.documentType = params.documentType

    repositoryApi.getAllFiles({
      page: query.pageNumber,
      size: query.pageSize,
      sortBy: query.sortBy,
      sortDirection: (query.sortDirection as any),
      searchTerm: query.searchTerm,
    })
      .then((res) => {
        const content: Document[] = Array.isArray(res?.content)
          ? (res.content as any[]).map((f) => mapRepoFileItemToUiDocument(f as any))
          : []
        setData({
          content,
          totalElements: Number(res?.totalElements ?? content.length),
          totalPages: Number(res?.totalPages ?? 1),
        })
      })
      .catch((e: any) => setError(e?.message || 'Failed to load documents'))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [params.pageNumber, params.pageSize, params.sortBy, params.sortDirection, params.searchTerm, params.includeDeleted, params.status, params.type, tagsString, params.documentType, refreshIndex])

  const refetch = () => setRefreshIndex((i) => i + 1)

  return { data, loading, error, params, setParams, refetch }
}
