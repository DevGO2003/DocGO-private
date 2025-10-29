'use client'

import { useFile } from '../models/api/repositoryApi'

export function useFileQuery(id: string) {
  return useFile(id)
}
