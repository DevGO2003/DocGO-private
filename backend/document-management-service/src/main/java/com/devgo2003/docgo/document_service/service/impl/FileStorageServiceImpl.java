package com.devgo2003.docgo.document_service.service.impl;

import com.devgo2003.docgo.document_service.dto.FileDownloadResponse;
import com.devgo2003.docgo.document_service.dto.FileUploadResponse;
import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import com.devgo2003.docgo.document_service.repository.DocumentRepository;
import com.devgo2003.docgo.document_service.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.s3.bucket:docgo-files}")
    private String s3Bucket;

    @Autowired
    private DocumentRepository documentRepository;

    // Debug: Constructor để kiểm tra service được tạo
    public FileStorageServiceImpl() {
        System.out.println("🔍 FileStorageServiceImpl: Constructor called - Service is being created!");
    }

    // Debug: PostConstruct để kiểm tra service được initialize
    @PostConstruct
    public void init() {
        System.out.println("🔍 FileStorageServiceImpl: @PostConstruct called - Service is initialized!");
        System.out.println("🔍 FileStorageServiceImpl: DocumentRepository is " + (documentRepository != null ? "injected" : "NULL"));
    }

    @Override
    public FileUploadResponse uploadFile(MultipartFile file, String userId, String folder) {
        try {
            String fileId = UUID.randomUUID().toString();
            String s3Key = (folder != null && !folder.isEmpty() ? folder + "/" : "") + fileId + "_" + file.getOriginalFilename();

            // For now, we'll simulate file upload
            // In real implementation, you would upload to S3 here
            
            return FileUploadResponse.builder()
                .fileId(fileId)
                .filename(file.getOriginalFilename())
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .status("uploaded")
                .uploadTime(LocalDateTime.now())
                .message("File đã được upload thành công")
                .s3Key(s3Key)
                .bucket(s3Bucket)
                .fileUrl("http://localhost:8002/documents/" + fileId)
                .build();
                
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    public FileDownloadResponse downloadFile(String fileId, String userId) {
        try {
            // For now, we'll simulate file download
            // In real implementation, you would download from S3 here
            
            // Create a dummy resource for demonstration
            byte[] dummyContent = "This is a dummy file content for demonstration".getBytes();
            Resource resource = new ByteArrayResource(dummyContent);
            
            return FileDownloadResponse.builder()
                .resource(resource)
                .filename("downloaded_file_" + fileId + ".txt")
                .contentType("text/plain")
                .build();
                
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file: " + e.getMessage(), e);
        }
    }

    @Override
    public Page<DocumentEntity> getAllDocuments(int page, int size, String userId) {
        System.out.println("🔍 FileStorageServiceImpl: getAllDocuments method called! - page: " + page + ", size: " + size + ", userId: " + userId);
        try {
            System.out.println("🔍 FileStorageServiceImpl: Getting documents - page: " + page + ", size: " + size + ", userId: " + userId);
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            long totalCount = documentRepository.count();
            System.out.println("🔍 FileStorageServiceImpl: Total documents in repository: " + totalCount);
            
            Page<DocumentEntity> result;
            if (userId != null && !userId.isEmpty()) {
                result = documentRepository.findByUserId(userId, pageable);
                System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents for user: " + userId);
            } else {
                result = documentRepository.findAll(pageable);
                System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents total");
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("🔍 FileStorageServiceImpl: Error getting documents: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get documents: " + e.getMessage(), e);
        }
    }

    @Override
    public Page<DocumentEntity> getDocumentsByType(int page, int size, String userId, String documentType) {
        try {
            System.out.println("🔍 FileStorageServiceImpl: Getting documents by type - page: " + page + ", size: " + size + ", userId: " + userId + ", documentType: " + documentType);
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            Page<DocumentEntity> result;
            if (documentType != null && !documentType.isEmpty()) {
                if (userId != null && !userId.isEmpty()) {
                    result = documentRepository.findByUserIdAndDocumentType(userId, documentType, pageable);
                    System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents for user: " + userId + " and type: " + documentType);
                } else {
                    result = documentRepository.findByDocumentType(documentType, pageable);
                    System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents for type: " + documentType);
                }
            } else {
                return getAllDocuments(page, size, userId);
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("🔍 FileStorageServiceImpl: Error getting documents by type: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get documents by type: " + e.getMessage(), e);
        }
    }
}
