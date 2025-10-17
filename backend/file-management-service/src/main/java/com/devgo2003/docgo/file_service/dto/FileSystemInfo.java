package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileSystemInfo {
    private String dateModified;
    private String dateAdded;
    private String mediaFilename;
    private String originalFilename;
    private String originalMD5;
    private Long originalFileSize;
    private String originalMimeType;
    private String archiveMD5;
    private Long archiveFileSize;
}
