package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OverviewDto {
    private String title;
    private String status;
    private String documentType;
    private String contractType;
    private String category;
    private List<String> tags;
    private String ownerUserId;
    private String language;
    private String region;
    private Boolean isNew;
}

