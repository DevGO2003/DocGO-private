export const DOCUMENTS_ROUTE = '/documents'

export const DEFAULT_PAGE_SIZE = 9
export const DEFAULT_SORT_BY = 'createdAt'
export const DEFAULT_SORT_DIRECTION = 'DESC'

export const QUERY_KEYS = {
  documents: 'documents:list',
  document: (id: string) => `documents:detail:${id}`,
}

export const API_ENDPOINTS = {
  list: '/api/v1/document-management-service/v1/contracts',
  detail: (id: string) => `/api/v1/document-management-service/v1/contracts/${id}`,
}


