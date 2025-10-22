package com.devgo2003.docgo.backend.user_service.entity;

import lombok.*;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Entity để theo dõi các sự kiện của người dùng (audit trail)
 */
@Document(collection = "user_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEvent {

    @org.springframework.data.annotation.Id
    private String id;

    private String userId;
    private EventType eventType;
    private String eventDescription;
    private String ipAddress;
    private String userAgent;
    private String eventData;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum EventType {
        LOGIN,
        LOGOUT,
        REGISTER,
        UPDATE_PROFILE,
        CHANGE_PASSWORD,
        DELETE_ACCOUNT,
        OTHER
    }
}
