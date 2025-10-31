import { apiClient } from '@shared/lib/api/apiClient';

export interface FileUpdateRequest {
  title?: string;
  archiveSerial?: string;
  dateCreated?: string;
  correspondentId?: string;
  documentTypeId?: string;
  storagePath?: string;
  tags?: string[];
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  documentType?: string;
}

export interface Correspondent {
  id: string;
  name: string;
  email?: string;
  organization?: string;
}

export interface DocumentType {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  category?: string;
}

/**
 * Get file details by ID
 */
export async function getFileDetails(fileId: string) {
  return apiClient.get(`/api/v1/repository-management-service/files/${fileId}`);
}

/**
 * Update file details
 */
export async function updateFileDetails(fileId: string, data: FileUpdateRequest) {
  return apiClient.put(`/api/v1/repository-management-service/files/${fileId}`, data);
}

/**
 * Get all correspondents for dropdown
 */
export async function getCorrespondents(search?: string) {
  const params = search ? { search } : {};
  return apiClient.get('/api/v1/repository-management-service/correspondents', { params });
}

/**
 * Create new correspondent
 */
export async function createCorrespondent(data: Omit<Correspondent, 'id'>) {
  return apiClient.post('/api/v1/repository-management-service/correspondents', data);
}

/**
 * Get all document types
 */
export async function getDocumentTypes() {
  return apiClient.get('/api/v1/repository-management-service/document-types');
}

/**
 * Create new document type
 */
export async function createDocumentType(data: Omit<DocumentType, 'id'>) {
  return apiClient.post('/api/v1/repository-management-service/document-types', data);
}

/**
 * Get all tags
 */
export async function getTags(search?: string) {
  const params = search ? { search } : {};
  return apiClient.get('/api/v1/repository-management-service/tags', { params });
}

/**
 * Create new tag
 */
export async function createTag(data: Omit<Tag, 'id'>) {
  return apiClient.post('/api/v1/repository-management-service/tags', data);
}

/**
 * Get storage paths
 */
export async function getStoragePaths() {
  return apiClient.get('/api/v1/repository-management-service/storage-paths');
}

/**
 * Auto-increment archive serial number
 */
export async function incrementArchiveSerial(fileId: string) {
  return apiClient.patch(`/api/v1/repository-management-service/files/${fileId}/archive-serial`);
}

/**
 * Delete file
 */
export async function deleteFile(fileId: string) {
  return apiClient.delete(`/api/v1/repository-management-service/files/${fileId}`);
}

/**
 * Download file
 */
export async function downloadFile(fileId: string) {
  return apiClient.get(`/api/v1/repository-management-service/files/${fileId}/download`, {
    responseType: 'blob',
  });
}
