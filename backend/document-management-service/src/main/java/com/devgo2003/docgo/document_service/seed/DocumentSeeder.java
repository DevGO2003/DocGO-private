package com.devgo2003.docgo.document_service.seed;

import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import com.devgo2003.docgo.document_service.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DocumentSeeder {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    public DocumentSeeder() {
        System.out.println("🌱 DocumentSeeder: Constructor called - Component initialized!");
    }
    
    @PostConstruct
    public void seedDocuments() {
        try {
            System.out.println("🌱 DocumentSeeder: Starting seed process...");
            long count = documentRepository.count();
            System.out.println("🌱 DocumentSeeder: Current document count: " + count);
            
            if (count > 0) {
                System.out.println("🌱 DocumentSeeder: Documents already exist, skipping seed");
                return; // Already seeded
            }
            
            List<DocumentEntity> documents = Arrays.asList(
                createDocument("DOC-2024-001", "Báo cáo tài chính Q1 2024", "Financial Report", "PDF"),
                createDocument("DOC-2024-002", "Hướng dẫn sử dụng hệ thống", "User Guide", "DOCX"),
                createDocument("DOC-2024-003", "Kế hoạch kinh doanh 2024", "Business Plan", "PDF"),
                createDocument("DOC-2024-004", "Báo cáo dự án IT", "Project Report", "PDF"),
                createDocument("DOC-2024-005", "Tài liệu đào tạo nhân viên", "Training Material", "PPT")
            );
            
            documentRepository.saveAll(documents);
            System.out.println("🌱 DocumentSeeder: Successfully seeded " + documents.size() + " documents");
            
            // Verify seeding
            long newCount = documentRepository.count();
            System.out.println("🌱 DocumentSeeder: After seeding, document count: " + newCount);
        } catch (Exception e) {
            System.err.println("🌱 DocumentSeeder: Error during seeding: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private DocumentEntity createDocument(String id, String title, String category, String fileType) {
        DocumentEntity doc = new DocumentEntity();
        doc.setId(id);
        doc.setTitle(title);
        doc.setDescription("Mô tả cho " + title);
        doc.setStatus("ACTIVE");
        doc.setCategory(category);
        doc.setFileType(fileType);
        doc.setFileSize(1024L * 1024); // 1MB
        doc.setTags(Arrays.asList("important", "2024"));
        doc.setCreatedAt(LocalDateTime.now());
        doc.setUpdatedAt(LocalDateTime.now());
        return doc;
    }
}
