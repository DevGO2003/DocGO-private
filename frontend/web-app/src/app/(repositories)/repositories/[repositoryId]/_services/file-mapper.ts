export function mapFileApiToUiDocument(apiData: any) {
  return {
    id: apiData.id,
    title: apiData.overview?.title || 'Untitled',
    description: apiData.content?.plaintext || '',
    status: apiData.overview?.status || 'DRAFT',
    contractType: apiData.overview?.contractType || 'Other',
    tags: apiData.overview?.tags || [],
    // Add other mappings as needed
    ...apiData
  }
}
