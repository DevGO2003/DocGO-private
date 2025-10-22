package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReminderDto {
    private String id;
    
    /**
     * Reminder type
     * Enum: PAYMENT_DUE, MILESTONE_REVIEW, EXPIRY_WARNING, CONTRACT_RENEWAL
     */
    private String type;
    
    private String title;
    private String description;
    private String content;
    private LocalDateTime dueDate;
    private Integer notifyBefore;
    
    /**
     * Reminder status
     * Enum: PENDING, SENT, RESOLVED, OVERDUE
     */
    private String status;
    
    /**
     * Reminder priority
     * Enum: HIGH, MEDIUM, LOW
     */
    private String priority;
    
    private String assignedTo;
}
