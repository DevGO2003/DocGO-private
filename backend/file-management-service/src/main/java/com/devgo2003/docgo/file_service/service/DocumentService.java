package com.devgo2003.docgo.document_service.service;

import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import com.devgo2003.docgo.document_service.repository.DocumentRepository;
import com.devgo2003.docgo.document_service.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DocumentService {
    
    private final DocumentRepository documentRepository;
    
    @Autowired
    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }
    
    public DocumentEntity getDocumentById(String id) {
        return documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
    }
    
    public Optional<DocumentEntity> findDocumentById(String id) {
        return documentRepository.findById(id);
    }
}

