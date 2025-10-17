package com.devgo2003.docgo.backend.user_service.common.exception;

public class InvalidOrganizationOperationException extends RuntimeException {
    public InvalidOrganizationOperationException(String message) {
        super(message);
    }

    public InvalidOrganizationOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}


