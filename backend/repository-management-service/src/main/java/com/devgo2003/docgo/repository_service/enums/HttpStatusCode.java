package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum HTTP Status Code - STRICT MODE
 * Throw exception nếu invalid, không có UNKNOWN
 * Dùng cho API response status
 */
@Getter
public enum HttpStatusCode {
    OK(200, "OK", "Success"),
    CREATED(201, "Created", "Resource Created"),
    ACCEPTED(202, "Accepted", "Request Accepted"),
    NO_CONTENT(204, "No Content", "Success - No Content"),
    
    BAD_REQUEST(400, "Bad Request", "Invalid Request"),
    UNAUTHORIZED(401, "Unauthorized", "Authentication Required"),
    FORBIDDEN(403, "Forbidden", "Access Denied"),
    NOT_FOUND(404, "Not Found", "Resource Not Found"),
    CONFLICT(409, "Conflict", "Resource Conflict"),
    
    INTERNAL_SERVER_ERROR(500, "Internal Server Error", "Server Error"),
    SERVICE_UNAVAILABLE(503, "Service Unavailable", "Service Unavailable");

    private final int code;
    private final String message;
    private final String description;

    HttpStatusCode(int code, String message, String description) {
        this.code = code;
        this.message = message;
        this.description = description;
    }

    /**
     * Parse từ int - STRICT MODE
     * Throw IllegalArgumentException nếu không tìm thấy
     */
    public static HttpStatusCode fromInt(Integer value) {
        if (value == null) {
            throw new IllegalArgumentException("HTTP status code cannot be null");
        }
        
        for (HttpStatusCode status : values()) {
            if (status.code == value) {
                return status;
            }
        }
        
        throw new IllegalArgumentException(
            "Invalid HTTP status code: " + value + ". Must be one of: 200, 201, 202, 204, 400, 401, 403, 404, 409, 500, 503"
        );
    }

    /**
     * Parse từ string (number) - STRICT MODE
     */
    public static HttpStatusCode fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("HTTP status code cannot be null or empty");
        }
        
        try {
            int intValue = Integer.parseInt(value.trim());
            return fromInt(intValue);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                "Invalid HTTP status code format: " + value + ". Must be a number.",
                e
            );
        }
    }

    /**
     * Check if status is success (2xx)
     */
    public boolean isSuccess() {
        return code >= 200 && code < 300;
    }

    /**
     * Check if status is client error (4xx)
     */
    public boolean isClientError() {
        return code >= 400 && code < 500;
    }

    /**
     * Check if status is server error (5xx)
     */
    public boolean isServerError() {
        return code >= 500 && code < 600;
    }
}
