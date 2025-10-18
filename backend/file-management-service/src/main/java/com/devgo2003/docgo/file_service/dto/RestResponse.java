package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class RestResponse<T> {
    private String apiVersion;
    private Integer statusCode;
    private String shortMessage;
    private String description;
    private T data;
    private String timestamp;
    private String requestId;
    private String path;
}
