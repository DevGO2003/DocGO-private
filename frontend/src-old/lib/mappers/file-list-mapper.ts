import type { Paginated, Document } from '@/app/(repositories)/repositories/_types'
import type { FileApiData } from '@/app/(repositories)/repositories/_types/file-api'
import { mapFileApiToUiDocument } from './file-mapper'

export function mapFileApiPageToPaginatedDocuments(payload: any): Paginated<Document> {
  const data = payload?.data
  if (Array.isArray(data?.content)) {
    return {
      content: data.content.map((x: FileApiData) => mapFileApiToUiDocument(x)),
      totalElements: Number(data.totalElements ?? 0),
      totalPages: Number(data.totalPages ?? 1),
    }
  }
  return { content: [], totalElements: 0, totalPages: 0 }
}
