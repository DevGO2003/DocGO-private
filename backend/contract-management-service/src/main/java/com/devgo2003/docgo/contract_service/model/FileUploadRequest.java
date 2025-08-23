package com.devgo2003.docgo.contract_service.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class FileUploadRequest {
    
    private MultipartFile file;
    
    private String description;
    
    private String tags;
    
    private Boolean isContract = false;
}
