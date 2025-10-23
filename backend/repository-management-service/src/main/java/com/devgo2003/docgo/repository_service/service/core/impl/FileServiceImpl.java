package com.devgo2003.docgo.repository_service.service.core.impl;

import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.service.core.IFileService;
import com.devgo2003.docgo.repository_service.service.core.mapper.IFileMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * FileServiceImpl - File Service Implementation
 * 
 * Pattern: Service + Repository + Mapper
 * - Service: Business logic
 * - Repository: Data access
 * - Mapper: DTO conversion
 */
@Service
public class FileServiceImpl implements IFileService {

    private final FileRepository fileRepository;
    private final IFileMapper fileMapper;

    @Autowired
    public FileServiceImpl(FileRepository fileRepository, IFileMapper fileMapper) {
        this.fileRepository = fileRepository;
        this.fileMapper = fileMapper;
    }

    @Override
    public Page<FileEntity> getAllFiles(Pageable pageable) {
        return fileRepository.findAll(pageable);
    }

    @Override
    public Optional<FileEntity> getFileById(String id) {
        return fileRepository.findById(id);
    }

    @Override
    public Optional<FullFileResponseDto> getFileDtoById(String id) {
        return fileRepository.findById(id)
                .map(fileMapper::toFullResponseDto);
    }

    @Override
    public FileEntity createFile(FileEntity file) {
        return fileRepository.save(file);
    }

    @Override
    public FileEntity updateFile(String id, FileEntity file) {
        if (!fileRepository.existsById(id)) {
            throw new RuntimeException("File not found: " + id);
        }
        file.setId(id);
        return fileRepository.save(file);
    }

    @Override
    public void deleteFile(String id) {
        fileRepository.deleteById(id);
    }

    @Override
    public boolean existsById(String id) {
        return fileRepository.existsById(id);
    }
}
