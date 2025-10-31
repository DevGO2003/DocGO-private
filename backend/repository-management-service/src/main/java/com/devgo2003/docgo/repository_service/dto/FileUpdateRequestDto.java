package com.devgo2003.docgo.repository_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileUpdateRequestDto {
    private String title;
    private String archiveSerial;
    private String dateCreated;
    private String correspondentId;
    private String documentType;
    private String storagePath;
    private List<String> tags;
    private String description;
    private String status; // ACTIVE, ARCHIVED, DRAFT
}
