package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.ESignature;
import com.devgo2003.docgo.contract_service.service.ESignatureService;
import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import com.devgo2003.docgo.contract_service.common.util.ResponseBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contract-management-service")
@Tag(name = "E-Signature Management", description = "API quản lý chữ ký điện tử cho hợp đồng")
public class ESignatureController {

    @Autowired
    private ESignatureService eSignatureService;

    @PostMapping("/contracts/{contractId}/esignature")
    @Operation(summary = "Tạo e-signature mới", description = "Tạo e-signature mới cho contract")
    public ResponseEntity<RestResponse<ESignature>> createESignature(
            @PathVariable String contractId,
            @RequestParam String signerId,
            @RequestParam String signerName,
            @RequestParam String signerEmail,
            @RequestParam String signerRole,
            @RequestParam ESignature.SignatureType signatureType) {
        
        ESignature eSignature = eSignatureService.createESignature(contractId, signerId, signerName, signerEmail, signerRole, signatureType);
        
        return ResponseBuilder.success(eSignature, "Tạo e-signature thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures")
    @Operation(summary = "Lấy danh sách e-signature", description = "Lấy tất cả e-signature của contract")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesByContractId(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào cho contract này");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature thành công");
    }

    @GetMapping("/esignatures/{id}")
    @Operation(summary = "Lấy e-signature theo ID", description = "Lấy chi tiết e-signature")
    public ResponseEntity<RestResponse<ESignature>> getESignatureById(@PathVariable String id) {
        Optional<ESignature> eSignature = eSignatureService.getESignatureById(id);
        
        if (eSignature.isEmpty()) {
            return ResponseBuilder.notFound("Không tìm thấy e-signature");
        }
        
        return ResponseBuilder.success(eSignature.get(), "Lấy e-signature thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/pending")
    @Operation(summary = "Lấy e-signature đang pending", description = "Lấy danh sách e-signature đang chờ ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getPendingSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getPendingSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào đang pending");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature pending thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/signed")
    @Operation(summary = "Lấy e-signature đã signed", description = "Lấy danh sách e-signature đã ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getSignedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào đã signed");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature signed thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/declined")
    @Operation(summary = "Lấy e-signature đã declined", description = "Lấy danh sách e-signature đã từ chối")
    public ResponseEntity<RestResponse<List<ESignature>>> getDeclinedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getDeclinedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào đã declined");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature declined thành công");
    }


    @GetMapping("/contracts/{contractId}/esignatures/verified")
    @Operation(summary = "Lấy e-signature đã verified", description = "Lấy danh sách e-signature đã xác thực")
    public ResponseEntity<RestResponse<List<ESignature>>> getVerifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getVerifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào đã verified");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature verified thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/required")
    @Operation(summary = "Lấy e-signature bắt buộc", description = "Lấy danh sách e-signature bắt buộc")
    public ResponseEntity<RestResponse<List<ESignature>>> getRequiredSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getRequiredSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature bắt buộc nào");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature bắt buộc thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/optional")
    @Operation(summary = "Lấy e-signature tùy chọn", description = "Lấy danh sách e-signature tùy chọn")
    public ResponseEntity<RestResponse<List<ESignature>>> getOptionalSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getOptionalSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature tùy chọn nào");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature tùy chọn thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/consented")
    @Operation(summary = "Lấy e-signature đã consent", description = "Lấy danh sách e-signature đã đồng ý")
    public ResponseEntity<RestResponse<List<ESignature>>> getConsentedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getConsentedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào đã consent");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature đã consent thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/unconsented")
    @Operation(summary = "Lấy e-signature chưa consent", description = "Lấy danh sách e-signature chưa đồng ý")
    public ResponseEntity<RestResponse<List<ESignature>>> getUnconsentedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getUnconsentedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào chưa consent");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature chưa consent thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/compliance-verified")
    @Operation(summary = "Lấy e-signature đã compliance verified", description = "Lấy danh sách e-signature đã xác thực compliance")
    public ResponseEntity<RestResponse<List<ESignature>>> getComplianceVerifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getComplianceVerifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào đã compliance verified");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature đã compliance verified thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/compliance-unverified")
    @Operation(summary = "Lấy e-signature chưa compliance verified", description = "Lấy danh sách e-signature chưa xác thực compliance")
    public ResponseEntity<RestResponse<List<ESignature>>> getComplianceUnverifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getComplianceUnverifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào chưa compliance verified");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature chưa compliance verified thành công");
    }

    @GetMapping("/esignatures/signer/{signerId}")
    @Operation(summary = "Lấy e-signature theo signer ID", description = "Lấy danh sách e-signature của signer")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignerId(@PathVariable String signerId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignerId(signerId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào của signer này");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature của signer thành công");
    }

    @GetMapping("/esignatures/signer/email/{signerEmail}")
    @Operation(summary = "Lấy e-signature theo signer email", description = "Lấy danh sách e-signature của signer email")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignerEmail(@PathVariable String signerEmail) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignerEmail(signerEmail);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào của signer email này");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature của signer email thành công");
    }

    @GetMapping("/esignatures/type/{signatureType}")
    @Operation(summary = "Lấy e-signature theo signature type", description = "Lấy danh sách e-signature theo loại chữ ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignatureType(@PathVariable ESignature.SignatureType signatureType) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignatureType(signatureType);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào với signature type này");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature theo signature type thành công");
    }

    @GetMapping("/esignatures/verification-method/{verificationMethod}")
    @Operation(summary = "Lấy e-signature theo verification method", description = "Lấy danh sách e-signature theo phương thức xác thực")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesByVerificationMethod(@PathVariable ESignature.VerificationMethod verificationMethod) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByVerificationMethod(verificationMethod);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào với verification method này");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature theo verification method thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/order-by-signature-order")
    @Operation(summary = "Lấy e-signature sắp xếp theo signature order", description = "Lấy danh sách e-signature sắp xếp theo thứ tự ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesOrderBySignatureOrder(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractIdOrderBySignatureOrder(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature sắp xếp theo signature order thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/order-by-signed-at")
    @Operation(summary = "Lấy e-signature sắp xếp theo thời gian ký", description = "Lấy danh sách e-signature sắp xếp theo thời gian ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesOrderBySignedAt(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractIdOrderBySignedAt(contractId);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature sắp xếp theo thời gian ký thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/signed-between")
    @Operation(summary = "Lấy e-signature theo thời gian ký", description = "Lấy danh sách e-signature trong khoảng thời gian ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignedAtBetween(startDate, endDate);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào trong khoảng thời gian ký này");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature theo thời gian ký thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/expired")
    @Operation(summary = "Lấy e-signature đã expired", description = "Lấy danh sách e-signature đã hết hạn")
    public ResponseEntity<RestResponse<List<ESignature>>> getExpiredSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getExpiredSignatures(LocalDateTime.now());
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào đã expired");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature expired thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/expiring")
    @Operation(summary = "Lấy e-signature sắp expired", description = "Lấy danh sách e-signature sắp hết hạn")
    public ResponseEntity<RestResponse<List<ESignature>>> getExpiringSignatures(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        List<ESignature> eSignatures = eSignatureService.getExpiringSignatures(dueDate);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào sắp expired");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature expiring thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/high-verification-attempts")
    @Operation(summary = "Lấy e-signature có verification attempts cao", description = "Lấy danh sách e-signature có verification attempts cao")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignaturesWithHighVerificationAttempts(
            @PathVariable String contractId,
            @RequestParam Integer maxAttempts) {
        List<ESignature> eSignatures = eSignatureService.getSignaturesWithHighVerificationAttempts(maxAttempts);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào có verification attempts cao");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature có verification attempts cao thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/with-reminders")
    @Operation(summary = "Lấy e-signature có reminders", description = "Lấy danh sách e-signature có reminders")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignaturesWithReminders(
            @PathVariable String contractId,
            @RequestParam Integer reminderCount) {
        List<ESignature> eSignatures = eSignatureService.getSignaturesWithReminders(reminderCount);
        
        if (eSignatures.isEmpty()) {
            return ResponseBuilder.noContent("Không có e-signature nào có reminders");
        }
        
        return ResponseBuilder.success(eSignatures, "Lấy danh sách e-signature có reminders thành công");
    }

    @PutMapping("/esignatures/{id}/sign")
    @Operation(summary = "Ký e-signature", description = "Ký e-signature")
    public ResponseEntity<RestResponse<ESignature>> signESignature(
            @PathVariable String id,
            @RequestParam String signatureData,
            @RequestParam String signatureImage,
            @RequestParam String ipAddress,
            @RequestParam String userAgent,
            @RequestBody Map<String, Object> deviceInfo) {
        ESignature eSignature = eSignatureService.signESignature(id, signatureData, signatureImage, ipAddress, userAgent, deviceInfo);
        
        return ResponseBuilder.success(eSignature, "Ký e-signature thành công");
    }

    @PutMapping("/esignatures/{id}/decline")
    @Operation(summary = "Từ chối e-signature", description = "Từ chối e-signature")
    public ResponseEntity<RestResponse<ESignature>> declineESignature(
            @PathVariable String id,
            @RequestParam String declineReason) {
        ESignature eSignature = eSignatureService.declineESignature(id, declineReason);
        
        return ResponseBuilder.success(eSignature, "Từ chối e-signature thành công");
    }

    @PutMapping("/esignatures/{id}/verify")
    @Operation(summary = "Xác thực e-signature", description = "Xác thực e-signature")
    public ResponseEntity<RestResponse<ESignature>> verifyESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.verifyESignature(id);
        
        return ResponseBuilder.success(eSignature, "Xác thực e-signature thành công");
    }

    @PutMapping("/esignatures/{id}/fail-verification")
    @Operation(summary = "Xác thực e-signature thất bại", description = "Xác thực e-signature thất bại")
    public ResponseEntity<RestResponse<ESignature>> failVerificationESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.failVerificationESignature(id);
        
        return ResponseBuilder.success(eSignature, "Xác thực e-signature thất bại thành công");
    }

    @PutMapping("/esignatures/{id}/expire")
    @Operation(summary = "Đánh dấu e-signature hết hạn", description = "Đánh dấu e-signature đã hết hạn")
    public ResponseEntity<RestResponse<ESignature>> expireESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.expireESignature(id);
        
        return ResponseBuilder.success(eSignature, "Đánh dấu e-signature hết hạn thành công");
    }

    @PutMapping("/esignatures/{id}/cancel")
    @Operation(summary = "Hủy e-signature", description = "Hủy e-signature")
    public ResponseEntity<RestResponse<ESignature>> cancelESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.cancelESignature(id);
        
        return ResponseBuilder.success(eSignature, "Hủy e-signature thành công");
    }

    @PutMapping("/esignatures/{id}/increment-reminder")
    @Operation(summary = "Tăng reminder count", description = "Tăng số lần nhắc nhở")
    public ResponseEntity<RestResponse<ESignature>> incrementReminderCount(@PathVariable String id) {
        ESignature eSignature = eSignatureService.incrementReminderCount(id);
        
        return ResponseBuilder.success(eSignature, "Tăng reminder count thành công");
    }

    @PutMapping("/esignatures/{id}/give-consent")
    @Operation(summary = "Đồng ý e-signature", description = "Đồng ý e-signature")
    public ResponseEntity<RestResponse<ESignature>> giveLegalConsent(@PathVariable String id) {
        ESignature eSignature = eSignatureService.giveLegalConsent(id);
        
        return ResponseBuilder.success(eSignature, "Đồng ý e-signature thành công");
    }

    @PutMapping("/esignatures/{id}/verify-compliance")
    @Operation(summary = "Xác thực compliance", description = "Xác thực compliance")
    public ResponseEntity<RestResponse<ESignature>> verifyCompliance(
            @PathVariable String id,
            @RequestParam String verifiedBy) {
        ESignature eSignature = eSignatureService.verifyCompliance(id, verifiedBy);
        
        return ResponseBuilder.success(eSignature, "Xác thực compliance thành công");
    }

    @PutMapping("/esignatures/{id}/signature-order")
    @Operation(summary = "Cập nhật signature order", description = "Cập nhật thứ tự ký")
    public ResponseEntity<RestResponse<ESignature>> setSignatureOrder(
            @PathVariable String id,
            @RequestParam Integer signatureOrder) {
        ESignature eSignature = eSignatureService.setSignatureOrder(id, signatureOrder);
        
        return ResponseBuilder.success(eSignature, "Cập nhật signature order thành công");
    }

    @PutMapping("/esignatures/{id}/required")
    @Operation(summary = "Cập nhật isRequired", description = "Cập nhật trạng thái bắt buộc")
    public ResponseEntity<RestResponse<ESignature>> setIsRequired(
            @PathVariable String id,
            @RequestParam Boolean isRequired) {
        ESignature eSignature = eSignatureService.setIsRequired(id, isRequired);
        
        return ResponseBuilder.success(eSignature, "Cập nhật isRequired thành công");
    }

    @PutMapping("/esignatures/{id}/expires-at")
    @Operation(summary = "Cập nhật expires at", description = "Cập nhật thời gian hết hạn")
    public ResponseEntity<RestResponse<ESignature>> setExpiresAt(
            @PathVariable String id,
            @RequestParam LocalDateTime expiresAt) {
        ESignature eSignature = eSignatureService.setExpiresAt(id, expiresAt);
        
        return ResponseBuilder.success(eSignature, "Cập nhật expires at thành công");
    }

    @PutMapping("/esignatures/{id}/verification-method")
    @Operation(summary = "Cập nhật verification method", description = "Cập nhật phương thức xác thực")
    public ResponseEntity<RestResponse<ESignature>> setVerificationMethod(
            @PathVariable String id,
            @RequestParam ESignature.VerificationMethod verificationMethod) {
        ESignature eSignature = eSignatureService.setVerificationMethod(id, verificationMethod);
        
        return ResponseBuilder.success(eSignature, "Cập nhật verification method thành công");
    }

    @PutMapping("/esignatures/{id}/verification-code")
    @Operation(summary = "Cập nhật verification code", description = "Cập nhật mã xác thực")
    public ResponseEntity<RestResponse<ESignature>> setVerificationCode(
            @PathVariable String id,
            @RequestParam String verificationCode) {
        ESignature eSignature = eSignatureService.setVerificationCode(id, verificationCode);
        
        return ResponseBuilder.success(eSignature, "Cập nhật verification code thành công");
    }

    @PutMapping("/esignatures/{id}/certificate-data")
    @Operation(summary = "Cập nhật certificate data", description = "Cập nhật dữ liệu chứng chỉ")
    public ResponseEntity<RestResponse<ESignature>> setCertificateData(
            @PathVariable String id,
            @RequestParam String certificateData,
            @RequestParam String certificateIssuer,
            @RequestParam String certificateSerial,
            @RequestParam LocalDateTime validFrom,
            @RequestParam LocalDateTime validTo) {
        ESignature eSignature = eSignatureService.setCertificateData(id, certificateData, certificateIssuer, certificateSerial, validFrom, validTo);
        
        return ResponseBuilder.success(eSignature, "Cập nhật certificate data thành công");
    }

    @PutMapping("/esignatures/{id}/location-info")
    @Operation(summary = "Cập nhật location info", description = "Cập nhật thông tin vị trí")
    public ResponseEntity<RestResponse<ESignature>> setLocationInfo(
            @PathVariable String id,
            @RequestBody Map<String, Object> locationInfo) {
        ESignature eSignature = eSignatureService.setLocationInfo(id, locationInfo);
        
        return ResponseBuilder.success(eSignature, "Cập nhật location info thành công");
    }

    @PutMapping("/esignatures/{id}/audit-trail")
    @Operation(summary = "Cập nhật audit trail", description = "Cập nhật audit trail")
    public ResponseEntity<RestResponse<ESignature>> setAuditTrail(
            @PathVariable String id,
            @RequestParam String auditTrail) {
        ESignature eSignature = eSignatureService.setAuditTrail(id, auditTrail);
        
        return ResponseBuilder.success(eSignature, "Cập nhật audit trail thành công");
    }

    @DeleteMapping("/esignatures/{id}")
    @Operation(summary = "Xóa e-signature", description = "Soft delete e-signature")
    public ResponseEntity<RestResponse<Void>> deleteESignature(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        eSignatureService.deleteESignature(id, deletedBy);
        
        return ResponseBuilder.success(null, "Xóa e-signature thành công");
    }

    @PutMapping("/esignatures/{id}/restore")
    @Operation(summary = "Khôi phục e-signature", description = "Khôi phục e-signature đã xóa")
    public ResponseEntity<RestResponse<ESignature>> restoreESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.restoreESignature(id);
        
        return ResponseBuilder.success(eSignature, "Khôi phục e-signature thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count")
    @Operation(summary = "Đếm số e-signature", description = "Đếm số lượng e-signature")
    public ResponseEntity<RestResponse<Long>> countESignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countESignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-by-status")
    @Operation(summary = "Đếm số e-signature theo status", description = "Đếm số lượng e-signature theo status")
    public ResponseEntity<RestResponse<Long>> countESignaturesByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam ESignature.SignatureStatus status) {
        long count = eSignatureService.countESignaturesByContractIdAndStatus(contractId, status);
        
        return ResponseBuilder.success(count, "Đếm số e-signature theo status thành công");
    }

    @GetMapping("/esignatures/signer/{signerId}/count")
    @Operation(summary = "Đếm số e-signature của signer", description = "Đếm số lượng e-signature của signer")
    public ResponseEntity<RestResponse<Long>> countESignaturesBySignerId(@PathVariable String signerId) {
        long count = eSignatureService.countESignaturesBySignerId(signerId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature của signer thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-pending")
    @Operation(summary = "Đếm số e-signature pending", description = "Đếm số lượng e-signature đang pending")
    public ResponseEntity<RestResponse<Long>> countPendingSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countPendingSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature pending thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-signed")
    @Operation(summary = "Đếm số e-signature signed", description = "Đếm số lượng e-signature đã signed")
    public ResponseEntity<RestResponse<Long>> countSignedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countSignedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature signed thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-declined")
    @Operation(summary = "Đếm số e-signature declined", description = "Đếm số lượng e-signature đã declined")
    public ResponseEntity<RestResponse<Long>> countDeclinedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countDeclinedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature declined thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-expired")
    @Operation(summary = "Đếm số e-signature expired", description = "Đếm số lượng e-signature đã expired")
    public ResponseEntity<RestResponse<Long>> countExpiredSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countExpiredSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature expired thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-verified")
    @Operation(summary = "Đếm số e-signature verified", description = "Đếm số lượng e-signature đã verified")
    public ResponseEntity<RestResponse<Long>> countVerifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countVerifiedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature verified thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-required")
    @Operation(summary = "Đếm số e-signature required", description = "Đếm số lượng e-signature bắt buộc")
    public ResponseEntity<RestResponse<Long>> countRequiredSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countRequiredSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature required thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-optional")
    @Operation(summary = "Đếm số e-signature optional", description = "Đếm số lượng e-signature tùy chọn")
    public ResponseEntity<RestResponse<Long>> countOptionalSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countOptionalSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature optional thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-consented")
    @Operation(summary = "Đếm số e-signature consented", description = "Đếm số lượng e-signature đã consented")
    public ResponseEntity<RestResponse<Long>> countConsentedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countConsentedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature consented thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-unconsented")
    @Operation(summary = "Đếm số e-signature unconsented", description = "Đếm số lượng e-signature chưa consented")
    public ResponseEntity<RestResponse<Long>> countUnconsentedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countUnconsentedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature unconsented thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-compliance-verified")
    @Operation(summary = "Đếm số e-signature compliance verified", description = "Đếm số lượng e-signature đã compliance verified")
    public ResponseEntity<RestResponse<Long>> countComplianceVerifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countComplianceVerifiedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature compliance verified thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-compliance-unverified")
    @Operation(summary = "Đếm số e-signature compliance unverified", description = "Đếm số lượng e-signature chưa compliance verified")
    public ResponseEntity<RestResponse<Long>> countComplianceUnverifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countComplianceUnverifiedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số e-signature compliance unverified thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists")
    @Operation(summary = "Kiểm tra có e-signature", description = "Kiểm tra contract có e-signature không")
    public ResponseEntity<RestResponse<Boolean>> existsESignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsESignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-pending")
    @Operation(summary = "Kiểm tra có e-signature pending", description = "Kiểm tra contract có e-signature pending không")
    public ResponseEntity<RestResponse<Boolean>> existsPendingSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsPendingSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature pending thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-signed")
    @Operation(summary = "Kiểm tra có e-signature signed", description = "Kiểm tra contract có e-signature signed không")
    public ResponseEntity<RestResponse<Boolean>> existsSignedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsSignedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature signed thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-declined")
    @Operation(summary = "Kiểm tra có e-signature declined", description = "Kiểm tra contract có e-signature declined không")
    public ResponseEntity<RestResponse<Boolean>> existsDeclinedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsDeclinedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature declined thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-expired")
    @Operation(summary = "Kiểm tra có e-signature expired", description = "Kiểm tra contract có e-signature expired không")
    public ResponseEntity<RestResponse<Boolean>> existsExpiredSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsExpiredSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature expired thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-verified")
    @Operation(summary = "Kiểm tra có e-signature verified", description = "Kiểm tra contract có e-signature verified không")
    public ResponseEntity<RestResponse<Boolean>> existsVerifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsVerifiedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature verified thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-required")
    @Operation(summary = "Kiểm tra có e-signature required", description = "Kiểm tra contract có e-signature required không")
    public ResponseEntity<RestResponse<Boolean>> existsRequiredSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsRequiredSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature required thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-optional")
    @Operation(summary = "Kiểm tra có e-signature optional", description = "Kiểm tra contract có e-signature optional không")
    public ResponseEntity<RestResponse<Boolean>> existsOptionalSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsOptionalSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature optional thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-consented")
    @Operation(summary = "Kiểm tra có e-signature consented", description = "Kiểm tra contract có e-signature consented không")
    public ResponseEntity<RestResponse<Boolean>> existsConsentedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsConsentedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature consented thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-unconsented")
    @Operation(summary = "Kiểm tra có e-signature unconsented", description = "Kiểm tra contract có e-signature unconsented không")
    public ResponseEntity<RestResponse<Boolean>> existsUnconsentedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsUnconsentedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature unconsented thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-compliance-verified")
    @Operation(summary = "Kiểm tra có e-signature compliance verified", description = "Kiểm tra contract có e-signature compliance verified không")
    public ResponseEntity<RestResponse<Boolean>> existsComplianceVerifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsComplianceVerifiedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature compliance verified thành công");
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-compliance-unverified")
    @Operation(summary = "Kiểm tra có e-signature compliance unverified", description = "Kiểm tra contract có e-signature compliance unverified không")
    public ResponseEntity<RestResponse<Boolean>> existsComplianceUnverifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsComplianceUnverifiedSignaturesByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có e-signature compliance unverified thành công");
    }
}
