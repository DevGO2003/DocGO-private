package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.dto.FileUpdateRequestDto;
import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.service.file.IFileDetailService;
import com.devgo2003.docgo.repository_service.service.core.IFileService;
import com.devgo2003.docgo.repository_service.service.core.mapper.IFileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
