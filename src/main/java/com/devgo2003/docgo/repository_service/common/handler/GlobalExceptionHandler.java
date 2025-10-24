package com.devgo2003.docgo.repository_service.common.handler;

import com.devgo2003.docgo.repository_service.common.exception.FileNotFoundException;
import com.devgo2003.docgo.repository_service.common.exception.ResourceNotFoundException;
import com.devgo2003.docgo.repository_service.common.exception.ValidationException;
import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<RestResponse<Void>> handleFileNotFoundException(
            FileNotFoundException ex, WebRequest request) {
        
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.NOT_FOUND.value())
                .shortMessage("NOT_FOUND")
                .description(ex.getMessage())
                .data(null)
                .timestamp(LocalDateTime.now().toString())
                .requestId(UUID.randomUUID().toString())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<RestResponse<Void>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.NOT_FOUND.value())
                .shortMessage("NOT_FOUND")
                .description(ex.getMessage())
                .data(null)
                .timestamp(LocalDateTime.now().toString())
                .requestId(UUID.randomUUID().toString())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<RestResponse<List<String>>> handleValidationException(
            ValidationException ex, WebRequest request) {
        
        RestResponse<List<String>> response = RestResponse.<List<String>>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .shortMessage("VALIDATION_ERROR")
                .description("Validation failed")
                .data(ex.getErrors())
                .timestamp(LocalDateTime.now().toString())
                .requestId(UUID.randomUUID().toString())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RestResponse<List<String>>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.add(error.getField() + ": " + error.getDefaultMessage()));
        
        RestResponse<List<String>> response = RestResponse.<List<String>>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .shortMessage("VALIDATION_ERROR")
                .description("Validation failed")
                .data(errors)
                .timestamp(LocalDateTime.now().toString())
                .requestId(UUID.randomUUID().toString())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RestResponse<Void>> handleGenericException(
            Exception ex, WebRequest request) {
        
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .shortMessage("INTERNAL_ERROR")
                .description("An unexpected error occurred")
                .data(null)
                .timestamp(LocalDateTime.now().toString())
                .requestId(UUID.randomUUID().toString())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
