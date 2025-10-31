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
@Document(collection = "correspondents")
public class CorrespondentEntity {
    @Id
    private String id;
    
    @Field
    private String name;
    
    @Field
    private String email;
    
    @Field
    private String organization;
    
    @Field
    private String phone;
    
    @Field
    private String address;
    
    @Field
    @Builder.Default
    private Boolean isDeleted = false;
    
    @Field
    private String createdAt;
    
    @Field
    private String updatedAt;
}
