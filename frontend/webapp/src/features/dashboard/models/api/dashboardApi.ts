import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@shared/lib/api/apiClient';

export interface DashboardStats {
  repositories: number;
  files: number;
  organizations: number;
  totalContracts: number;
  pendingContracts: number;
  approvedContracts: number;
}

const BASE_PATH = '/api/v1';

const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>(`/api/v1/user-management-service/dashboard/stats`);
    return response.data.data!;
  },
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default dashboardApi;
