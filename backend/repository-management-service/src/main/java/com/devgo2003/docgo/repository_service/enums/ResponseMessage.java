package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum short response message - STRICT MODE
 * Throw exception nếu invalid, không có UNKNOWN
 * Dùng cho API response shortMessage field
 */
@Getter
public enum ResponseMessage {
    SUCCESS("SUCCESS", "Success", HttpStatusCode.OK),
    CREATED("CREATED", "Resource Created", HttpStatusCode.CREATED),
    NO_CONTENT("NO_CONTENT", "No Content", HttpStatusCode.NO_CONTENT),
    
    BAD_REQUEST("BAD_REQUEST", "Bad Request", HttpStatusCode.BAD_REQUEST),
    UNAUTHORIZED("UNAUTHORIZED", "Unauthorized", HttpStatusCode.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", "Forbidden", HttpStatusCode.FORBIDDEN),
    NOT_FOUND("NOT_FOUND", "Not Found", HttpStatusCode.NOT_FOUND),
    CONFLICT("CONFLICT", "Conflict", HttpStatusCode.CONFLICT),
    
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "Internal Server Error", HttpStatusCode.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE("SERVICE_UNAVAILABLE", "Service Unavailable", HttpStatusCode.SERVICE_UNAVAILABLE);

    private final String code;
    private final String description;
    private final HttpStatusCode httpStatus;

    ResponseMessage(String code, String description, HttpStatusCode httpStatus) {
        this.code = code;
        this.description = description;
        this.httpStatus = httpStatus;
    }

    /**
     * Parse từ string - STRICT MODE
     * Throw IllegalArgumentException nếu không tìm thấy
     */
    public static ResponseMessage fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Response message cannot be null or empty");
        }
        
        try {
            return ResponseMessage.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid response message: " + value + ". Must be one of: SUCCESS, CREATED, NO_CONTENT, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, INTERNAL_SERVER_ERROR, SERVICE_UNAVAILABLE",
                e
            );
        }
    }

    /**
     * Get from HTTP status code
     */
    public static ResponseMessage fromHttpStatus(HttpStatusCode httpStatus) {
        if (httpStatus == null) {
            throw new IllegalArgumentException("HTTP status code cannot be null");
        }
        
        for (ResponseMessage message : values()) {
            if (message.httpStatus == httpStatus) {
                return message;
            }
        }
        
        // Default mapping based on status code range
        if (httpStatus.isSuccess()) {
            return SUCCESS;
        } else if (httpStatus.isClientError()) {
            return BAD_REQUEST;
        } else if (httpStatus.isServerError()) {
            return INTERNAL_SERVER_ERROR;
        }
        
        return SUCCESS;
    }

    /**
     * Check if message indicates success
     */
    public boolean isSuccess() {
        return httpStatus.isSuccess();
    }

    /**
     * Check if message indicates error
     */
    public boolean isError() {
        return httpStatus.isClientError() || httpStatus.isServerError();
    }
}
