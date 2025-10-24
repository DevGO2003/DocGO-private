package com.devgo2003.docgo.repository_service.common.exception;

/**
 * FileNotFoundException - Custom exception for file not found scenarios
 * 
 * Thrown when:
 * - File with specified ID doesn't exist
 * - File has been soft deleted
 * - File access is denied due to permissions
 */
public class FileNotFoundException extends RuntimeException {
    
    public FileNotFoundException(String message) {
        super(message);
    }
    
    public FileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public FileNotFoundException(String fileId, String operation) {
        super(String.format("File not found with ID: %s during operation: %s", fileId, operation));
    }
}
