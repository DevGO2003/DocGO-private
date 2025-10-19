package com.devgo2003.docgo.file_service.common.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestResponse<T> {
    private String apiVersion;
    private Integer statusCode;
    private String shortMessage;
    private String description;
    private T data;
    private Instant timestamp;
    private String requestId;
    private String path;
    
    public static <T> RestResponse<T> success(T data) {
        return RestResponse.<T>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Operation completed successfully")
            .data(data)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .build();
    }
    
    public static <T> RestResponse<T> error(Integer statusCode, String message) {
        return RestResponse.<T>builder()
            .apiVersion("v1")
            .statusCode(statusCode)
            .shortMessage("Error")
            .description(message)
            .data(null)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .build();
    }
}