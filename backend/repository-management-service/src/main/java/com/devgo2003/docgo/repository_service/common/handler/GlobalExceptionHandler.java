package com.devgo2003.docgo.repository_service.common.handler;

import com.devgo2003.docgo.repository_service.common.exception.FileNotFoundException;
import com.devgo2003.docgo.repository_service.common.exception.ResourceNotFoundException;
import com.devgo2003.docgo.repository_service.common.exception.ValidationError;
import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * GlobalExceptionHandler - Centralized exception handling
 * 
 * Handles all exceptions thrown by controllers and services
 * Returns standardized RestResponse format
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle validation errors from @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RestResponse<ValidationError>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        List<String> errors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(error.getField() + ": " + error.getDefaultMessage());
        }

        ValidationError validationError = ValidationError.builder()
            .errors(errors)
            .build();

        RestResponse<ValidationError> response = RestResponse.<ValidationError>builder()
            .apiVersion("v1")
            .statusCode(400)
            .shortMessage("Bad Request")
            .description("Dữ liệu đầu vào không hợp lệ")
            .data(validationError)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path(getCurrentPath())
            .build();

        log.warn("Validation error: {}", errors);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle file not found exceptions
     */
    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<RestResponse<Void>> handleFileNotFoundException(
            FileNotFoundException ex) {
        
        RestResponse<Void> response = RestResponse.<Void>builder()
            .apiVersion("v1")
            .statusCode(404)
            .shortMessage("Not Found")
            .description(ex.getMessage())
            .data(null)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path(getCurrentPath())
            .build();

        log.warn("File not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle resource not found exceptions
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<RestResponse<Void>> handleResourceNotFoundException(
            ResourceNotFoundException ex) {
        
        RestResponse<Void> response = RestResponse.<Void>builder()
            .apiVersion("v1")
            .statusCode(404)
            .shortMessage("Not Found")
            .description(ex.getMessage())
            .data(null)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path(getCurrentPath())
            .build();

        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<RestResponse<Void>> handleIllegalArgumentException(
            IllegalArgumentException ex) {
        
        RestResponse<Void> response = RestResponse.<Void>builder()
            .apiVersion("v1")
            .statusCode(400)
            .shortMessage("Bad Request")
            .description(ex.getMessage())
            .data(null)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path(getCurrentPath())
            .build();

        log.warn("Illegal argument: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle generic exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RestResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        
        RestResponse<Void> response = RestResponse.<Void>builder()
            .apiVersion("v1")
            .statusCode(500)
            .shortMessage("Internal Server Error")
            .description("Đã xảy ra lỗi không lường trước")
            .data(null)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path(getCurrentPath())
            .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Get current request path from HttpServletRequest
     */
    private String getCurrentPath() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getRequestURI();
            }
        } catch (Exception e) {
            log.debug("Could not get request path", e);
        }
        return "/api/v1/repository-management-service";
    }
}
