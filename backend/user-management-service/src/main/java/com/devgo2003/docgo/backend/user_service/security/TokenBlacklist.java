package com.devgo2003.docgo.backend.user_service.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Slf4j
@Service
public class TokenBlacklist {
    
    private final ConcurrentMap<String, Long> blacklistedTokens = new ConcurrentHashMap<>();
    private final JwtUtil jwtUtil;
    
    public TokenBlacklist(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    /**
     * Thêm token vào blacklist
     * @param token JWT token cần blacklist
     * @return true nếu thêm thành công, false nếu token không hợp lệ
     */
    public boolean addToBlacklist(String token) {
        try {
            // Validate token trước khi thêm vào blacklist
            var claims = jwtUtil.parseClaims(token);
            long expirationTime = claims.getExpiration().getTime();
            
            // Lưu token với thời gian hết hạn
            blacklistedTokens.put(token, expirationTime);
            log.info("[TokenBlacklist] Token added to blacklist, expires at: {}", 
                    Instant.ofEpochMilli(expirationTime));
            return true;
        } catch (Exception e) {
            log.warn("[TokenBlacklist] Failed to add invalid token to blacklist: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Kiểm tra token có trong blacklist không
     * @param token JWT token cần kiểm tra
     * @return true nếu token bị blacklist, false nếu token hợp lệ
     */
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        
        Long expirationTime = blacklistedTokens.get(token);
        if (expirationTime == null) {
            return false;
        }
        
        // Kiểm tra token đã hết hạn chưa
        long currentTime = System.currentTimeMillis();
        if (currentTime > expirationTime) {
            // Token đã hết hạn, xóa khỏi blacklist
            blacklistedTokens.remove(token);
            log.debug("[TokenBlacklist] Expired token removed from blacklist");
            return false;
        }
        
        log.debug("[TokenBlacklist] Token found in blacklist");
        return true;
    }
    
    /**
     * Xóa token khỏi blacklist (dùng cho testing hoặc admin)
     * @param token JWT token cần xóa
     * @return true nếu xóa thành công, false nếu token không tồn tại
     */
    public boolean removeFromBlacklist(String token) {
        Long removed = blacklistedTokens.remove(token);
        if (removed != null) {
            log.info("[TokenBlacklist] Token removed from blacklist");
            return true;
        }
        return false;
    }
    
    /**
     * Lấy số lượng token trong blacklist
     * @return số lượng token hiện tại trong blacklist
     */
    public int getBlacklistSize() {
        return blacklistedTokens.size();
    }
    
    /**
     * Xóa tất cả token đã hết hạn khỏi blacklist
     * Chạy định kỳ mỗi 5 phút để cleanup
     */
    @Scheduled(fixedRate = 300000) // 5 phút = 300,000ms
    public void cleanupExpiredTokens() {
        long currentTime = System.currentTimeMillis();
        int initialSize = blacklistedTokens.size();
        
        // Xóa tất cả token đã hết hạn
        blacklistedTokens.entrySet().removeIf(entry -> {
            boolean expired = currentTime > entry.getValue();
            if (expired) {
                log.debug("[TokenBlacklist] Cleanup: Removing expired token");
            }
            return expired;
        });
        
        int finalSize = blacklistedTokens.size();
        int removedCount = initialSize - finalSize;
        
        if (removedCount > 0) {
            log.info("[TokenBlacklist] Cleanup completed: removed {} expired tokens, {} remaining", 
                    removedCount, finalSize);
        }
    }
    
    /**
     * Xóa tất cả token khỏi blacklist (dùng cho testing)
     */
    public void clearBlacklist() {
        int size = blacklistedTokens.size();
        blacklistedTokens.clear();
        log.info("[TokenBlacklist] Blacklist cleared, removed {} tokens", size);
    }
}