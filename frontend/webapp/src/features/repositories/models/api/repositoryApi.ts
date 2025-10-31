import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/lib/api';
import {
  Repository,
  RepositoryCreateData,
  RepositoryUpdateData,
  FileItem,
  FileUploadData,
  Contract,
  ContractCreateData,
  ContractUpdateData,
  Document,
  DocumentCreateData,
  PaginationParams,
  PaginatedResponse,
} from '../types/repository.types';
import type { FileUnion } from '../types/file.types';
import { mapFileApiToUiDocument } from '../../services/mappers/file-mapper';

const BASE_PATH = '/api/v1/repository-management-service';

// Repository API
const repositoryApi = {
  // Repositories
  getAllRepositories: async (params?: PaginationParams): Promise<PaginatedResponse<Repository>> => {
    const response = await apiClient.get<PaginatedResponse<Repository>>(
      `${BASE_PATH}/repositories`,
      { params }
    );
    return response.data.data!;
  },

  getRepositoryById: async (id: string): Promise<Repository> => {
    const response = await apiClient.get<Repository>(`${BASE_PATH}/repositories/${id}`);
    return response.data.data!;
  },

  getMyRepositories: async (params?: PaginationParams & { searchTerm?: string }): Promise<PaginatedResponse<Repository>> => {
    const response = await apiClient.get<PaginatedResponse<Repository>>(
      `${BASE_PATH}/repositories/my`,
      { params }
    );
    return response.data.data!;
  },

  getPersonalRepositories: async (params?: PaginationParams): Promise<PaginatedResponse<Repository>> => {
    // Align to backend Swagger: personal repos via /repositories/my
    const response = await apiClient.get<PaginatedResponse<Repository>>(
      `${BASE_PATH}/repositories/my`,
      { params }
    );
    return response.data.data!;
  },

  getOrganizationRepositories: async (params?: PaginationParams & { organizationId?: string }): Promise<PaginatedResponse<Repository>> => {
    const response = await apiClient.get<PaginatedResponse<Repository>>(
      `${BASE_PATH}/repositories/organization`,
      { params }
    );
    return response.data.data!;
  },

  getPublicRepositories: async (params?: PaginationParams): Promise<PaginatedResponse<Repository>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Repository>>(
        `${BASE_PATH}/repositories/public`,
        { params }
      );
      return response.data.data!;
    } catch (err) {
      // Fallback khi backend chưa có: trả về trang rỗng để UI hiển thị bình thường
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: params?.page ?? 0,
        pageSize: params?.size ?? 0,
        hasNext: false,
        hasPrevious: false,
      };
    }
  },

  createRepository: async (data: RepositoryCreateData): Promise<Repository> => {
    const response = await apiClient.post<Repository>(`${BASE_PATH}/repositories`, data);
    return response.data.data!;
  },

  updateRepository: async (id: string, data: RepositoryUpdateData): Promise<Repository> => {
    const response = await apiClient.put<Repository>(`${BASE_PATH}/repositories/${id}`, data);
    return response.data.data!;
  },

  deleteRepository: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`${BASE_PATH}/repositories/${id}`);
  },

  // Files
  getAllFiles: async (params?: PaginationParams): Promise<PaginatedResponse<FileItem>> => {
    const response = await apiClient.get<PaginatedResponse<FileItem>>(
      `${BASE_PATH}/files`,
      { params }
    );
    return response.data.data!;
  },

  // Files by Repository
  getRepositoryFiles: async (
    repositoryId: string,
    params?: PaginationParams & { searchTerm?: string; status?: string; type?: string; tags?: string[] }
  ): Promise<PaginatedResponse<FileItem>> => {
    const response = await apiClient.get<PaginatedResponse<FileItem>>(
      `${BASE_PATH}/repositories/${repositoryId}/files`,
      { params }
    );
    return response.data.data!;
  },

  getFileById: async (id: string): Promise<FileUnion> => {
    const response = await apiClient.get<any>(`${BASE_PATH}/files/${id}`);
    return mapFileApiToUiDocument(response.data.data as any);
  },

  uploadFile: async ({ file, repositoryId, tags, metadata }: FileUploadData): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Prepare metadata object
    const metadataObj: any = {};
    if (repositoryId) metadataObj.repositoryId = repositoryId;
    if (tags) metadataObj.tags = tags;
    if (metadata) Object.assign(metadataObj, metadata);
    
    // Append metadata as JSON string
    if (Object.keys(metadataObj).length > 0) {
      formData.append('metadata', JSON.stringify(metadataObj));
    }

    // Append repository_id for automation-service upload API
    if (repositoryId) {
      formData.append('repository_id', repositoryId);
    }
    
    // Use Automation Service endpoint through API Gateway
    const response = await apiClient.post<FileItem>(`/api/v1/automation-service/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  deleteFile: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`${BASE_PATH}/files/${id}`);
  },

  downloadFile: async (id: string): Promise<Blob> => {
    const response = await apiClient.getRaw<Blob>(`${BASE_PATH}/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Contracts
  getAllContracts: async (params?: PaginationParams): Promise<PaginatedResponse<Contract>> => {
    const response = await apiClient.get<PaginatedResponse<Contract>>(
      `${BASE_PATH}/contracts`,
      { params }
    );
    return response.data.data!;
  },

  getContractById: async (id: string): Promise<Contract> => {
    const response = await apiClient.get<Contract>(`${BASE_PATH}/contracts/${id}`);
    return response.data.data!;
  },

  createContract: async (data: ContractCreateData): Promise<Contract> => {
    const response = await apiClient.post<Contract>(`${BASE_PATH}/contracts`, data);
    return response.data.data!;
  },

  updateContract: async (id: string, data: ContractUpdateData): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`${BASE_PATH}/contracts/${id}`, data);
    return response.data.data!;
  },

  deleteContract: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`${BASE_PATH}/contracts/${id}`);
  },

  restoreContract: async (id: string): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`${BASE_PATH}/contracts/${id}/restore`);
    return response.data.data!;
  },

  // Documents
  getAllDocuments: async (params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    const response = await apiClient.get<PaginatedResponse<Document>>(
      `${BASE_PATH}/documents`,
      { params }
    );
    return response.data.data!;
  },

  getDocumentById: async (id: string): Promise<Document> => {
    const response = await apiClient.get<Document>(`${BASE_PATH}/documents/${id}`);
    return response.data.data!;
  },

  createDocument: async (data: DocumentCreateData): Promise<Document> => {
    const response = await apiClient.post<Document>(`${BASE_PATH}/documents`, data);
    return response.data.data!;
  },

  updateDocument: async (id: string, data: Partial<DocumentCreateData>): Promise<Document> => {
    const response = await apiClient.put<Document>(`${BASE_PATH}/documents/${id}`, data);
    return response.data.data!;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`${BASE_PATH}/documents/${id}`);
  },

  restoreDocument: async (id: string): Promise<Document> => {
    const response = await apiClient.put<Document>(`${BASE_PATH}/documents/${id}/restore`);
    return response.data.data!;
  },
};

