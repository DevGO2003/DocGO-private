package com.devgo2003.docgo.file_service.service;

import com.devgo2003.docgo.file_service.entity.FileEntity;
import com.devgo2003.docgo.file_service.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;

@Service
public class FileService {
    
    @Autowired
    private FileRepository fileRepository;
    
    public Optional<FileEntity> getFileById(String id) {
        return fileRepository.findById(id);
    }
    
    public FileEntity saveFile(FileEntity file) {
        return fileRepository.save(file);
    }
    
    public List<FileEntity> getFilesByStatus(String status) {
        return fileRepository.findByOverviewStatus(status);
    }
    
    public List<FileEntity> getFilesByDocumentType(String documentType) {
        return fileRepository.findByOverviewDocumentType(documentType);
    }
    
    public List<FileEntity> getFilesByOwner(String ownerUserId) {
        return fileRepository.findByOverviewOwnerUserId(ownerUserId);
    }
    
    public List<FileEntity> getAllFiles() {
        return fileRepository.findAll();
    }
    
    public Optional<FileEntity> findById(String id) {
        return fileRepository.findById(id);
    }
    
    public FileEntity save(FileEntity file) {
        return fileRepository.save(file);
    }
    
    public FileEntity getDocumentById(String id) {
        Optional<FileEntity> document = fileRepository.findById(id);
        return document.orElse(null);
    }
}
