package com.devgo2003.docgo.repository_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryPermissionDTO {
    private String userId;
    private String userName; // Enrich from User Service
    private String role;
    private List<String> permissions; // UPLOAD, VIEW, DELETE
    private String grantedBy;
    private String grantedByName; // Enrich from User Service
    private LocalDateTime grantedAt;
}
