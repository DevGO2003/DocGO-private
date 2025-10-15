package com.devgo2003.docgo.backend.user_service.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.time.Instant;

@ConditionalOnProperty(name = "auth.blacklist.provider", havingValue = "redis")
public class RedisTokenBlacklistService implements TokenBlacklist {

    private final StringRedisTemplate redisTemplate;

    public RedisTokenBlacklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean addToBlacklist(String token) {
        try {
            // Default TTL 1h nếu không có claims bên ngoài
            long ttlSeconds = 3600;
            redisTemplate.opsForValue().set(key(token), "1", Duration.ofSeconds(ttlSeconds));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean isBlacklisted(String token) {
        String val = redisTemplate.opsForValue().get(key(token));
        return val != null;
    }

    @Override
    public boolean removeFromBlacklist(String token) {
        return Boolean.TRUE.equals(redisTemplate.delete(key(token)));
    }

    @Override
    public int getBlacklistSize() {
        // Not efficient in Redis without scanning; return -1 to indicate unsupported
        return -1;
    }

    @Override
    public void clearBlacklist() {
        // No-op without pattern delete; could be implemented with SCAN
    }

    private String key(String token) {
        return "auth:blacklist:" + token;
    }
}


