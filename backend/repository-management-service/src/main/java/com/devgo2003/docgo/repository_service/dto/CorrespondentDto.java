package com.devgo2003.docgo.repository_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrespondentDto {
    private String id;
    private String name;
    private String email;
    private String organization;
    private String phone;
    private String address;
}
