package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileMetadata {
    private FileSystemInfo fileSystem;
    
    // 🆕 NEW FIELDS
    private OriginalDocument originalDocument;  // 🆕 NEW NESTED OBJECT
    private ArchivedDocument archivedDocument; // 🆕 NEW NESTED OBJECT
    private TechnicalInfo technical;           // 🆕 NEW NESTED OBJECT
}
