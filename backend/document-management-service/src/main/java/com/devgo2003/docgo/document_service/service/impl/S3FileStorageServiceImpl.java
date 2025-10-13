package com.devgo2003.docgo.document_service.service.impl;

import com.devgo2003.docgo.document_service.dto.FileUploadResponse;
import com.devgo2003.docgo.document_service.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class S3FileStorageServiceImpl implements FileStorageService {
    
    @Value("${app.s3.endpoint:https://s3.filebase.com}")
    private String s3Endpoint;
    
    @Value("${app.s3.region:us-east-1}")
    private String s3Region;
    
    @Value("${app.s3.access-key:}")
    private String s3AccessKey;
    
    @Value("${app.s3.secret-key:}")
    private String s3SecretKey;
    
    @Value("${app.s3.bucket:docgo-files}")
    private String s3Bucket;
    
    private S3Client s3Client;
    
    private S3Client getS3Client() {
        if (s3Client == null) {
            AwsBasicCredentials credentials = AwsBasicCredentials.create(s3AccessKey, s3SecretKey);
            
            s3Client = S3Client.builder()
                    .region(Region.of(s3Region))
                    .endpointOverride(java.net.URI.create(s3Endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(credentials))
                    .build();
        }
        return s3Client;
    }
    
    @Override
    public FileUploadResponse uploadFile(MultipartFile file, String userId, String folder) {
        try {
            // Generate unique file key
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileId = UUID.randomUUID().toString();
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String s3Key = String.format("documents/%s/%s_%s%s", 
                    userId, timestamp, fileId, fileExtension);
            
            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(s3Bucket)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();
            
            PutObjectResponse response = getS3Client().putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            // Generate file URL
            String fileUrl = String.format("%s/%s/%s", s3Endpoint, s3Bucket, s3Key);
            
            log.info("File uploaded successfully: fileId={}, s3Key={}, size={}", 
                    fileId, s3Key, file.getSize());
            
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
                    .fileUrl(fileUrl)
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to upload file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex);
    }
}


