package com.devgo2003.docgo.file_service.service.impl;

import com.devgo2003.docgo.file_service.entity.FileEntity;
import com.devgo2003.docgo.file_service.service.IJsonAnalysisService;
import com.devgo2003.docgo.file_service.service.FileService;
import com.devgo2003.docgo.file_service.dto.ProcessingInfo;
import com.devgo2003.docgo.file_service.dto.JsonAnalysisEventDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class JsonAnalysisServiceImpl implements IJsonAnalysisService {
    
    private static final Logger logger = LoggerFactory.getLogger(JsonAnalysisServiceImpl.class);
    
    @Autowired
    private FileService fileService;
    
    @Override
    public FileEntity analyzeJsonContent(FileEntity fileEntity, String jsonContent) {
        try {
            logger.info("🔍 JsonAnalysisServiceImpl: Analyzing JSON content for file: {}", fileEntity.getId());
            
            // Cập nhật thông tin processing
            if (fileEntity.getProcessing() != null) {
                fileEntity.getProcessing().setJsonAnalysisCompleted(true);
                fileEntity.getProcessing().setJsonAnalysisTimestamp(LocalDateTime.now());
            } else {
                // Tạo ProcessingInfo mới nếu chưa có
                ProcessingInfo processing = new ProcessingInfo();
                processing.setJsonAnalysisCompleted(true);
                processing.setJsonAnalysisTimestamp(LocalDateTime.now());
                fileEntity.setProcessing(processing);
            }
            
            // Cập nhật content với JSON data
            if (fileEntity.getContent() != null) {
                fileEntity.getContent().setJsonContent(jsonContent);
                fileEntity.getContent().setJsonAnalysisStatus("COMPLETED");
            }
            
            logger.info("🔍 JsonAnalysisServiceImpl: JSON analysis completed for file: {}", fileEntity.getId());
            return fileEntity;
            
        } catch (Exception e) {
            logger.error("🔍 JsonAnalysisServiceImpl: Error analyzing JSON content for file: {}", fileEntity.getId(), e);
            throw new RuntimeException("Failed to analyze JSON content: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void processJsonAnalysisEvent(String fileId, String jsonContent) {
        try {
            logger.info("🔍 JsonAnalysisServiceImpl: Processing JSON analysis event for file: {}", fileId);
            
            // Tìm file entity
            Optional<FileEntity> fileEntityOpt = fileService.findById(fileId);
            if (fileEntityOpt.isEmpty()) {
                logger.warn("🔍 JsonAnalysisServiceImpl: File not found: {}", fileId);
                return;
            }
            
            FileEntity fileEntity = fileEntityOpt.get();
            
            // Phân tích JSON content
            FileEntity updatedFileEntity = analyzeJsonContent(fileEntity, jsonContent);
            
            // Lưu lại file entity
            fileService.save(updatedFileEntity);
            
            logger.info("🔍 JsonAnalysisServiceImpl: JSON analysis event processed successfully for file: {}", fileId);
            
        } catch (Exception e) {
            logger.error("🔍 JsonAnalysisServiceImpl: Error processing JSON analysis event for file: {}", fileId, e);
            throw new RuntimeException("Failed to process JSON analysis event: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void processJsonAnalysisCompleted(JsonAnalysisEventDto event) {
        try {
            logger.info("🔍 JsonAnalysisServiceImpl: Processing JSON analysis completed event for jobId: {}", 
                event.getData().getJobId());
            
            // Lấy fileId từ event data
            String fileId = event.getData().getFileId();
            String jsonContent = event.getData().getJsonContent();
            
            if (fileId == null || fileId.isEmpty()) {
                logger.warn("🔍 JsonAnalysisServiceImpl: FileId is null or empty in event");
                return;
            }
            
            // Xử lý event
            processJsonAnalysisEvent(fileId, jsonContent);
            
            logger.info("🔍 JsonAnalysisServiceImpl: JSON analysis completed event processed successfully for jobId: {}", 
                event.getData().getJobId());
            
        } catch (Exception e) {
            logger.error("🔍 JsonAnalysisServiceImpl: Error processing JSON analysis completed event for jobId: {}", 
                event.getData().getJobId(), e);
            throw new RuntimeException("Failed to process JSON analysis completed event: " + e.getMessage(), e);
        }
    }
}
