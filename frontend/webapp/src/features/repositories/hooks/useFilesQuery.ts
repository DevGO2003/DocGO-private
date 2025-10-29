'use client'

import { useFiles } from '../models/api/repositoryApi'
import type { PaginationParams } from '../models/types/repository.types'

export function useFilesQuery(params?: PaginationParams) {
  return useFiles(params)
}

// Back-compat alias
export const useDocumentsQuery = useFilesQuery
