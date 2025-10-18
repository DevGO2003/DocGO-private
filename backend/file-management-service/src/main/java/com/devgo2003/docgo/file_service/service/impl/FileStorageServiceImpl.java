package com.devgo2003.docgo.file_service.service.impl;

import com.devgo2003.docgo.file_service.dto.FileDownloadResponse;
import com.devgo2003.docgo.file_service.dto.FileUploadResponse;
import com.devgo2003.docgo.file_service.entity.FileEntity;
import com.devgo2003.docgo.file_service.repository.FileRepository;
import com.devgo2003.docgo.file_service.service.FileStorageService;
// import com.devgo2003.docgo.file_service.event.FileUploadedEvent; // Removed
import org.springframework.kafka.core.KafkaTemplate;
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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.s3.bucket:docgo-files}")
    private String s3Bucket;

    @Autowired
    private FileRepository fileRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @Value("${app.kafka.topic.file-uploaded:file.uploaded}")
    private String fileUploadedTopic;

    // Debug: Constructor để kiểm tra service được tạo
    public FileStorageServiceImpl() {
        System.out.println("🔍 FileStorageServiceImpl: Constructor called - Service is being created!");
    }

    @Override
    public FileUploadResponse uploadFile(MultipartFile file, String userId, String folder) {
        try {
            System.out.println("🔍 FileStorageServiceImpl: uploadFile method called! - filename: " + file.getOriginalFilename() + ", userId: " + userId + ", folder: " + folder);
            
            // Generate unique file ID
            String fileId = UUID.randomUUID().toString();
            
            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get("uploads", folder != null ? folder : "default");
            Files.createDirectories(uploadDir);
            
            // Save file to local storage
            Path filePath = uploadDir.resolve(fileId + "_" + file.getOriginalFilename());
            Files.copy(file.getInputStream(), filePath);
            
            System.out.println("🔍 FileStorageServiceImpl: File saved to: " + filePath.toString());
            
            // Persist basic metadata to Mongo so GET one can find it by fileId
            System.out.println("🔍 FileStorageServiceImpl: About to persist metadata to MongoDB for fileId: " + fileId);
            try {
                FileEntity entity = new FileEntity();
                entity.setId(fileId);
                // Minimal metadata blocks; nested DTOs can be null-safe
                com.devgo2003.docgo.file_service.dto.FileInfo info = new com.devgo2003.docgo.file_service.dto.FileInfo();
                info.setId(fileId);
                info.setName(file.getOriginalFilename());
                info.setType(file.getContentType());
                info.setSize(file.getSize());
                entity.setFile(info);
                
                com.devgo2003.docgo.file_service.dto.Overview overview = new com.devgo2003.docgo.file_service.dto.Overview();
                overview.setTitle(file.getOriginalFilename());
                overview.setStatus("UPLOADED");
                overview.setOwnerUserId(userId);
                entity.setOverview(overview);
                
                com.devgo2003.docgo.file_service.dto.Storage storage = new com.devgo2003.docgo.file_service.dto.Storage();
                com.devgo2003.docgo.file_service.dto.LocalInfo localInfo = new com.devgo2003.docgo.file_service.dto.LocalInfo();
                localInfo.setPath(filePath.toString());
                storage.setLocal(localInfo);
                entity.setStorage(storage);
                
                // Initialize audit fields via BaseEntity helper if available
                entity.initializeNewEntity();
                
                fileRepository.save(entity);
                System.out.println("🔍 FileStorageServiceImpl: Metadata persisted successfully to MongoDB for fileId: " + fileId);
            } catch (Exception persistEx) {
                System.err.println("🔍 FileStorageServiceImpl: Warning - failed to persist metadata: " + persistEx.getMessage());
                persistEx.printStackTrace();
            }
            
            // Publish FileUploaded event to Kafka
            System.out.println("🔍 FileStorageServiceImpl: Checking KafkaTemplate - kafkaTemplate: " + (kafkaTemplate != null ? "AVAILABLE" : "NULL"));
            System.out.println("🔍 FileStorageServiceImpl: Topic name: " + fileUploadedTopic);
            
            if (kafkaTemplate != null) {
                try {
                    // FileUploadedEvent event = FileUploadedEvent.builder()
                    //         .documentId(fileId)
                    //         .fileId(fileId)
                    //         .fileName(file.getOriginalFilename())
                    //         .fileType(file.getContentType())
                    //         .fileSize(file.getSize())
                    //         .fileUrl(filePath.toString())
                    //         .userId(userId)
                    //         .s3Bucket(s3Bucket)
                    //         .actor("system")
                    //         .actorUserId(userId)
                    //         .build();
                    
                    // System.out.println("🔍 FileStorageServiceImpl: About to send event to Kafka topic: " + fileUploadedTopic);
                    // kafkaTemplate.send(fileUploadedTopic, fileId, event);
                    // System.out.println("🔍 FileStorageServiceImpl: FileUploaded event published to Kafka topic '" + fileUploadedTopic + "' for fileId: " + fileId);
                } catch (Exception eventEx) {
                    System.err.println("🔍 FileStorageServiceImpl: Warning - failed to publish FileUploaded event to Kafka: " + eventEx.getMessage());
                    eventEx.printStackTrace();
                    // Don't fail upload if event publishing fails
                }
            } else {
                System.out.println("🔍 FileStorageServiceImpl: KafkaTemplate not available, skipping event publishing");
            }
            
            return FileUploadResponse.builder()
                    .fileId(fileId)
                    .filename(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .fileType(file.getContentType())
                    .status("SUCCESS")
                    .uploadTime(LocalDateTime.now())
                    .message("File uploaded successfully")
                    .build();
                    
        } catch (IOException e) {
            System.err.println("🔍 FileStorageServiceImpl: Error uploading file: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    public FileDownloadResponse downloadFile(String fileId, String userId) {
        try {
            System.out.println("🔍 FileStorageServiceImpl: downloadFile method called! - fileId: " + fileId + ", userId: " + userId);
            
            // For now, return a placeholder response
            // In a real implementation, you would:
            // 1. Find the file by ID
            // 2. Check user permissions
            // 3. Return the file content
            
            return FileDownloadResponse.builder()
                    .fileId(fileId)
                    .filename("placeholder.txt")
                    .contentType("text/plain")
                    .resource(new ByteArrayResource("File content placeholder".getBytes()))
                    .build();
                    
        } catch (Exception e) {
            System.err.println("🔍 FileStorageServiceImpl: Error downloading file: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to download file: " + e.getMessage(), e);
        }
    }

    @Override
    public Page<FileEntity> getAllDocuments(int page, int size, String userId) {
        System.out.println("🔍 FileStorageServiceImpl: getAllDocuments method called! - page: " + page + ", size: " + size + ", userId: " + userId);
        try {
            System.out.println("🔍 FileStorageServiceImpl: Getting documents - page: " + page + ", size: " + size + ", userId: " + userId);
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "audit.createdAt"));
            
            long totalCount = fileRepository.count();
            System.out.println("🔍 FileStorageServiceImpl: Total documents in repository: " + totalCount);
            
            Page<FileEntity> result;
            if (userId != null && !userId.isEmpty()) {
                result = fileRepository.findByOverviewOwnerUserId(userId, pageable);
                System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents for user: " + userId);
            } else {
                result = fileRepository.findAll(pageable);
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
    public Page<FileEntity> getDocumentsByType(int page, int size, String userId, String documentType) {
        try {
            System.out.println("🔍 FileStorageServiceImpl: Getting documents by type - page: " + page + ", size: " + size + ", userId: " + userId + ", documentType: " + documentType);
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "audit.createdAt"));
            
            Page<FileEntity> result;
            if (documentType != null && !documentType.isEmpty()) {
                if (userId != null && !userId.isEmpty()) {
                    result = fileRepository.findByOverviewOwnerUserIdAndOverviewDocumentType(userId, documentType, pageable);
                    System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents for user: " + userId + " and type: " + documentType);
                } else {
                    result = fileRepository.findByOverviewDocumentType(documentType, pageable);
                    System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents for type: " + documentType);
                }
            } else {
                if (userId != null && !userId.isEmpty()) {
                    result = fileRepository.findByOverviewOwnerUserId(userId, pageable);
                    System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents for user: " + userId);
                } else {
                    result = fileRepository.findAll(pageable);
                    System.out.println("🔍 FileStorageServiceImpl: Found " + result.getTotalElements() + " documents total");
                }
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("🔍 FileStorageServiceImpl: Error getting documents by type: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get documents by type: " + e.getMessage(), e);
        }
    }
}
