package com.devgo2003.docgo.document_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileSystemMetadata {
    private LocalDateTime dateModified;
    private LocalDateTime dateAdded;
    private String mediaFilename;
    private String originalFilename;
    private String originalMD5;
    private Long originalFileSize;
    private String originalMimeType;
    private String archiveMD5;
    private Long archiveFileSize;
}

