package com.devgo2003.docgo.file_service.repository;

import com.devgo2003.docgo.file_service.entity.AuditEvent;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuditEventRepository extends MongoRepository<AuditEvent, String> {
}

