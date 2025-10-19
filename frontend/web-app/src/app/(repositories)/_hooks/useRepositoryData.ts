import { useQuery } from 'react-query'
import { isRealRepository } from '../_services/repositoryConfig'
import { repositoryApi } from '../_services/repositoryApi'
import { mockFiles } from '../_mocks/files.mock'

interface UseRepositoryDataParams {
  repositoryId: string
  filters: {
    pageNumber: number
    pageSize: number
    searchTerm?: string
  }
}

interface PaginatedData {
  data: any[]
  totalElements: number
  totalPages: number
  currentPage: number
}

export function useRepositoryData({ repositoryId, filters }: UseRepositoryDataParams) {
  const isReal = isRealRepository(repositoryId)

  return useQuery({
    queryKey: ['repository', repositoryId, filters],
    queryFn: async (): Promise<PaginatedData> => {
      if (isReal) {
        console.log(`[Repo ${repositoryId}] Fetching REAL data...`)
        const response = await repositoryApi.getFiles(filters)
        return {
          data: response.data || [],
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          currentPage: filters.pageNumber
        }
      }

      // Mock data
      console.log(`[Repo ${repositoryId}] Using MOCK data...`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get mock data for this repo
      const mockRepoData = mockFiles[repositoryId as keyof typeof mockFiles] || mockFiles.default
      let filtered = [...mockRepoData]

      // Filter by searchTerm
      if (filters.searchTerm) {
        filtered = filtered.filter(item => 
          JSON.stringify(item).toLowerCase().includes(filters.searchTerm!.toLowerCase())
        )
      }

      // Paginate
      const start = filters.pageNumber * filters.pageSize
      const end = start + filters.pageSize
      const paginated = filtered.slice(start, end)

      return {
        data: paginated,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / filters.pageSize),
        currentPage: filters.pageNumber
      }
    },
    staleTime: isReal ? 30000 : Infinity, // Real: 30s, Mock: never stale
    retry: isReal ? 3 : 0 // Retry for real, no retry for mock
  })
}
