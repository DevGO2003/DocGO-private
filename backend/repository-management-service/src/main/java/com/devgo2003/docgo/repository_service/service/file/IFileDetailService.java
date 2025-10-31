package com.devgo2003.docgo.repository_service.service.file;

import com.devgo2003.docgo.repository_service.dto.FileUpdateRequestDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;

public interface IFileDetailService {
    FileEntity updateFileDetails(String fileId, FileUpdateRequestDto updateRequest);
    
    String incrementArchiveSerial(String fileId);
    
    void deleteFile(String fileId);
}
