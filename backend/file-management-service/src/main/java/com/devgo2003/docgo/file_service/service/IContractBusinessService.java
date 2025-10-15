package com.devgo2003.docgo.file_service.service;

import com.devgo2003.docgo.file_service.dto.ContractValidationResult;
import com.devgo2003.docgo.file_service.entity.Contract;
import com.devgo2003.docgo.file_service.entity.ContractAttachment;
import com.devgo2003.docgo.file_service.entity.ContractEvent;

import java.util.List;

/**
 * Interface cho ContractBusinessService
 * Cung cấp các method xử lý business logic cho contracts
 */
public interface IContractBusinessService {

    /**
     * Validate contract
     * @param contract Contract cần validate
     * @return ContractValidationResult
     */
    ContractValidationResult validateContract(Contract contract);

    /**
     * Thay đổi trạng thái contract
     * @param contractId ID của contract
     * @param newStatus Trạng thái mới
     * @return Contract đã cập nhật
     */
    Contract changeContractStatus(String contractId, String newStatus);

    /**
     * Xử lý workflow contract
     * @param contractId ID của contract
     * @param action Hành động workflow
     * @return Contract đã cập nhật
     */
    Contract processContractWorkflow(String contractId, String action);

    /**
     * Tính toán metrics contract
     * @param contractId ID của contract
     * @return Map chứa các metrics
     */
    java.util.Map<String, Object> calculateContractMetrics(String contractId);

    /**
     * Kiểm tra contract sắp hết hạn
     * @param contractId ID của contract
     * @return true nếu sắp hết hạn, false nếu không
     */
    boolean checkContractExpiry(String contractId);

    /**
     * Thêm attachment vào contract
     * @param contractId ID của contract
     * @param attachment Attachment cần thêm
     * @return ContractAttachment đã thêm
     */
    ContractAttachment addAttachment(String contractId, ContractAttachment attachment);

    /**
     * Lấy attachments của contract
     * @param contractId ID của contract
     * @return List ContractAttachment
     */
    List<ContractAttachment> getAttachments(String contractId);

    /**
     * Lấy events của contract
     * @param contractId ID của contract
     * @return List ContractEvent
     */
    List<ContractEvent> getContractEvents(String contractId);

    /**
     * Tạo hoặc cập nhật contract summary
     * @param contractId ID của contract
     * @param fileId ID của file
     * @param filename Tên file
     * @param summary Tóm tắt
     * @param partiesJson JSON các bên tham gia
     * @param keyTerms Điều khoản chính
     * @param favorableClauses Điều khoản có lợi
     * @param unfavorableClauses Điều khoản bất lợi
     * @param riskLevel Mức độ rủi ro
     * @param complianceStatus Trạng thái tuân thủ
     */
    void createOrUpdateContractSummary(String contractId, String fileId, String filename, String summary, 
                                     String partiesJson, String keyTerms, String favorableClauses, 
                                     String unfavorableClauses, String riskLevel, String complianceStatus);

    /**
     * Tạo hoặc cập nhật contract file
     * @param contractId ID của contract
     * @param fileId ID của file
     * @param filename Tên file
     * @param fileType Loại file
     * @param fileSize Kích thước file
     * @param filePath Đường dẫn file
     */
    void createOrUpdateContractFile(String contractId, String fileId, String filename, String fileType, 
                                  String fileSize, String filePath);

    /**
     * Tạo hoặc cập nhật contract party
     * @param contractId ID của contract
     * @param partyName Tên bên tham gia
     * @param partyRole Vai trò bên tham gia
     * @param contactInfo Thông tin liên hệ
     * @param address Địa chỉ
     * @param taxCode Mã số thuế
     */
    void createOrUpdateContractParty(String contractId, String partyName, String partyRole, 
                                   String contactInfo, String address, String taxCode);

    /**
     * Tạo hoặc cập nhật contract clause
     * @param contractId ID của contract
     * @param clauseName Tên điều khoản
     * @param description Mô tả điều khoản
     * @param clauseType Loại điều khoản
     * @param importanceLevel Mức độ quan trọng
     * @param source Nguồn điều khoản
     */
    void createOrUpdateContractClause(String contractId, String clauseName, String description, 
                                    String clauseType, String importanceLevel, String source);

    /**
     * Tạo hoặc cập nhật contract payment
     * @param contractId ID của contract
     * @param totalValue Tổng giá trị
     * @param schedule Lịch thanh toán
     * @param currency Tiền tệ
     */
    void createOrUpdateContractPayment(String contractId, String totalValue, String schedule, String currency);
}
