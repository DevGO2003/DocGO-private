export const DEFAULT_PAGE_SIZE = 9;
export const DEFAULT_SORT_BY = 'createdAt';
export const DEFAULT_SORT_DIRECTION = 'DESC';

export const API_ENDPOINTS = {
  list: '/api/v1/automation-service/files',
  detail: (id: string) => `/api/v1/automation-service/files/${id}`,
};
