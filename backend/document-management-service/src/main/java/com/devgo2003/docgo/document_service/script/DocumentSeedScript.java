package com.devgo2003.docgo.document_service.script;

import com.devgo2003.docgo.document_service.entity.Contract;
import com.devgo2003.docgo.document_service.enums.ContractCategory;
import com.devgo2003.docgo.document_service.enums.ContractStatus;
import com.devgo2003.docgo.document_service.enums.ContractType;
import com.devgo2003.docgo.document_service.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Script để seed dữ liệu mẫu cho MongoDB
 * Tạo 5-10 documents với đa dạng thông tin để test frontend
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentSeedScript implements CommandLineRunner {

    private final ContractRepository contractRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting document seed script...");
        
        // Kiểm tra xem đã có dữ liệu chưa
        long existingCount = contractRepository.count();
        if (existingCount > 0) {
            log.info("Documents already exist ({}), skipping seed", existingCount);
            return;
        }

        // Tạo danh sách documents mẫu
        List<Contract> sampleDocuments = createSampleDocuments();
        
        // Lưu vào database
        contractRepository.saveAll(sampleDocuments);
        
        log.info("Successfully seeded {} documents", sampleDocuments.size());
    }

    private List<Contract> createSampleDocuments() {
        return Arrays.asList(
            // Document 1: Hợp đồng bán hàng
            createContract(
                "HĐ-2024-001",
                "Hợp đồng bán hàng máy tính Dell OptiPlex 7090",
                ContractStatus.ACTIVE,
                ContractType.SALES,
                ContractCategory.TECHNOLOGY,
                "Máy tính văn phòng",
                "2024-01-15",
                "2024-12-31",
                "50000000",
                "VND",
                "Chuyển khoản",
                "MEDIUM",
                Arrays.asList("urgent", "high-value", "technology"),
                createPartiesJson("Công ty TNHH ABC", "Công ty TNHH XYZ", "Nguyễn Văn A", "Trần Thị B")
            ),

            // Document 2: Hợp đồng dịch vụ
            createContract(
                "HĐ-2024-002", 
                "Hợp đồng dịch vụ bảo trì hệ thống IT",
                ContractStatus.PENDING_REVIEW,
                ContractType.SERVICE,
                ContractCategory.TECHNOLOGY,
                "Dịch vụ IT",
                "2024-02-01",
                "2024-12-31",
                "120000000",
                "VND",
                "Chuyển khoản",
                "LOW",
                Arrays.asList("service", "maintenance", "it-support"),
                createPartiesJson("Công ty TNHH TechPro", "Công ty TNHH GlobalCorp", "Lê Văn C", "Phạm Thị D")
            ),

            // Document 3: Hợp đồng thuê văn phòng
            createContract(
                "HĐ-2024-003",
                "Hợp đồng thuê văn phòng tầng 15, tòa nhà Landmark",
                ContractStatus.APPROVED,
                ContractType.LEASE,
                ContractCategory.REAL_ESTATE,
                "Thuê văn phòng",
                "2024-03-01",
                "2025-02-28",
                "300000000",
                "VND",
                "Chuyển khoản",
                "LOW",
                Arrays.asList("office-rental", "real-estate", "long-term"),
                createPartiesJson("Công ty TNHH Landmark", "Công ty TNHH StartupHub", "Võ Văn E", "Hoàng Thị F")
            ),

            // Document 4: Hợp đồng mua sắm
            createContract(
                "HĐ-2024-004",
                "Hợp đồng mua sắm thiết bị văn phòng",
                ContractStatus.DRAFT,
                ContractType.PURCHASE,
                ContractCategory.OFFICE_SUPPLIES,
                "Thiết bị văn phòng",
                "2024-04-01",
                "2024-06-30",
                "25000000",
                "VND",
                "Tiền mặt",
                "LOW",
                Arrays.asList("office-supplies", "purchase", "short-term"),
                createPartiesJson("Công ty TNHH OfficeMax", "Công ty TNHH WorkSpace", "Đặng Văn G", "Bùi Thị H")
            ),

            // Document 5: Hợp đồng tư vấn
            createContract(
                "HĐ-2024-005",
                "Hợp đồng tư vấn pháp lý doanh nghiệp",
                ContractStatus.ACTIVE,
                ContractType.CONSULTING,
                ContractCategory.LEGAL,
                "Tư vấn pháp lý",
                "2024-05-01",
                "2024-12-31",
                "80000000",
                "VND",
                "Chuyển khoản",
                "MEDIUM",
                Arrays.asList("legal-consulting", "high-value", "professional"),
                createPartiesJson("Công ty Luật TNHH LegalPro", "Công ty TNHH BusinessCorp", "Ngô Văn I", "Vũ Thị K")
            ),

            // Document 6: Hợp đồng bảo hiểm
            createContract(
                "HĐ-2024-006",
                "Hợp đồng bảo hiểm tài sản doanh nghiệp",
                ContractStatus.EXPIRED,
                ContractType.INSURANCE,
                ContractCategory.INSURANCE,
                "Bảo hiểm tài sản",
                "2023-01-01",
                "2023-12-31",
                "15000000",
                "VND",
                "Chuyển khoản",
                "LOW",
                Arrays.asList("insurance", "expired", "asset-protection"),
                createPartiesJson("Công ty Bảo hiểm TNHH SafeGuard", "Công ty TNHH AssetCorp", "Lý Văn L", "Đinh Thị M")
            ),

            // Document 7: Hợp đồng lao động
            createContract(
                "HĐ-2024-007",
                "Hợp đồng lao động nhân viên IT",
                ContractStatus.ACTIVE,
                ContractType.EMPLOYMENT,
                ContractCategory.HUMAN_RESOURCES,
                "Lao động",
                "2024-06-01",
                "2025-05-31",
                "180000000",
                "VND",
                "Chuyển khoản",
                "LOW",
                Arrays.asList("employment", "it-staff", "long-term"),
                createPartiesJson("Công ty TNHH TechCorp", "Nguyễn Văn Developer", "Nguyễn Văn N", "Nguyễn Văn Developer")
            ),

            // Document 8: Hợp đồng marketing
            createContract(
                "HĐ-2024-008",
                "Hợp đồng dịch vụ marketing digital",
                ContractStatus.PENDING_REVIEW,
                ContractType.MARKETING,
                ContractCategory.MARKETING,
                "Marketing digital",
                "2024-07-01",
                "2024-12-31",
                "60000000",
                "VND",
                "Chuyển khoản",
                "MEDIUM",
                Arrays.asList("marketing", "digital", "campaign"),
                createPartiesJson("Công ty TNHH DigitalPro", "Công ty TNHH BrandCorp", "Phan Văn O", "Lê Thị P")
            )
        );
    }

    private Contract createContract(
            String contractNumber,
            String title,
            ContractStatus status,
            ContractType contractType,
            ContractCategory primaryCategory,
            String contractObject,
            String effectiveDate,
            String contractTerm,
            String totalValue,
            String currency,
            String paymentMethod,
            String riskLevel,
            List<String> tags,
            String partiesJson) {
        
        Contract contract = new Contract();
        contract.setContractNumber(contractNumber);
        contract.setTitle(title);
        contract.setStatus(status);
        contract.setContractType(contractType);
        contract.setPrimaryCategory(primaryCategory);
        contract.setContractObject(contractObject);
        contract.setEffectiveDate(effectiveDate);
        contract.setContractTerm(contractTerm);
        contract.setTotalValue(totalValue);
        contract.setCurrency(currency);
        contract.setPaymentMethod(paymentMethod);
        contract.setRiskLevel(riskLevel);
        contract.setTags(tags);
        contract.setPartiesJson(partiesJson);
        
        // Set dates
        contract.setStartDate(LocalDateTime.now().minusDays(30));
        contract.setEndDate(LocalDateTime.now().plusDays(365));
        contract.setCreatedAt(LocalDateTime.now().minusDays(30));
        contract.setUpdatedAt(LocalDateTime.now());
        
        // Set additional fields
        contract.setSummary("Tóm tắt hợp đồng: " + title);
        contract.setKeyTerms("Điều khoản chính của hợp đồng");
        contract.setFavorableClauses("Điều khoản có lợi cho khách hàng");
        contract.setUnfavorableClauses("Điều khoản cần lưu ý");
        contract.setPaymentSchedule("Thanh toán theo tiến độ");
        contract.setReminders("Nhắc nhở thanh toán và gia hạn");
        contract.setTerminationConditions("Điều kiện chấm dứt hợp đồng");
        contract.setRiskAssessment("Đánh giá rủi ro: " + riskLevel);
        contract.setComplianceStatus("COMPLIANT");
        contract.setLegalReviewRequired(true);
        contract.setReviewDeadline(LocalDateTime.now().plusDays(30));
        contract.setAiProcessed(false);
        contract.setProcessingStatus(com.devgo2003.docgo.document_service.entity.ProcessingStatus.PENDING_REVIEW);
        
        return contract;
    }

    private String createPartiesJson(String party1Name, String party2Name, String party1Rep, String party2Rep) {
        return String.format(
            "[{\"name\":\"%s\",\"role\":\"Bên A\",\"representative\":\"%s\",\"taxCode\":\"0123456789\",\"contact\":\"email@company.com\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\"}," +
            "{\"name\":\"%s\",\"role\":\"Bên B\",\"representative\":\"%s\",\"taxCode\":\"9876543210\",\"contact\":\"info@company.com\",\"address\":\"456 Đường XYZ, Quận 2, TP.HCM\"}]",
            party1Name, party1Rep, party2Name, party2Rep
        );
    }
}
