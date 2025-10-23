package com.devgo2003.docgo.repository_service.service.event.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * EventProcessingUtil - Event Processing Utilities
 * 
 * Utilities for:
 * - Idempotency key generation
 * - Event validation
 * - Error handling
 * - Audit trail creation
 */
public class EventProcessingUtil {
    
    private static final Logger log = LoggerFactory.getLogger(EventProcessingUtil.class);
    
    /**
     * Validate required fields in event data
     * 
     * @param eventData Event payload
     * @param requiredFields Required field names
     * @return true if all required fields present
     */
    public static boolean validateRequiredFields(Map<String, Object> eventData, String... requiredFields) {
        if (eventData == null) {
            log.warn("Event data is null");
            return false;
        }
        
        for (String field : requiredFields) {
            if (!eventData.containsKey(field) || eventData.get(field) == null) {
                log.warn("Missing required field: {}", field);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Create audit trail entry
     * 
     * @param actor Actor performing action
     * @param action Action performed
     * @param details Additional details
     * @return Audit entry map
     */
    public static Map<String, Object> createAuditEntry(String actor, String action, String details) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("actor", actor);
        entry.put("action", action);
        entry.put("details", details);
        entry.put("timestamp", Instant.now().toString());
        return entry;
    }
    
    /**
     * Create error response
     * 
     * @param errorCode Error code
     * @param errorMessage Error message
     * @param exception Exception (optional)
     * @return Error map
     */
    public static Map<String, Object> createErrorResponse(String errorCode, String errorMessage, Exception exception) {
        Map<String, Object> error = new HashMap<>();
        error.put("code", errorCode);
        error.put("message", errorMessage);
        error.put("timestamp", Instant.now().toString());
        
        if (exception != null) {
            error.put("exception", exception.getClass().getSimpleName());
            error.put("details", exception.getMessage());
        }
        
        return error;
    }
    
    /**
     * Validate event structure
     * 
     * @param eventData Event payload
     * @return true if valid
     */
    public static boolean validateEventStructure(Map<String, Object> eventData) {
        if (eventData == null) {
            log.warn("Event data is null");
            return false;
        }
        
        // Check required event fields
        String[] requiredFields = {"eventType", "eventId", "timestamp", "correlationId", "actor", "data"};
        return validateRequiredFields(eventData, requiredFields);
    }
    
    /**
     * Extract data section from event
     * 
     * @param eventData Event payload
     * @return Data section or empty map
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> extractEventData(Map<String, Object> eventData) {
        if (eventData == null || !eventData.containsKey("data")) {
            return new HashMap<>();
        }
        
        Object data = eventData.get("data");
        if (data instanceof Map) {
            return (Map<String, Object>) data;
        }
        
        return new HashMap<>();
    }
    
    /**
     * Get string value safely from map
     * 
     * @param map Source map
     * @param key Key to retrieve
     * @param defaultValue Default value if not found
     * @return String value or default
     */
    public static String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        if (map == null || !map.containsKey(key)) {
            return defaultValue;
        }
        
        Object value = map.get(key);
        return value != null ? value.toString() : defaultValue;
    }
    
    /**
     * Get long value safely from map
     * 
     * @param map Source map
     * @param key Key to retrieve
     * @param defaultValue Default value if not found
     * @return Long value or default
     */
    public static Long getLongValue(Map<String, Object> map, String key, Long defaultValue) {
        if (map == null || !map.containsKey(key)) {
            return defaultValue;
        }
        
        Object value = map.get(key);
        if (value instanceof Long) {
            return (Long) value;
        } else if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                log.warn("Cannot parse long value: {}", value);
                return defaultValue;
            }
        }
        
        return defaultValue;
    }
}
