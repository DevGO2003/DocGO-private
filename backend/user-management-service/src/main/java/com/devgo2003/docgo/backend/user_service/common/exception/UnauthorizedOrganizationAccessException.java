package com.devgo2003.docgo.backend.user_service.common.exception;

public class UnauthorizedOrganizationAccessException extends RuntimeException {
    public UnauthorizedOrganizationAccessException(String message) {
        super(message);
    }

    public UnauthorizedOrganizationAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}


