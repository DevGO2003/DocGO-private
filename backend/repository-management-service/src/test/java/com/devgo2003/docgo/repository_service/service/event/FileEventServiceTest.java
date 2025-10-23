package com.devgo2003.docgo.repository_service.service.event;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.entity.ProcessedEventEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.repository.ProcessedEventRepository;
import com.devgo2003.docgo.repository_service.service.event.impl.FileEventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * FileEventService Test - Event Architecture v3
 * 
 * Test Cases:
 * 1. Process FILE_UPLOAD_COMPLETED - Create skeleton
 * 2. Process FILE_CONTENT_EXTRACTED - Merge content
 * 3. Process CONTRACT_SUMMARY_GENERATED - Merge contract
 * 4. Idempotency check
 */
@DisplayName("FileEventService - Event Architecture v3")
public class FileEventServiceTest {

    @Mock
    private FileRepository fileRepository;

    @Mock
    private ProcessedEventRepository processedEventRepository;

    private IFileEventService fileEventService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        fileEventService = new FileEventServiceImpl(fileRepository, processedEventRepository);
    }

    @Test
    @DisplayName("✅ Event 1: Create FileEntity skeleton")
    void testProcessFileUploadCompleted() {
        // Arrange
        String documentId = "018c4e88-89a1-7000-8000-fedcba987654";
        String eventId = "event-001";
        String correlationId = "test-correlation-001";
        String actor = "user:12345";

        Map<String, Object> eventData = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("documentId", documentId);
        data.put("fileName", "hop-dong-day-du.txt");
        data.put("ownerUserId", "user-12345");
        data.put("storage", new HashMap<>());
        data.put("metadata", new HashMap<>());
        eventData.put("data", data);

        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> {
            FileEntity entity = invocation.getArgument(0);
            entity.setId(documentId);
            return entity;
        });

        // Act
        FileEntity result = fileEventService.processFileUploadCompleted(
            documentId, eventData, correlationId, actor
        );

        // Assert
        assertNotNull(result);
        assertEquals(documentId, result.getId());
        
        Map<String, Object> overview = result.getOverview();
        assertEquals("UPLOADED", overview.get("status"));
        assertEquals("VN", overview.get("region"));
        assertEquals("LOW", overview.get("priority"));
        
        Map<String, Object> audit = result.getAudit();
        // Actor format: "user:12345" → stored as "user:12345"
        assertEquals("user:12345", audit.get("createdBy"));
        assertEquals(false, audit.get("isDeleted"));
        
        System.out.println("✅ Event 1 Test Passed: FileEntity skeleton created");
    }

    @Test
    @DisplayName("✅ Event 2: Merge content and update status")
    void testProcessFileContentExtracted() {
        // Arrange
        String documentId = "018c4e88-89a1-7000-8000-fedcba987654";
        String eventId = "event-002";
        String correlationId = "test-correlation-001";

        // Create existing entity
        FileEntity existingEntity = new FileEntity();
        existingEntity.setId(documentId);
        Map<String, Object> overview = new HashMap<>();
        overview.put("status", "UPLOADED");
        existingEntity.setOverview(overview);

        Map<String, Object> eventData = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("documentId", documentId);
        
        Map<String, Object> content = new HashMap<>();
        Map<String, Object> classification = new HashMap<>();
        classification.put("isContract", true);
        classification.put("documentType", "CONTRACT");
        classification.put("language", "vi");
        content.put("classification", classification);
        data.put("content", content);
        
        eventData.put("data", data);

        when(fileRepository.findById(documentId)).thenReturn(Optional.of(existingEntity));
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        FileEntity result = fileEventService.processFileContentExtracted(
            documentId, eventData, correlationId, "system"
        );

        // Assert
        assertNotNull(result);
        assertEquals("PROCESSED", result.getOverview().get("status"));
        assertEquals("CONTRACT", result.getOverview().get("documentType"));
        assertEquals("vi", result.getOverview().get("language"));
        
        System.out.println("✅ Event 2 Test Passed: Content merged and status updated");
    }

    @Test
    @DisplayName("✅ Event 3: Merge contract (conditional)")
    void testProcessContractSummaryGenerated() {
        // Arrange
        String documentId = "018c4e88-89a1-7000-8000-fedcba987654";
        String eventId = "event-003";
        String correlationId = "test-correlation-001";

        // Create existing entity
        FileEntity existingEntity = new FileEntity();
        existingEntity.setId(documentId);
        Map<String, Object> overview = new HashMap<>();
        overview.put("status", "PROCESSED");
        existingEntity.setOverview(overview);

        Map<String, Object> eventData = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("documentId", documentId);
        
        Map<String, Object> contract = new HashMap<>();
        contract.put("type", "SOFTWARE_DEVELOPMENT");
        contract.put("totalValue", 100000);
        data.put("contract", contract);
        
        eventData.put("data", data);

        when(fileRepository.findById(documentId)).thenReturn(Optional.of(existingEntity));
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        FileEntity result = fileEventService.processContractSummaryGenerated(
            documentId, eventData, correlationId, "system"
        );

        // Assert
        assertNotNull(result);
        assertEquals("CONTRACT", result.getOverview().get("documentType"));
        assertNotNull(result.getContract());
        assertEquals("SOFTWARE_DEVELOPMENT", result.getContract().get("type"));
        
        System.out.println("✅ Event 3 Test Passed: Contract merged successfully");
    }

    @Test
    @DisplayName("✅ Idempotency: Prevent duplicate processing")
    void testIdempotencyCheck() {
        // Arrange
        String eventId = "event-001";
        String eventType = "FILE_UPLOAD_COMPLETED";
        String documentId = "018c4e88-89a1-7000-8000-fedcba987654";

        when(processedEventRepository.existsById(eventId)).thenReturn(false);

        // Act
        boolean isProcessed = fileEventService.isEventProcessed(eventId);

        // Assert
        assertFalse(isProcessed);

        // Mark as processed
        fileEventService.markEventAsProcessed(eventId, eventType, documentId);

        // Verify
        verify(processedEventRepository, times(1)).save(any(ProcessedEventEntity.class));
        
        System.out.println("✅ Idempotency Test Passed: Event marked as processed");
    }

    public static void main(String[] args) {
        System.out.println("\n" + "=".repeat(80));
        System.out.println("🧪 EVENT ARCHITECTURE V3 - TEST RESULTS");
        System.out.println("=".repeat(80) + "\n");

        FileEventServiceTest test = new FileEventServiceTest();
        
        try {
            test.setUp();
            test.testProcessFileUploadCompleted();
            test.testProcessFileContentExtracted();
            test.testProcessContractSummaryGenerated();
            test.testIdempotencyCheck();
            
            System.out.println("\n" + "=".repeat(80));
            System.out.println("✅ ALL TESTS PASSED!");
            System.out.println("=".repeat(80) + "\n");
            
        } catch (Exception e) {
            System.out.println("\n❌ TEST FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
