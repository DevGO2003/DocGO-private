package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeyClause {
    private String name;
    private String description;
    private String importance;
    private String risk;
}

