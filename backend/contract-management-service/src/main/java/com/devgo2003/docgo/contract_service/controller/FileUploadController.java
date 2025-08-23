package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import com.devgo2003.docgo.contract_service.common.util.ResponseBuilder;
import com.devgo2003.docgo.contract_service.model.FileUploadRequest;
import com.devgo2003.docgo.contract_service.model.FileUploadResponse;
import com.devgo2003.docgo.contract_service.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/contract-management-service/files")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Upload", description = "API quản lý upload file và xử lý hợp đồng")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload file và xử lý hợp đồng",
        description = "Upload file và tự động phát hiện, xử lý hợp đồng bằng AI"
    )
    public ResponseEntity<RestResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "isContract", defaultValue = "false") Boolean isContract) {
        
        try {
            log.info("Nhận yêu cầu upload file: {}, isContract: {}", file.getOriginalFilename(), isContract);
            
            FileUploadRequest request = new FileUploadRequest();
            request.setFile(file);
            request.setDescription(description);
            request.setTags(tags);
            request.setIsContract(isContract);
            
            FileUploadResponse response = fileUploadService.uploadFile(request);
            
            return ResponseEntity.ok(ResponseBuilder.success(response, "Success", "File đã được upload thành công"));
            
        } catch (Exception e) {
            log.error("Lỗi khi upload file: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ResponseBuilder.error(400, "Bad Request", "Lỗi khi upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/{fileId}/status")
    @Operation(
        summary = "Kiểm tra trạng thái xử lý file",
        description = "Lấy thông tin trạng thái xử lý file và hợp đồng"
    )
    public ResponseEntity<RestResponse<FileUploadResponse>> getFileStatus(@PathVariable Long fileId) {
        try {
            // TODO: Implement get file status
            return ResponseEntity.ok(ResponseBuilder.success(null, "Success", "API đang được phát triển"));
        } catch (Exception e) {
            log.error("Lỗi khi lấy trạng thái file: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ResponseBuilder.error(400, "Bad Request", "Lỗi khi lấy trạng thái file: " + e.getMessage()));
        }
    }
}
