package com.devgo2003.docgo.file_service.script;

import com.devgo2003.docgo.file_service.entity.DocumentEntity;
import com.devgo2003.docgo.file_service.entity.CommentEntity;
import com.devgo2003.docgo.file_service.repository.DocumentRepository;
import com.devgo2003.docgo.file_service.repository.CommentRepository;
import com.devgo2003.docgo.file_service.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class SampleDataSeeder implements CommandLineRunner {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Force recreate sample data with new ID
        String documentId = "DOC-2024-004-NEW";
        documentRepository.deleteById("DOC-2024-004");
        documentRepository.deleteById(documentId);
        commentRepository.deleteByDocumentId("DOC-2024-004");
        commentRepository.deleteByDocumentId(documentId);
        System.out.println("Cleared existing sample data, creating new with ID: " + documentId);
        
        // Always create sample data
        if (true) {
            // Create sample document
            DocumentEntity document = createSampleDocument(documentId);
            documentRepository.save(document);
            
            // Create sample comments
            createSampleComments(documentId);
            
            System.out.println("Sample data created successfully with ID: " + documentId);
        }
    }
    
    private DocumentEntity createSampleDocument(String documentId) {
        DocumentEntity document = new DocumentEntity();
        document.setId(documentId);
        document.setTitle("Hợp đồng phát triển phần mềm quản lý tài liệu");
        document.setDescription("Hợp đồng phát triển hệ thống quản lý tài liệu cho công ty ABC với các tính năng quản lý, phân tích và báo cáo.");
        document.setStatus("ACTIVE");
        document.setFileId("file-123");
        document.setFileName("hop_dong_it_abc.pdf");
        document.setFileType("application/pdf");
        document.setFileSize(1024000L);
        document.setFileUrl("https://storage.example.com/files/hop_dong_it_abc.pdf");
        document.setUserId("user-001");
        document.setTags(Arrays.asList("IT", "Phần mềm", "Hợp đồng", "Phát triển"));
        document.setCategory("Hợp đồng dịch vụ");
        document.setDocumentType("CONTRACT");
        
        // Contract info
        document.setContractType("SERVICE_AGREEMENT");
        // keep legacy fields inside contractMetadata where applicable if supported; otherwise skip
        document.setRiskLevel("MEDIUM");
        
        // Parties
        List<Party> parties = Arrays.asList(
            Party.builder()
                .name("Công ty TNHH ABC")
                .role("Khách hàng")
                .representative("Nguyễn Văn A")
                .taxCode("0123456789")
                .contact("0123456789")
                .address("123 Đường ABC, Quận 1, TP.HCM")
                .build(),
            Party.builder()
                .name("Công ty TNHH XYZ")
                .role("Nhà cung cấp")
                .representative("Trần Thị B")
                .taxCode("9876543210")
                .contact("0987654321")
                .address("456 Đường XYZ, Quận 2, TP.HCM")
                .build()
        );
        document.setParties(parties);
        
        // Payment Details
        PaymentDetails paymentDetails = PaymentDetails.builder()
            .totalValue(50000000.0)
            .currency("VND")
            .schedule("Thanh toán 50% khi ký hợp đồng, 50% khi nghiệm thu")
            .paymentMethod("Chuyển khoản")
            .build();
        document.setPaymentDetails(paymentDetails);
        
        // Key Clauses
        List<KeyClause> keyClauses = Arrays.asList(
            KeyClause.builder()
                .name("Phạm vi công việc")
                .description("Phát triển hệ thống quản lý tài liệu")
                .importance("High")
                .risk("LOW")
                .build(),
            KeyClause.builder()
                .name("Thời gian thực hiện")
                .description("6 tháng kể từ ngày ký")
                .importance("High")
                .risk("MEDIUM")
                .build(),
            KeyClause.builder()
                .name("Bảo hành")
                .description("12 tháng sau nghiệm thu")
                .importance("Medium")
                .risk("LOW")
                .build()
        );
        document.setKeyClauses(keyClauses);
        
        // Unfavorable Clauses
        document.setUnfavorableClauses(Arrays.asList(
            "Điều khoản thanh toán trước 50%",
            "Thời gian bảo hành ngắn"
        ));
        
        // Reminders
        List<Reminder> reminders = Arrays.asList(
            Reminder.builder()
                .date(LocalDateTime.of(2024, 6, 15, 0, 0))
                .title("Nhắc nhở nghiệm thu")
                .description("Cần chuẩn bị nghiệm thu dự án")
                .build(),
            Reminder.builder()
                .date(LocalDateTime.of(2024, 7, 1, 0, 0))
                .title("Nhắc nhở thanh toán")
                .description("Thanh toán 50% còn lại")
                .build()
        );
        document.setReminders(reminders);
        
        // Risk Assessment
        RiskAssessment riskAssessment = RiskAssessment.builder()
            .riskLevel("MEDIUM")
            .riskFactors(Arrays.asList(
                "Thời gian thực hiện ngắn",
                "Yêu cầu kỹ thuật phức tạp"
            ))
            .mitigationMeasures(Arrays.asList(
                "Tăng cường nhân lực",
                "Làm việc overtime"
            ))
            .build();
        document.setRiskAssessment(riskAssessment);
        
        // Compliance Status
        ComplianceStatus complianceStatus = ComplianceStatus.builder()
            .status("COMPLIANT")
            .issues(Arrays.asList())
            .recommendations(Arrays.asList(
                "Theo dõi tiến độ định kỳ",
                "Báo cáo hàng tháng"
            ))
            .build();
        document.setComplianceStatus(complianceStatus);
        
        // Author Notes
        List<AuthorNote> authorNotes = Arrays.asList(
            AuthorNote.builder()
                .content("Cần theo dõi chặt chẽ tiến độ của Bên B để đảm bảo hoàn thành đúng hạn.")
                .time(LocalDateTime.now().minusDays(2))
                .user("Admin")
                .build(),
            AuthorNote.builder()
                .content("Đã gửi yêu cầu chỉnh sửa điều khoản bảo hành từ 12 tháng lên 18 tháng.")
                .time(LocalDateTime.now().minusDays(1))
                .user("Legal Team")
                .build()
        );
        document.setAuthorNotes(authorNotes);
        
        // Content
        document.setContent("HỢP ĐỒNG PHÁT TRIỂN PHẦN MỀM\n\n" +
            "Điều 1: Phạm vi công việc\n" +
            "Bên B cam kết phát triển hệ thống quản lý tài liệu với các tính năng:\n" +
            "- Quản lý tài liệu\n" +
            "- Phân tích và báo cáo\n" +
            "- Tìm kiếm thông minh\n\n" +
            "Điều 2: Thời gian thực hiện\n" +
            "Thời gian thực hiện: 6 tháng kể từ ngày ký hợp đồng.\n\n" +
            "Điều 3: Thanh toán\n" +
            "Tổng giá trị: 50,000,000 VND\n" +
            "Thanh toán 50% khi ký hợp đồng, 50% khi nghiệm thu.");
        
        // File System Metadata
        FileSystemMetadata fileSystemMetadata = FileSystemMetadata.builder()
            .dateModified(LocalDateTime.now())
            .dateAdded(LocalDateTime.now().minusDays(5))
            .mediaFilename("hop_dong_it_abc.pdf")
            .originalFilename("hop_dong_it_abc.docx")
            .originalMD5("abc123def456")
            .originalFileSize(2048000L)
            .originalMimeType("application/pdf")
            .archiveMD5("def456ghi789")
            .archiveFileSize(1024000L)
            .build();
        document.setFileSystemMetadata(fileSystemMetadata);
        
        // Original Document Metadata
        OriginalDocumentMetadata originalDocumentMetadata = OriginalDocumentMetadata.builder()
            .dcFormat("application/pdf")
            .dcTitle("Hợp đồng phát triển phần mềm quản lý tài liệu")
            .dcCreator("System")
            .dcDescription("Hợp đồng phát triển hệ thống quản lý tài liệu")
            .dcSubject("IT, Phần mềm, Hợp đồng, Phát triển")
            .xmpCreateDate(LocalDateTime.now().minusDays(5))
            .xmpCreatorTool("DocGO System")
            .xmpModifyDate(LocalDateTime.now())
            .xmpMetadataDate(LocalDateTime.now())
            .pdfKeywords("IT, Phần mềm, Hợp đồng, Phát triển")
            .pdfProducer("DocGO System")
            .xmpDocumentID("uuid:DOC-2024-004")
            .xmpInstanceID("uuid:DOC-2024-004")
            .pdfaExtensionSchemas(Arrays.asList("PDF/A-1b"))
            .build();
        document.setOriginalDocumentMetadata(originalDocumentMetadata);
        
        // Archived Document Metadata
        ArchivedDocumentMetadata archivedDocumentMetadata = ArchivedDocumentMetadata.builder()
            .archivedPdfProducer("DocGO Archiver")
            .archivedMetadataDate(LocalDateTime.now())
            .archivedModifyDate(LocalDateTime.now())
            .archivedCreateDate(LocalDateTime.now().minusDays(5))
            .archivedCreatorTool("DocGO System")
            .archivedDocumentID("uuid:archived-DOC-2024-004")
            .archivedDcFormat("application/pdf")
            .archivedDcTitle("Hợp đồng phát triển phần mềm quản lý tài liệu (Archived)")
            .archivedDcCreator("DocGO System")
            .build();
        document.setArchivedDocumentMetadata(archivedDocumentMetadata);
        
        // Timestamps
        document.setCreatedAt(LocalDateTime.now().minusDays(5));
        document.setUpdatedAt(LocalDateTime.now());
        
        return document;
    }
    
    private void createSampleComments(String documentId) {
        List<CommentEntity> comments = Arrays.asList(
            createComment(documentId, "user-001", "Admin", "Vui lòng kiểm tra điều khoản thanh toán."),
            createComment(documentId, "user-002", "Legal", "Đã rà soát, đề xuất chỉnh sửa mục 7."),
            createComment(documentId, "user-003", "Finance", "Ngân sách đã được phê duyệt. Có thể tiến hành ký hợp đồng."),
            createComment(documentId, "user-004", "Manager", "Cần thêm điều khoản về bảo mật thông tin khách hàng.")
        );
        
        commentRepository.saveAll(comments);
    }
    
    private CommentEntity createComment(String documentId, String userId, String userName, String content) {
        CommentEntity comment = new CommentEntity();
        comment.setDocumentId(documentId);
        comment.setUserId(userId);
        comment.setUserName(userName);
        comment.setContent(content);
        comment.setIsEdited(false);
        comment.setLikesCount(0);
        comment.setRepliesCount(0);
        comment.setCreatedAt(LocalDateTime.now().minusHours(2));
        comment.setUpdatedAt(LocalDateTime.now().minusHours(2));
        return comment;
    }
}
