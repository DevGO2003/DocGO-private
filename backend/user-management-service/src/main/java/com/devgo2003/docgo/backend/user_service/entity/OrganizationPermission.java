package com.devgo2003.docgo.backend.user_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "organization_permissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationPermission {

    @org.springframework.data.annotation.Id
    private String id;

    @Field("organization_id")
    private String organizationId;

    @Field("name")
    private String name;

    @Field("code")
    private String code;

    @Field("display_name")
    private String displayName;

    @Field("description")
    private String description;

    @Field("resource")
    private String resource;

    @Field("action")
    private String action;

    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Field("created_by")
    private String createdBy;

    @Field("updated_by")
    private String updatedBy;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}



