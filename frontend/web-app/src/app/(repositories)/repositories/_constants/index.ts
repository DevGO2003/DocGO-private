export const REPOSITORIES_ROUTE = '/repositories'

export const DEFAULT_PAGE_SIZE = 9
export const DEFAULT_SORT_BY = 'createdAt'
export const DEFAULT_SORT_DIRECTION = 'DESC'

export const QUERY_KEYS = {
  repositories: 'repositories:list',
  repository: (id: string) => `repositories:detail:${id}`,
}

export const API_ENDPOINTS = {
  list: '/api/v1/repository-management-service/files',
  detail: (id: string) => `/api/v1/repository-management-service/files/${id}`,
}


