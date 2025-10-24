package com.devgo2003.docgo.repository_service.common.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ValidationError - Error response for validation failures
 * 
 * Used in GlobalExceptionHandler to return structured validation errors
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationError {
    
    private List<String> errors;
    private String field;
    private String message;
    private Object rejectedValue;
    
    public ValidationError(List<String> errors) {
        this.errors = errors;
    }
}
