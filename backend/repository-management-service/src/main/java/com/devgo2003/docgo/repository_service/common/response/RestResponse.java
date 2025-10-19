package com.devgo2003.docgo.repository_service.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RestResponse<T> {
    private String apiVersion;
    private int statusCode;
    private String shortMessage;
    private String description;
    private T data;
    private Instant timestamp;
    private String requestId;
    private String path;
}


