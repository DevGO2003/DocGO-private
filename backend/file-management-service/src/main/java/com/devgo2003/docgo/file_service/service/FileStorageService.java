package com.devgo2003.docgo.file_service.service;

import com.devgo2003.docgo.file_service.dto.FileDownloadResponse;
import com.devgo2003.docgo.file_service.dto.FileUploadResponse;
import com.devgo2003.docgo.file_service.entity.FileEntity;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    FileUploadResponse uploadFile(MultipartFile file, String userId, String folder);
    FileDownloadResponse downloadFile(String fileId, String userId);
    Page<FileEntity> getAllDocuments(int page, int size, String userId);
    Page<FileEntity> getDocumentsByType(int page, int size, String userId, String documentType);
}
