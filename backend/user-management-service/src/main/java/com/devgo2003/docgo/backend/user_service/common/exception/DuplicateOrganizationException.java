package com.devgo2003.docgo.backend.user_service.common.exception;

public class DuplicateOrganizationException extends RuntimeException {
    public DuplicateOrganizationException(String message) {
        super(message);
    }

    public DuplicateOrganizationException(String message, Throwable cause) {
        super(message, cause);
    }
}



