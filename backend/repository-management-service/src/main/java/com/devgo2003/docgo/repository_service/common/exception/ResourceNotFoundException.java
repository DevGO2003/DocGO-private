package com.devgo2003.docgo.repository_service.common.exception;

/**
 * ResourceNotFoundException - Generic exception for resource not found scenarios
 * 
 * Used for:
 * - Repository not found
 * - User not found
 * - Any other resource that doesn't exist
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public ResourceNotFoundException(String resourceType, String resourceId) {
        super(String.format("%s not found with ID: %s", resourceType, resourceId));
    }
    
    public ResourceNotFoundException(String resourceType, String resourceId, String operation) {
        super(String.format("%s not found with ID: %s during operation: %s", resourceType, resourceId, operation));
    }
}
