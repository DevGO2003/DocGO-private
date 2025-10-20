export function mapFileApiPageToPaginatedDocuments(apiData: any) {
  return {
    data: apiData.content || [],
    totalElements: apiData.totalElements || 0,
    totalPages: apiData.totalPages || 0,
    pageNumber: apiData.pageNumber || 0,
    pageSize: apiData.pageSize || 10,
    sortBy: apiData.sortBy || 'createdAt',
    sortDirection: apiData.sortDirection || 'DESC'
  }
}
