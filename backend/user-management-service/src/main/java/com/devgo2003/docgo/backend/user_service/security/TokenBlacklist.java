package com.devgo2003.docgo.backend.user_service.security;

public interface TokenBlacklist {
    boolean addToBlacklist(String token);
    boolean isBlacklisted(String token);
    boolean removeFromBlacklist(String token);
    int getBlacklistSize();
    void clearBlacklist();
}