package com.devgo2003.docgo.repository_service.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class FileNotFoundException extends RuntimeException {
    
    public FileNotFoundException(String message) {
        super(message);
    }
    
    public FileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static FileNotFoundException withId(String fileId) {
        return new FileNotFoundException("File not found with ID: " + fileId);
    }
    
    public static FileNotFoundException withName(String fileName) {
        return new FileNotFoundException("File not found with name: " + fileName);
    }
}
