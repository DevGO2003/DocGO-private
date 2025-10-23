package com.devgo2003.docgo.repository_service.config;

import com.fasterxml.uuid.Generators;
import com.fasterxml.uuid.impl.TimeBasedEpochGenerator;
import org.springframework.stereotype.Component;

/**
 * UUID v7 Generator - Time-sortable UUID
 * 
 * Benefits:
 * - Time-sortable: Embedded timestamp for natural ordering
 * - Secure: Random component prevents prediction
 * - Distributed-safe: No conflicts across multiple servers
 * - Database-friendly: Better index performance than UUID v4
 * - Cross-service compatible: Consistent ID format
 * 
 * Format: 018c4e88-89a1-7000-8000-0123456789ab
 * 
 * @see <a href="https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format">UUID v7 Spec</a>
 */
@Component
public class UUIDv7Generator {
    private static final TimeBasedEpochGenerator generator = 
        Generators.timeBasedEpochGenerator();
    
    /**
     * Generate a new UUID v7
     * @return UUID v7 string (e.g., "018c4e88-89a1-7000-8000-0123456789ab")
     */
    public static String generate() {
        return generator.generate().toString();
    }
}
