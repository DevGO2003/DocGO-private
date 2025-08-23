package com.devgo2003.docgo.contract_service.model;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class FileUploadResponse {
    
    private Long fileId;
    
    private String originalFilename;
    
    private String storedFilename;
    
    private String filePath;
    
    private Long fileSize;
    
    private String contentType;
    
    private LocalDateTime uploadDate;
    
    private Boolean isContract;
    
    private Long contractId;
    
    private String processingStatus;
    
    private String message;
}
