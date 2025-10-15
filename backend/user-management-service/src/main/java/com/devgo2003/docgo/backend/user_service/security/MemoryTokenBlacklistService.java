package com.devgo2003.docgo.backend.user_service.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

public class MemoryTokenBlacklistService implements TokenBlacklist {

    private final ConcurrentHashMap<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

    @Override
    public boolean addToBlacklist(String token) {
        try {
            // Default to 1 hour TTL if not provided externally
            Instant expiry = Instant.now().plusSeconds(3600);
            blacklistedTokens.put(token, expiry);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean isBlacklisted(String token) {
        Instant expiry = blacklistedTokens.get(token);
        if (expiry == null) {
            return false;
        }
        if (expiry.isBefore(Instant.now())) {
            blacklistedTokens.remove(token);
            return false;
        }
        return true;
    }

    @Override
    public boolean removeFromBlacklist(String token) {
        return blacklistedTokens.remove(token) != null;
    }

    @Override
    public int getBlacklistSize() {
        return blacklistedTokens.size();
    }

    @Override
    public void clearBlacklist() {
        blacklistedTokens.clear();
    }
}

