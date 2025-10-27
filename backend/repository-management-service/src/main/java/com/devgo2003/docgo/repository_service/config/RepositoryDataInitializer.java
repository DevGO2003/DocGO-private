package com.devgo2003.docgo.repository_service.config;

import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.repository.RepositoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class RepositoryDataInitializer {

    private final RepositoryRepository repositoryRepository;

    @Bean
    @Order(2)
    public CommandLineRunner initializeRepositoryData() {
        return args -> {
            log.info("🚀 Initializing repository sample data...");
            
            try {
                // Check if data already exists
                long existingCount = repositoryRepository.count();
                if (existingCount > 0) {
                    log.info("✅ Repository data already exists ({} repositories). Skipping initialization.", existingCount);
                    return;
                }

                // Create sample repositories
                List<RepositoryEntity> repositories = createSampleRepositories();
                
                // Save to database
                List<RepositoryEntity> savedRepositories = repositoryRepository.saveAll(repositories);
                
                log.info("✅ Successfully created {} sample repositories:", savedRepositories.size());
                savedRepositories.forEach(repo -> 
                    log.info("   - {} ({})", repo.getName(), repo.getType())
                );

            } catch (Exception e) {
                log.error("❌ Failed to initialize repository data", e);
            }
        };
    }

    private List<RepositoryEntity> createSampleRepositories() {
        List<RepositoryEntity> repositories = new ArrayList<>();
        
        // Personal repositories
        repositories.add(createPersonalRepository(
            "Documents Cá nhân",
            "Kho lưu trữ tài liệu cá nhân của tôi",
            "user-001",
            "Nguyễn Văn A"
        ));
        
        repositories.add(createPersonalRepository(
            "Projects 2024",
            "Các dự án đã hoàn thành trong năm 2024",
            "user-001", 
            "Nguyễn Văn A"
        ));
        
        repositories.add(createPersonalRepository(
            "Research Papers",
            "Các bài báo nghiên cứu khoa học",
            "user-002",
            "Trần Thị B"
        ));
        
        repositories.add(createPersonalRepository(
            "Learning Materials",
            "Tài liệu học tập và phát triển bản thân",
            "user-002",
            "Trần Thị B"
        ));
        
        repositories.add(createPersonalRepository(
            "Contract Templates",
            "Mẫu hợp đồng và văn bản pháp lý",
            "user-003",
            "Lê Văn C"
        ));

        // Organization repositories
        repositories.add(createOrganizationRepository(
            "Company Documents",
            "Tài liệu chung của công ty",
            "org-001",
            "Công ty ABC",
            "user-001",
            "Nguyễn Văn A"
        ));
        
        repositories.add(createOrganizationRepository(
            "HR Policies",
            "Chính sách và quy định nhân sự",
            "org-001",
            "Công ty ABC",
            "user-004",
            "HR Manager"
        ));
        
        repositories.add(createOrganizationRepository(
            "Technical Documentation",
            "Tài liệu kỹ thuật và API documentation",
            "org-001",
            "Công ty ABC",
            "user-005",
            "Tech Lead"
        ));
        
        repositories.add(createOrganizationRepository(
            "Financial Reports",
            "Báo cáo tài liệu và báo cáo tài chính",
            "org-002",
            "Tổ chức XYZ",
            "user-006",
            "Finance Manager"
        ));
        
        repositories.add(createOrganizationRepository(
            "Marketing Materials",
            "Tài liệu marketing và bán hàng",
            "org-002", 
            "Tổ chức XYZ",
            "user-007",
            "Marketing Lead"
        ));

        return repositories;
    }

    private RepositoryEntity createPersonalRepository(String name, String description, String ownerUserId, String ownerName) {
        RepositoryEntity repository = new RepositoryEntity();
        repository.setId(UUID.randomUUID().toString());
        repository.setName(name);
        repository.setDescription(description);
        repository.setType(RepositoryEntity.RepositoryType.PERSONAL);
        repository.setOwnerUserId(ownerUserId);
        repository.setIsPublic(false); // Personal repositories are private by default
        repository.setIsDeleted(false);
        repository.setCreatedAt(LocalDateTime.now().minusDays((long) (Math.random() * 30)));
        repository.setUpdatedAt(LocalDateTime.now().minusDays((long) (Math.random() * 7)));
        repository.setCreatedBy("system");
        repository.setUpdatedBy("system");
        
        // Store additional info in metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("ownerName", ownerName);
        metadata.put("memberCount", 1);
        metadata.put("fileCount", (int) (Math.random() * 50)); // Random file count
        metadata.put("totalSize", (long) (Math.random() * 1000000000)); // Random size up to 1GB
        
        // Add some tags
        List<String> tags = new ArrayList<>();
        if (name.toLowerCase().contains("document")) tags.add("documents");
        if (name.toLowerCase().contains("project")) tags.add("projects");
        if (name.toLowerCase().contains("research")) tags.add("research");
        if (name.toLowerCase().contains("learning")) tags.add("learning");
        if (name.toLowerCase().contains("contract")) tags.add("legal");
        if (name.toLowerCase().contains("template")) tags.add("templates");
        metadata.put("tags", tags);
        
        repository.setMetadata(metadata);
        
        return repository;
    }

    private RepositoryEntity createOrganizationRepository(String name, String description, String organizationId, 
                                                         String organizationName, String ownerUserId, String ownerName) {
        RepositoryEntity repository = new RepositoryEntity();
        repository.setId(UUID.randomUUID().toString());
        repository.setName(name);
        repository.setDescription(description);
        repository.setType(RepositoryEntity.RepositoryType.ORGANIZATION);
        repository.setOwnerUserId(ownerUserId);
        repository.setOrganizationId(organizationId);
        repository.setIsPublic(true); // Organization repositories are public by default
        repository.setIsDeleted(false);
        repository.setCreatedAt(LocalDateTime.now().minusDays((long) (Math.random() * 60)));
        repository.setUpdatedAt(LocalDateTime.now().minusDays((long) (Math.random() * 14)));
        repository.setCreatedBy("system");
        repository.setUpdatedBy("system");
        
        // Store additional info in metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("ownerName", ownerName);
        metadata.put("organizationName", organizationName);
        metadata.put("memberCount", (int) (Math.random() * 20) + 2); // Random member count (at least owner + 1)
        metadata.put("fileCount", (int) (Math.random() * 100)); // Random file count
        metadata.put("totalSize", (long) (Math.random() * 5000000000L)); // Random size up to 5GB
        
        // Add some tags
        List<String> tags = new ArrayList<>();
        if (name.toLowerCase().contains("company")) tags.add("company");
        if (name.toLowerCase().contains("hr")) tags.add("hr");
        if (name.toLowerCase().contains("policy")) tags.add("policies");
        if (name.toLowerCase().contains("technical")) tags.add("technical");
        if (name.toLowerCase().contains("api")) tags.add("api");
        if (name.toLowerCase().contains("financial")) tags.add("finance");
        if (name.toLowerCase().contains("report")) tags.add("reports");
        if (name.toLowerCase().contains("marketing")) tags.add("marketing");
        if (name.toLowerCase().contains("sales")) tags.add("sales");
        metadata.put("tags", tags);
        
        repository.setMetadata(metadata);
        
        return repository;
    }
}
