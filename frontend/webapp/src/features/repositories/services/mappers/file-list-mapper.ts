import type { Document } from '../../models/types/docs';
import type { FileApiData } from '../../models/types/file-api';

export type Paginated<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
};

export function mapFileApiPageToPaginatedDocuments(payload: any): Paginated<Document> {
  const data = payload?.data;
  if (Array.isArray(data?.content)) {
    return {
      content: data.content.map((x: FileApiData) => mapFileApiToUiDocument(x)),
      totalElements: Number(data.totalElements ?? 0),
      totalPages: Number(data.totalPages ?? 1),
    };
  }
  return { content: [], totalElements: 0, totalPages: 0 };
}

import { mapFileApiToUiDocument } from './file-mapper';
