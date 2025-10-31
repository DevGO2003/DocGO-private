package com.devgo2003.docgo.repository_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeDto {
    private String id;
    private String name;
    private String category;
    private String description;
}