// React Query hooks

// Repositories
export const useRepositories = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['repositories', params],
    queryFn: () => repositoryApi.getAllRepositories(params),
  });
};

export const useMyRepositories = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['my-repositories', params],
    queryFn: () => repositoryApi.getMyRepositories(params),
  });
};

export const usePersonalRepositories = (params?: PaginationParams & { userId?: string }) => {
  return useQuery({
    queryKey: ['personal-repositories', params],
    queryFn: () => repositoryApi.getPersonalRepositories(params),
  });
};

export const useOrganizationRepositories = (params?: PaginationParams & { organizationId?: string }) => {
  return useQuery({
    queryKey: ['organization-repositories', params],
    queryFn: () => repositoryApi.getOrganizationRepositories(params),
    enabled: !!params?.organizationId,
  });
};

export const usePublicRepositories = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['public-repositories', params],
    queryFn: () => repositoryApi.getPublicRepositories(params),
  });
};

export const useRepository = (id: string) => {
  return useQuery({
    queryKey: ['repository', id],
    queryFn: () => repositoryApi.getRepositoryById(id),
    enabled: !!id,
  });
};

export const useCreateRepository = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repositoryApi.createRepository,
    onSuccess: () => {
      // Generic lists
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      queryClient.invalidateQueries({ queryKey: ['my-repositories'] });
      // Pages using specific keys
      queryClient.invalidateQueries({ queryKey: ['personal-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['organization-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['public-repositories'] });
    },
  });
};

export const useUpdateRepository = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RepositoryUpdateData }) =>
      repositoryApi.updateRepository(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repository', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
};

export const useDeleteRepository = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repositoryApi.deleteRepository,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
};

// Files
export const useFiles = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => repositoryApi.getAllFiles(params),
  });
};

export const useRepositoryFiles = (repositoryId: string, params?: PaginationParams & { searchTerm?: string; status?: string; type?: string; tags?: string[] }) => {
  return useQuery({
    queryKey: ['repository-files', repositoryId, params],
    queryFn: () => repositoryApi.getRepositoryFiles(repositoryId, params),
    enabled: !!repositoryId,
  });
};

export const useFile = (id: string) => {
  return useQuery({
    queryKey: ['file', id],
    queryFn: () => repositoryApi.getFileById(id),
    enabled: !!id,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repositoryApi.uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repositoryApi.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

// Contracts
export const useContracts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: () => repositoryApi.getAllContracts(params),
  });
};

export const useOrganizationContracts = (
  orgId: string,
  params?: PaginationParams & { organizationId?: string }
) => {
  return useQuery({
    queryKey: ['organization-contracts', orgId, params],
    queryFn: () => repositoryApi.getAllContracts({ ...(params || {}), organizationId: orgId } as any),
    enabled: !!orgId,
  });
};

export const useContract = (id: string) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => repositoryApi.getContractById(id),
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repositoryApi.createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContractUpdateData }) =>
      repositoryApi.updateContract(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repositoryApi.deleteContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

// Documents
export const useDocuments = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => repositoryApi.getAllDocuments(params),
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => repositoryApi.getDocumentById(id),
    enabled: !!id,
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repositoryApi.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentCreateData> }) =>
      repositoryApi.updateDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repositoryApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export default repositoryApi;
