package com.devgo2003.docgo.document_service.script;

import com.devgo2003.docgo.document_service.entity.Contract;
import com.devgo2003.docgo.document_service.entity.ContractSummary;
import com.devgo2003.docgo.document_service.entity.ContractParty;
import com.devgo2003.docgo.document_service.entity.ContractPaymentDetails;
import com.devgo2003.docgo.document_service.entity.ContractKeyClause;
import com.devgo2003.docgo.document_service.entity.ContractFavorableClause;
import com.devgo2003.docgo.document_service.entity.ContractUnfavorableClause;
import com.devgo2003.docgo.document_service.entity.ContractReminder;
import com.devgo2003.docgo.document_service.entity.ContractRiskAssessment;
import com.devgo2003.docgo.document_service.entity.ContractComplianceStatus;
import com.devgo2003.docgo.document_service.enums.ContractStatus;
import com.devgo2003.docgo.document_service.enums.ContractType;
import com.devgo2003.docgo.document_service.repository.ContractRepository;
import com.devgo2003.docgo.document_service.repository.ContractSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Script để seed ContractSummary cho 1-2 contracts
 * Tạo dữ liệu mẫu để test lazy loading và frontend detail page
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ContractSummarySeedScript implements CommandLineRunner {

    private final ContractRepository contractRepository;
    private final ContractSummaryRepository contractSummaryRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting contract summary seed script...");
        
        // Kiểm tra xem đã có ContractSummary chưa
        long existingCount = contractSummaryRepository.count();
        if (existingCount > 0) {
            log.info("Contract summaries already exist ({}), skipping seed", existingCount);
            return;
        }

        // Tìm 2 contracts đầu tiên để tạo summary
        List<Contract> contracts = contractRepository.findAll();
        if (contracts.size() < 2) {
            log.warn("Not enough contracts found to create summaries");
            return;
        }

        // Tạo ContractSummary cho 2 contracts đầu tiên
        ContractSummary summary1 = createContractSummary(contracts.get(0));
        ContractSummary summary2 = createContractSummary(contracts.get(1));
        
        // Lưu vào database
        contractSummaryRepository.saveAll(Arrays.asList(summary1, summary2));
        
        log.info("Successfully seeded {} contract summaries", 2);
    }

    private ContractSummary createContractSummary(Contract contract) {
        ContractSummary summary = new ContractSummary();
        
        // Basic info
        summary.setContractId(contract.getId());
        summary.setContractNumber(contract.getContractNumber());
        summary.setTitle(contract.getTitle());
        summary.setStatus(contract.getStatus());
        summary.setContractType(contract.getContractType());
        summary.setObject(contract.getContractObject());
        summary.setEffectiveDate(contract.getEffectiveDate());
        summary.setTerm(contract.getContractTerm());
        
        // Parties
        List<ContractParty> parties = Arrays.asList(
            createContractParty("Bên A", "Công ty TNHH ABC", "Nguyễn Văn A", "0123456789", "contact@abc.com", "123 Đường ABC, TP.HCM"),
            createContractParty("Bên B", "Công ty TNHH XYZ", "Trần Thị B", "9876543210", "info@xyz.com", "456 Đường XYZ, TP.HCM")
        );
        summary.setParties(parties);
        
        // Payment details
        ContractPaymentDetails paymentDetails = new ContractPaymentDetails();
        paymentDetails.setTotalValue(Double.parseDouble(contract.getTotalValue()));
        paymentDetails.setSchedule("Thanh toán 50% khi ký hợp đồng, 50% khi hoàn thành");
        paymentDetails.setCurrency(contract.getCurrency());
        paymentDetails.setPaymentMethod(contract.getPaymentMethod());
        summary.setPaymentDetails(paymentDetails);
        
        // Key clauses
        List<ContractKeyClause> keyClauses = Arrays.asList(
            createKeyClause("Điều khoản thanh toán", "Thanh toán theo tiến độ thực hiện", "Điều 5"),
            createKeyClause("Điều khoản bảo hành", "Bảo hành 12 tháng kể từ ngày bàn giao", "Điều 8"),
            createKeyClause("Điều khoản chấm dứt", "Chấm dứt hợp đồng khi vi phạm nghiêm trọng", "Điều 12")
        );
        summary.setKeyClauses(keyClauses);
        
        // Favorable clauses
        List<ContractFavorableClause> favorableClauses = Arrays.asList(
            createFavorableClause("Điều khoản bảo hành", "Bảo hành miễn phí 24 tháng", "Bên A"),
            createFavorableClause("Điều khoản hỗ trợ", "Hỗ trợ kỹ thuật 24/7", "Bên A")
        );
        summary.setFavorableClauses(favorableClauses);
        
        // Unfavorable clauses
        List<ContractUnfavorableClause> unfavorableClauses = Arrays.asList(
            createUnfavorableClause("Điều khoản phạt", "Phạt 5% giá trị hợp đồng nếu chậm giao hàng", "Bên B"),
            createUnfavorableClause("Điều khoản rủi ro", "Bên B chịu mọi rủi ro trong quá trình vận chuyển", "Bên B")
        );
        summary.setUnfavorableClauses(unfavorableClauses);
        
        // Reminders
        List<ContractReminder> reminders = Arrays.asList(
            createReminder("Thanh toán", LocalDateTime.now().plusDays(30), "Nhắc nhở thanh toán đợt 1"),
            createReminder("Bàn giao", LocalDateTime.now().plusDays(60), "Nhắc nhở bàn giao sản phẩm"),
            createReminder("Bảo hành", LocalDateTime.now().plusDays(365), "Nhắc nhở hết hạn bảo hành")
        );
        summary.setReminders(reminders);
        
        // Termination conditions
        summary.setTerminationConditions("Chấm dứt hợp đồng khi: 1) Vi phạm nghiêm trọng, 2) Không thanh toán quá 30 ngày, 3) Bất khả kháng");
        
        // Risk assessment
        ContractRiskAssessment riskAssessment = new ContractRiskAssessment();
        riskAssessment.setRiskLevel(contract.getRiskLevel());
        riskAssessment.setRiskFactors(Arrays.asList("Rủi ro tài chính", "Rủi ro kỹ thuật", "Rủi ro pháp lý"));
        riskAssessment.setMitigationMeasures(Arrays.asList("Mua bảo hiểm", "Kiểm tra kỹ thuật", "Tư vấn pháp lý"));
        summary.setRiskAssessment(riskAssessment);
        
        // Compliance status
        ContractComplianceStatus complianceStatus = new ContractComplianceStatus();
        complianceStatus.setStatus("COMPLIANT");
        complianceStatus.setIssues(Arrays.asList("Cần cập nhật thông tin thuế"));
        complianceStatus.setRecommendations(Arrays.asList("Cập nhật mã số thuế", "Bổ sung điều khoản bảo mật"));
        summary.setComplianceStatus(complianceStatus);
        
        // Set audit fields
        summary.setCreatedAt(LocalDateTime.now());
        summary.setUpdatedAt(LocalDateTime.now());
        summary.setCreatedBy("system");
        summary.setUpdatedBy("system");
        summary.setDeleted(false);
        
        return summary;
    }

    private ContractParty createContractParty(String role, String name, String representative, String taxCode, String contact, String address) {
        ContractParty party = new ContractParty();
        party.setRole(role);
        party.setName(name);
        party.setRepresentative(representative);
        party.setTaxCode(taxCode);
        party.setContact(contact);
        party.setAddress(address);
        party.setBusinessLicense("BL-" + taxCode);
        return party;
    }

    private ContractKeyClause createKeyClause(String name, String description, String source) {
        ContractKeyClause clause = new ContractKeyClause();
        clause.setName(name);
        clause.setDescription(description);
        clause.setSource(source);
        return clause;
    }

    private ContractFavorableClause createFavorableClause(String clauseName, String description, String benefitTo) {
        ContractFavorableClause clause = new ContractFavorableClause();
        clause.setClauseName(clauseName);
        clause.setDescription(description);
        clause.setBenefitTo(benefitTo);
        return clause;
    }

    private ContractUnfavorableClause createUnfavorableClause(String clauseName, String description, String riskTo) {
        ContractUnfavorableClause clause = new ContractUnfavorableClause();
        clause.setClauseName(clauseName);
        clause.setDescription(description);
        clause.setRiskTo(riskTo);
        return clause;
    }

    private ContractReminder createReminder(String type, LocalDateTime date, String content) {
        ContractReminder reminder = new ContractReminder();
        reminder.setType(type);
        reminder.setDate(date);
        reminder.setContent(content);
        return reminder;
    }
}
