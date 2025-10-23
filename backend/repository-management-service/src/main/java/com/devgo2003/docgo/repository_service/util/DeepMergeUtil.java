package com.devgo2003.docgo.repository_service.util;

import java.util.Map;
import java.util.HashMap;

/**
 * DeepMergeUtil - Recursive Map Merging Utility
 * 
 * Provides deep merge functionality for nested maps
 * Used for event processing in Event Architecture v3
 */
public class DeepMergeUtil {

    /**
     * Deep merge source map into target map
     * Recursively merges nested maps
     * 
     * @param target Target map to merge into (modified in-place)
     * @param source Source map to merge from (not modified)
     */
    public static void deepMerge(Map<String, Object> target, Map<String, Object> source) {
        if (source == null || target == null) {
            return;
        }
        
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            String key = entry.getKey();
            Object sourceValue = entry.getValue();
            Object targetValue = target.get(key);
            
            if (sourceValue instanceof Map && targetValue instanceof Map) {
                // Recursive merge for nested maps
                @SuppressWarnings("unchecked")
                Map<String, Object> sourceMap = (Map<String, Object>) sourceValue;
                @SuppressWarnings("unchecked")
                Map<String, Object> targetMap = (Map<String, Object>) targetValue;
                deepMerge(targetMap, sourceMap);
            } else {
                // Simple overwrite for non-map values
                target.put(key, sourceValue);
            }
        }
    }
    
    /**
     * Create a deep copy of a map (non-recursive values are shallow copied)
     * 
     * @param source Source map to copy
     * @return New map with copied structure
     */
    public static Map<String, Object> deepCopy(Map<String, Object> source) {
        if (source == null) {
            return null;
        }
        
        Map<String, Object> copy = new HashMap<>();
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            if (value instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> mapValue = (Map<String, Object>) value;
                copy.put(key, deepCopy(mapValue));
            } else {
                copy.put(key, value);
            }
        }
        
        return copy;
    }
}
