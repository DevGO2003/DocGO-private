package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.Version;
import com.devgo2003.docgo.contract_service.service.VersionService;
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
@Tag(name = "Version Management", description = "API quản lý phiên bản và lịch sử thay đổi hợp đồng")
public class VersionController {

    @Autowired
    private VersionService versionService;

    @PostMapping("/contracts/{contractId}/versions")
    @Operation(summary = "Tạo version mới", description = "Tạo version mới cho contract")
    public ResponseEntity<RestResponse<Version>> createVersion(
            @PathVariable String contractId,
            @RequestParam String versionNumber,
            @RequestParam String versionName,
            @RequestParam Version.ChangeType changeType,
            @RequestParam String changesSummary) {
        
        Version version = versionService.createVersion(contractId, versionNumber, versionName, changeType, changesSummary);
        
        return ResponseBuilder.success(version, "Tạo version thành công");
    }

    @GetMapping("/contracts/{contractId}/versions")
    @Operation(summary = "Lấy danh sách version", description = "Lấy tất cả version của contract")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByContractId(@PathVariable String contractId) {
        List<Version> versions = versionService.getVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào cho contract này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version thành công");
    }

    @GetMapping("/versions/{id}")
    @Operation(summary = "Lấy version theo ID", description = "Lấy chi tiết version")
    public ResponseEntity<RestResponse<Version>> getVersionById(@PathVariable String id) {
        Optional<Version> version = versionService.getVersionById(id);
        
        if (version.isEmpty()) {
            return ResponseBuilder.notFound("Không tìm thấy version");
        }
        
        return ResponseBuilder.success(version.get(), "Lấy version thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/current")
    @Operation(summary = "Lấy version hiện tại", description = "Lấy version hiện tại của contract")
    public ResponseEntity<RestResponse<Version>> getCurrentVersion(@PathVariable String contractId) {
        Optional<Version> version = versionService.getCurrentVersionByContractId(contractId);
        
        if (version.isEmpty()) {
            return ResponseBuilder.notFound("Không có version hiện tại");
        }
        
        return ResponseBuilder.success(version.get(), "Lấy version hiện tại thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/published")
    @Operation(summary = "Lấy version đã published", description = "Lấy danh sách version đã published")
    public ResponseEntity<RestResponse<List<Version>>> getPublishedVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getPublishedVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào đã published");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version published thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/unpublished")
    @Operation(summary = "Lấy version chưa published", description = "Lấy danh sách version chưa published")
    public ResponseEntity<RestResponse<List<Version>>> getUnpublishedVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getUnpublishedVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào chưa published");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version unpublished thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/change-type/{changeType}")
    @Operation(summary = "Lấy version theo change type", description = "Lấy danh sách version theo loại thay đổi")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByChangeType(
            @PathVariable String contractId,
            @PathVariable Version.ChangeType changeType) {
        List<Version> versions = versionService.getVersionsByChangeType(contractId, changeType);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với change type này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo change type thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/current-list")
    @Operation(summary = "Lấy danh sách version hiện tại", description = "Lấy danh sách version đang là current")
    public ResponseEntity<RestResponse<List<Version>>> getCurrentVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getCurrentVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào đang là current");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version current thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/published-list")
    @Operation(summary = "Lấy danh sách version published", description = "Lấy danh sách version đã published")
    public ResponseEntity<RestResponse<List<Version>>> getPublishedVersionsList(@PathVariable String contractId) {
        List<Version> versions = versionService.getPublishedVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào đã published");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version published thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/approval-required")
    @Operation(summary = "Lấy version cần approval", description = "Lấy danh sách version cần phê duyệt")
    public ResponseEntity<RestResponse<List<Version>>> getApprovalRequiredVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getApprovalRequiredVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào cần approval");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version cần approval thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/no-approval-required")
    @Operation(summary = "Lấy version không cần approval", description = "Lấy danh sách version không cần phê duyệt")
    public ResponseEntity<RestResponse<List<Version>>> getNoApprovalRequiredVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getNoApprovalRequiredVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào không cần approval");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version không cần approval thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/previous/{previousVersionId}")
    @Operation(summary = "Lấy version theo previous version", description = "Lấy danh sách version theo previous version ID")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByPreviousVersionId(
            @PathVariable String contractId,
            @PathVariable String previousVersionId) {
        List<Version> versions = versionService.getVersionsByPreviousVersionId(previousVersionId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với previous version này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo previous version thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/order-by-version")
    @Operation(summary = "Lấy version sắp xếp theo version number", description = "Lấy danh sách version sắp xếp theo version number")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsOrderByVersionNumber(@PathVariable String contractId) {
        List<Version> versions = versionService.getVersionsByContractIdOrderByVersionNumber(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version sắp xếp theo version number thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/order-by-created")
    @Operation(summary = "Lấy version sắp xếp theo thời gian tạo", description = "Lấy danh sách version sắp xếp theo thời gian tạo")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsOrderByCreatedAt(@PathVariable String contractId) {
        List<Version> versions = versionService.getVersionsByContractIdOrderByCreatedAt(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version sắp xếp theo thời gian tạo thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/created-between")
    @Operation(summary = "Lấy version theo thời gian tạo", description = "Lấy danh sách version trong khoảng thời gian tạo")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByCreatedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Version> versions = versionService.getVersionsByCreatedAtBetween(startDate, endDate);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào trong khoảng thời gian này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo thời gian tạo thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/published-between")
    @Operation(summary = "Lấy version theo thời gian published", description = "Lấy danh sách version trong khoảng thời gian published")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByPublishedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Version> versions = versionService.getVersionsByPublishedAtBetween(startDate, endDate);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào trong khoảng thời gian published này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo thời gian published thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/approved-between")
    @Operation(summary = "Lấy version theo thời gian approved", description = "Lấy danh sách version trong khoảng thời gian approved")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByApprovedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Version> versions = versionService.getVersionsByApprovedAtBetween(startDate, endDate);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào trong khoảng thời gian approved này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo thời gian approved thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/published-by/{publishedBy}")
    @Operation(summary = "Lấy version theo published by", description = "Lấy danh sách version theo người published")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByPublishedBy(
            @PathVariable String contractId,
            @PathVariable String publishedBy) {
        List<Version> versions = versionService.getVersionsByPublishedBy(publishedBy);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào được published bởi người này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo published by thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/approved-by/{approvedBy}")
    @Operation(summary = "Lấy version theo approved by", description = "Lấy danh sách version theo người approved")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByApprovedBy(
            @PathVariable String contractId,
            @PathVariable String approvedBy) {
        List<Version> versions = versionService.getVersionsByApprovedBy(approvedBy);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào được approved bởi người này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo approved by thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/tags")
    @Operation(summary = "Lấy version theo tags", description = "Lấy danh sách version theo tags")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByTags(
            @PathVariable String contractId,
            @RequestParam String[] tags) {
        List<Version> versions = versionService.getVersionsByContractIdAndTags(contractId, tags);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với tags này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo tags thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/change-type/{changeType}/order-by-created")
    @Operation(summary = "Lấy version theo change type sắp xếp theo thời gian tạo", description = "Lấy danh sách version theo change type sắp xếp theo thời gian tạo")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByChangeTypeOrderByCreatedAt(
            @PathVariable String contractId,
            @PathVariable Version.ChangeType changeType) {
        List<Version> versions = versionService.getVersionsByContractIdAndChangeTypeOrderByCreatedAt(contractId, changeType);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với change type này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo change type sắp xếp theo thời gian tạo thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/change-type/{changeType}/order-by-version")
    @Operation(summary = "Lấy version theo change type sắp xếp theo version number", description = "Lấy danh sách version theo change type sắp xếp theo version number")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByChangeTypeOrderByVersionNumber(
            @PathVariable String contractId,
            @PathVariable Version.ChangeType changeType) {
        List<Version> versions = versionService.getVersionsByContractIdAndChangeTypeOrderByVersionNumber(contractId, changeType);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với change type này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo change type sắp xếp theo version number thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/previous/{previousVersionId}/list")
    @Operation(summary = "Lấy version theo previous version ID", description = "Lấy danh sách version theo previous version ID")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByContractIdAndPreviousVersionId(
            @PathVariable String contractId,
            @PathVariable String previousVersionId) {
        List<Version> versions = versionService.getVersionsByContractIdAndPreviousVersionId(contractId, previousVersionId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với previous version ID này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo previous version ID thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/file-path/{filePath}")
    @Operation(summary = "Lấy version theo file path", description = "Lấy danh sách version theo file path")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByFilePath(
            @PathVariable String contractId,
            @PathVariable String filePath) {
        List<Version> versions = versionService.getVersionsByContractIdAndFilePath(contractId, filePath);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với file path này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo file path thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/checksum/{checksum}")
    @Operation(summary = "Lấy version theo checksum", description = "Lấy danh sách version theo checksum")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByChecksum(
            @PathVariable String contractId,
            @PathVariable String checksum) {
        List<Version> versions = versionService.getVersionsByContractIdAndChecksum(contractId, checksum);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với checksum này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo checksum thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/file-size/{fileSize}")
    @Operation(summary = "Lấy version theo file size", description = "Lấy danh sách version theo file size")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByFileSize(
            @PathVariable String contractId,
            @PathVariable Long fileSize) {
        List<Version> versions = versionService.getVersionsByContractIdAndFileSize(contractId, fileSize);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với file size này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo file size thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/file-size-between")
    @Operation(summary = "Lấy version theo file size trong khoảng", description = "Lấy danh sách version theo file size trong khoảng")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByFileSizeBetween(
            @PathVariable String contractId,
            @RequestParam Long minSize,
            @RequestParam Long maxSize) {
        List<Version> versions = versionService.getVersionsByContractIdAndFileSizeBetween(contractId, minSize, maxSize);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version nào với file size trong khoảng này");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version theo file size trong khoảng thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/rollback")
    @Operation(summary = "Lấy version rollback", description = "Lấy danh sách version rollback")
    public ResponseEntity<RestResponse<List<Version>>> getRollbackVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getRollbackVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version rollback nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version rollback thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/rollback-by-type")
    @Operation(summary = "Lấy version rollback theo change type", description = "Lấy danh sách version rollback theo change type")
    public ResponseEntity<RestResponse<List<Version>>> getRollbackVersionsByChangeType(@PathVariable String contractId) {
        List<Version> versions = versionService.getRollbackVersionsByContractIdAndChangeType(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version rollback nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version rollback theo change type thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/draft")
    @Operation(summary = "Lấy version draft", description = "Lấy danh sách version draft")
    public ResponseEntity<RestResponse<List<Version>>> getDraftVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getDraftVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version draft nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version draft thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/major")
    @Operation(summary = "Lấy version major", description = "Lấy danh sách version major")
    public ResponseEntity<RestResponse<List<Version>>> getMajorVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getMajorVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version major nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version major thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/minor")
    @Operation(summary = "Lấy version minor", description = "Lấy danh sách version minor")
    public ResponseEntity<RestResponse<List<Version>>> getMinorVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getMinorVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version minor nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version minor thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/patch")
    @Operation(summary = "Lấy version patch", description = "Lấy danh sách version patch")
    public ResponseEntity<RestResponse<List<Version>>> getPatchVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getPatchVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version patch nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version patch thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/hotfix")
    @Operation(summary = "Lấy version hotfix", description = "Lấy danh sách version hotfix")
    public ResponseEntity<RestResponse<List<Version>>> getHotfixVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getHotfixVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            return ResponseBuilder.noContent("Không có version hotfix nào");
        }
        
        return ResponseBuilder.success(versions, "Lấy danh sách version hotfix thành công");
    }

    @PutMapping("/versions/{id}/publish")
    @Operation(summary = "Publish version", description = "Publish version")
    public ResponseEntity<RestResponse<Version>> publishVersion(
            @PathVariable String id,
            @RequestParam String publishedBy) {
        Version version = versionService.publishVersion(id, publishedBy);
        
        return ResponseBuilder.success(version, "Publish version thành công");
    }

    @PutMapping("/versions/{id}/approve")
    @Operation(summary = "Approve version", description = "Approve version")
    public ResponseEntity<RestResponse<Version>> approveVersion(
            @PathVariable String id,
            @RequestParam String approvedBy) {
        Version version = versionService.approveVersion(id, approvedBy);
        
        return ResponseBuilder.success(version, "Approve version thành công");
    }

    @PutMapping("/versions/{id}/mark-current")
    @Operation(summary = "Đánh dấu version hiện tại", description = "Đánh dấu version là current")
    public ResponseEntity<RestResponse<Version>> markVersionAsCurrent(@PathVariable String id) {
        Version version = versionService.markVersionAsCurrent(id);
        
        return ResponseBuilder.success(version, "Đánh dấu version hiện tại thành công");
    }

    @PutMapping("/versions/{id}/unmark-current")
    @Operation(summary = "Bỏ đánh dấu version hiện tại", description = "Bỏ đánh dấu version là current")
    public ResponseEntity<RestResponse<Version>> unmarkVersionAsCurrent(@PathVariable String id) {
        Version version = versionService.unmarkVersionAsCurrent(id);
        
        return ResponseBuilder.success(version, "Bỏ đánh dấu version hiện tại thành công");
    }

    @PutMapping("/versions/{id}/rollback")
    @Operation(summary = "Rollback version", description = "Rollback version")
    public ResponseEntity<RestResponse<Version>> rollbackVersion(
            @PathVariable String id,
            @RequestParam String rollbackReason) {
        Version version = versionService.rollbackVersion(id, rollbackReason);
        
        return ResponseBuilder.success(version, "Rollback version thành công");
    }

    @PutMapping("/versions/{id}/previous-version")
    @Operation(summary = "Cập nhật previous version ID", description = "Cập nhật previous version ID")
    public ResponseEntity<RestResponse<Version>> setPreviousVersionId(
            @PathVariable String id,
            @RequestParam String previousVersionId) {
        Version version = versionService.setPreviousVersionId(id, previousVersionId);
        
        return ResponseBuilder.success(version, "Cập nhật previous version ID thành công");
    }

    @PutMapping("/versions/{id}/file-path")
    @Operation(summary = "Cập nhật file path", description = "Cập nhật file path")
    public ResponseEntity<RestResponse<Version>> setFilePath(
            @PathVariable String id,
            @RequestParam String filePath) {
        Version version = versionService.setFilePath(id, filePath);
        
        return ResponseBuilder.success(version, "Cập nhật file path thành công");
    }

    @PutMapping("/versions/{id}/file-size")
    @Operation(summary = "Cập nhật file size", description = "Cập nhật file size")
    public ResponseEntity<RestResponse<Version>> setFileSize(
            @PathVariable String id,
            @RequestParam Long fileSize) {
        Version version = versionService.setFileSize(id, fileSize);
        
        return ResponseBuilder.success(version, "Cập nhật file size thành công");
    }

    @PutMapping("/versions/{id}/checksum")
    @Operation(summary = "Cập nhật checksum", description = "Cập nhật checksum")
    public ResponseEntity<RestResponse<Version>> setChecksum(
            @PathVariable String id,
            @RequestParam String checksum) {
        Version version = versionService.setChecksum(id, checksum);
        
        return ResponseBuilder.success(version, "Cập nhật checksum thành công");
    }

    @PutMapping("/versions/{id}/approval-required")
    @Operation(summary = "Cập nhật approval required", description = "Cập nhật trạng thái cần approval")
    public ResponseEntity<RestResponse<Version>> setApprovalRequired(
            @PathVariable String id,
            @RequestParam Boolean approvalRequired) {
        Version version = versionService.setApprovalRequired(id, approvalRequired);
        
        return ResponseBuilder.success(version, "Cập nhật approval required thành công");
    }

    @PutMapping("/versions/{id}/tags")
    @Operation(summary = "Cập nhật tags", description = "Cập nhật tags")
    public ResponseEntity<RestResponse<Version>> setTags(
            @PathVariable String id,
            @RequestParam String[] tags) {
        Version version = versionService.setTags(id, tags);
        
        return ResponseBuilder.success(version, "Cập nhật tags thành công");
    }

    @PutMapping("/versions/{id}/detailed-changes")
    @Operation(summary = "Cập nhật detailed changes", description = "Cập nhật detailed changes")
    public ResponseEntity<RestResponse<Version>> setDetailedChanges(
            @PathVariable String id,
            @RequestBody Map<String, Object> detailedChanges) {
        Version version = versionService.setDetailedChanges(id, detailedChanges);
        
        return ResponseBuilder.success(version, "Cập nhật detailed changes thành công");
    }

    @DeleteMapping("/versions/{id}")
    @Operation(summary = "Xóa version", description = "Soft delete version")
    public ResponseEntity<RestResponse<Void>> deleteVersion(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        versionService.deleteVersion(id, deletedBy);
        
        return ResponseBuilder.success(null, "Xóa version thành công");
    }

    @PutMapping("/versions/{id}/restore")
    @Operation(summary = "Khôi phục version", description = "Khôi phục version đã xóa")
    public ResponseEntity<RestResponse<Version>> restoreVersion(@PathVariable String id) {
        Version version = versionService.restoreVersion(id);
        
        return ResponseBuilder.success(version, "Khôi phục version thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/count")
    @Operation(summary = "Đếm số version", description = "Đếm số lượng version")
    public ResponseEntity<RestResponse<Long>> countVersionsByContractId(@PathVariable String contractId) {
        long count = versionService.countVersionsByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số version thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/count-by-change-type")
    @Operation(summary = "Đếm số version theo change type", description = "Đếm số lượng version theo change type")
    public ResponseEntity<RestResponse<Long>> countVersionsByContractIdAndChangeType(
            @PathVariable String contractId,
            @RequestParam Version.ChangeType changeType) {
        long count = versionService.countVersionsByContractIdAndChangeType(contractId, changeType);
        
        return ResponseBuilder.success(count, "Đếm số version theo change type thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/count-by-published")
    @Operation(summary = "Đếm số version theo published status", description = "Đếm số lượng version theo published status")
    public ResponseEntity<RestResponse<Long>> countVersionsByContractIdAndIsPublished(
            @PathVariable String contractId,
            @RequestParam Boolean isPublished) {
        long count = versionService.countVersionsByContractIdAndIsPublished(contractId, isPublished);
        
        return ResponseBuilder.success(count, "Đếm số version theo published status thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/count-by-current")
    @Operation(summary = "Đếm số version theo current status", description = "Đếm số lượng version theo current status")
    public ResponseEntity<RestResponse<Long>> countVersionsByContractIdAndIsCurrent(
            @PathVariable String contractId,
            @RequestParam Boolean isCurrent) {
        long count = versionService.countVersionsByContractIdAndIsCurrent(contractId, isCurrent);
        
        return ResponseBuilder.success(count, "Đếm số version theo current status thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-version-number")
    @Operation(summary = "Kiểm tra tồn tại version number", description = "Kiểm tra version number đã tồn tại chưa")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByContractIdAndVersionNumber(
            @PathVariable String contractId,
            @RequestParam String versionNumber) {
        boolean exists = versionService.existsVersionByContractIdAndVersionNumber(contractId, versionNumber);
        
        return ResponseBuilder.success(exists, "Kiểm tra tồn tại version number thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-current")
    @Operation(summary = "Kiểm tra có version current", description = "Kiểm tra contract có version current không")
    public ResponseEntity<RestResponse<Boolean>> existsCurrentVersionByContractId(@PathVariable String contractId) {
        boolean exists = versionService.existsCurrentVersionByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version current thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-published")
    @Operation(summary = "Kiểm tra có version published", description = "Kiểm tra contract có version published không")
    public ResponseEntity<RestResponse<Boolean>> existsPublishedVersionByContractId(@PathVariable String contractId) {
        boolean exists = versionService.existsPublishedVersionByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version published thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-change-type")
    @Operation(summary = "Kiểm tra có version theo change type", description = "Kiểm tra contract có version theo change type không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByChangeType(
            @PathVariable String contractId,
            @RequestParam Version.ChangeType changeType) {
        boolean exists = versionService.existsVersionByChangeType(contractId, changeType);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo change type thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-tags")
    @Operation(summary = "Kiểm tra có version theo tags", description = "Kiểm tra contract có version theo tags không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByTags(
            @PathVariable String contractId,
            @RequestParam String[] tags) {
        boolean exists = versionService.existsVersionByTags(contractId, tags);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo tags thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-file-path")
    @Operation(summary = "Kiểm tra có version theo file path", description = "Kiểm tra contract có version theo file path không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByFilePath(
            @PathVariable String contractId,
            @RequestParam String filePath) {
        boolean exists = versionService.existsVersionByFilePath(contractId, filePath);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo file path thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-checksum")
    @Operation(summary = "Kiểm tra có version theo checksum", description = "Kiểm tra contract có version theo checksum không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByChecksum(
            @PathVariable String contractId,
            @RequestParam String checksum) {
        boolean exists = versionService.existsVersionByChecksum(contractId, checksum);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo checksum thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-file-size")
    @Operation(summary = "Kiểm tra có version theo file size", description = "Kiểm tra contract có version theo file size không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByFileSize(
            @PathVariable String contractId,
            @RequestParam Long fileSize) {
        boolean exists = versionService.existsVersionByFileSize(contractId, fileSize);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo file size thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-previous-version")
    @Operation(summary = "Kiểm tra có version theo previous version", description = "Kiểm tra contract có version theo previous version không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByPreviousVersionId(
            @PathVariable String contractId,
            @RequestParam String previousVersionId) {
        boolean exists = versionService.existsVersionByPreviousVersionId(contractId, previousVersionId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo previous version thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-published-by")
    @Operation(summary = "Kiểm tra có version theo published by", description = "Kiểm tra contract có version theo published by không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByPublishedBy(
            @PathVariable String contractId,
            @RequestParam String publishedBy) {
        boolean exists = versionService.existsVersionByPublishedBy(contractId, publishedBy);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo published by thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-approved-by")
    @Operation(summary = "Kiểm tra có version theo approved by", description = "Kiểm tra contract có version theo approved by không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByApprovedBy(
            @PathVariable String contractId,
            @RequestParam String approvedBy) {
        boolean exists = versionService.existsVersionByApprovedBy(contractId, approvedBy);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo approved by thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-description")
    @Operation(summary = "Kiểm tra có version theo description", description = "Kiểm tra contract có version theo description chứa từ khóa không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByDescriptionContaining(
            @PathVariable String contractId,
            @RequestParam String keyword) {
        boolean exists = versionService.existsVersionByDescriptionContaining(contractId, keyword);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo description thành công");
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-changes-summary")
    @Operation(summary = "Kiểm tra có version theo changes summary", description = "Kiểm tra contract có version theo changes summary chứa từ khóa không")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByChangesSummaryContaining(
            @PathVariable String contractId,
            @RequestParam String keyword) {
        boolean exists = versionService.existsVersionByChangesSummaryContaining(contractId, keyword);
        
        return ResponseBuilder.success(exists, "Kiểm tra có version theo changes summary thành công");
    }
}
