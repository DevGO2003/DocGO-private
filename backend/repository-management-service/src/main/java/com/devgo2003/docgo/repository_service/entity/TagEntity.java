package com.devgo2003.docgo.repository_service.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tags")
public class TagEntity {
    @Id
    private String id;
    
    @Field
    private String name;
    
    @Field
    private String color;
    
    @Field
    private String category;
    
    @Field
    @Builder.Default
    private Boolean isDeleted = false;
    
    @Field
    private String createdAt;
    
    @Field
    private String updatedAt;
}
