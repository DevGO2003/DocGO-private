package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.dto.FileUpdateRequestDto;
import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.service.file.IFileDetailService;
import com.devgo2003.docgo.repository_service.service.core.IFileService;
import com.devgo2003.docgo.repository_service.service.core.mapper.IFileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/repository-management-service/files")
@RequiredArgsConstructor
public class FileDetailController {
    
    private final IFileService fileService;
    private final IFileDetailService fileDetailService;
    private final IFileMapper fileMapper;
    
    
    
    /**
     * Update file details
     */
    @PutMapping("/{fileId}")
    public ResponseEntity<FullFileResponseDto> updateFileDetails(
            @PathVariable String fileId,
            @RequestBody FileUpdateRequestDto updateRequest) {
        log.info("PUT /files/{} - Update request: {}", fileId, updateRequest);
        
        FileEntity updatedFile = fileDetailService.updateFileDetails(fileId, updateRequest);
        FullFileResponseDto response = fileMapper.toFullResponseDto(updatedFile);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Auto-increment archive serial number
     */
    @PatchMapping("/{fileId}/archive-serial")
    public ResponseEntity<Map<String, String>> incrementArchiveSerial(@PathVariable String fileId) {
        log.info("PATCH /files/{}/archive-serial", fileId);
        
        String newSerial = fileDetailService.incrementArchiveSerial(fileId);
        
        Map<String, String> response = new HashMap<>();
        response.put("fileId", fileId);
        response.put("newArchiveSerial", newSerial);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Soft delete file
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String fileId) {
        log.info("DELETE /files/{}", fileId);
        
        fileDetailService.deleteFile(fileId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "File deleted successfully");
        response.put("fileId", fileId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Download file - streams from S3 or serves local file
     */
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileId) {
        log.info("GET /files/{}/download", fileId);
        
        try {
            // Get file entity
            FileEntity file = fileService.getFileById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));
            
            Map<String, Object> storage = file.getStorage();
            Map<String, Object> overview = file.getOverview();
            String fileName = (String) overview.getOrDefault("title", "document");
            
            log.info("Storage type: {}", storage.get("type"));
            
            // Check storage type
            String storageType = (String) storage.get("type");
            
            if ("s3".equals(storageType)) {
                // File is stored in S3 - provide direct URL
                @SuppressWarnings("unchecked")
                Map<String, Object> s3Data = (Map<String, Object>) storage.get("s3");
                String s3Url = (String) s3Data.get("url");
                
                if (s3Url == null || s3Url.isEmpty()) {
                    throw new RuntimeException("S3 URL not found in storage");
                }
                
                log.warn("S3 presigned URL may be expired. Redirecting to S3 URL: {}", s3Url);
                
                // Redirect to S3 URL (URL may be expired - needs refresh mechanism)
                return ResponseEntity.status(302)
                    .header(HttpHeaders.LOCATION, s3Url)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .build();
                    
            } else {
                // File is stored locally - serve from disk
                String filePath = null;
                
                // Try multiple path locations
                if (storage.get("path") != null) {
                    filePath = (String) storage.get("path");
                } else if (storage.get("filePath") != null) {
                    filePath = (String) storage.get("filePath");
                } else if (storage.get("localPath") != null) {
                    filePath = (String) storage.get("localPath");
                }
                
                if (filePath == null || filePath.isEmpty()) {
                    throw new RuntimeException("File path not found in storage");
                }
                
                // Load file as Resource
                Path path = Paths.get(filePath);
                Resource resource = new UrlResource(path.toUri());
                
                if (!resource.exists() || !resource.isReadable()) {
                    throw new RuntimeException("File not found or not readable: " + filePath);
                }
                
                // Return file as download
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + ".pdf\"")
                    .body(resource);
            }
                
        } catch (Exception e) {
            log.error("Error downloading file {}: {}", fileId, e.getMessage(), e);
            throw new RuntimeException("Failed to download file: " + e.getMessage());
        }
    }
}
