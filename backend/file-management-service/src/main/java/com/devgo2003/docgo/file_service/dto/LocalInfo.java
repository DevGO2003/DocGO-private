package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocalInfo {
    private String path;
    private String filename;
    private String mimeType;
    private Long size;
    private String mtime;
    private String revision;
}
