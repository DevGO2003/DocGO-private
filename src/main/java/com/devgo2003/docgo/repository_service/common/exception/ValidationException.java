package com.devgo2003.docgo.repository_service.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;
import java.util.ArrayList;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ValidationException extends RuntimeException {
    
    private final List<String> errors;
    
    public ValidationException(String message) {
        super(message);
        this.errors = new ArrayList<>();
        this.errors.add(message);
    }
    
    public ValidationException(List<String> errors) {
        super("Validation failed: " + String.join(", ", errors));
        this.errors = new ArrayList<>(errors);
    }
    
    public ValidationException(String message, List<String> errors) {
        super(message);
        this.errors = new ArrayList<>(errors);
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    public static ValidationException withError(String error) {
        return new ValidationException(error);
    }
    
    public static ValidationException withErrors(List<String> errors) {
        return new ValidationException(errors);
    }
}
