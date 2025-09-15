# Script sửa tất cả ResponseBuilder một lần
Write-Host "🚀 Bắt đầu sửa tất cả ResponseBuilder..." -ForegroundColor Green

# Danh sách các file cần sửa
$files = @(
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/ESignatureController.java",
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/CommentController.java",
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/ApprovalController.java",
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/AuditController.java",
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/VersionController.java"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "`n🔧 Đang xử lý: $file" -ForegroundColor Magenta
        
        $content = Get-Content -Path $file -Raw
        $originalContent = $content
        
        # Xóa import ResponseBuilder
        $content = $content -replace 'import com\.devgo2003\.docgo\.contract_service\.common\.util\.ResponseBuilder;', ''
        
        # Sửa ResponseBuilder.success với List<T>
        $content = $content -replace 'return ResponseBuilder\.success\(([^,]+), "([^"]+)"\);', @'
        RestResponse<List<$1>> response = RestResponse.<List<$1>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("$2.")
            .data($1)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
'@
        
        # Sửa ResponseBuilder.success với Version
        $content = $content -replace 'return ResponseBuilder\.success\(version, "([^"]+)"\);', @'
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("$1.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
'@
        
        # Sửa ResponseBuilder.success với ESignature
        $content = $content -replace 'return ResponseBuilder\.success\(eSignature, "([^"]+)"\);', @'
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("$1.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
'@
        
        # Sửa ResponseBuilder.success với Comment
        $content = $content -replace 'return ResponseBuilder\.success\(comment, "([^"]+)"\);', @'
        RestResponse<Comment> response = RestResponse.<Comment>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("$1.")
            .data(comment)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
'@
        
        # Sửa ResponseBuilder.success với Approval
        $content = $content -replace 'return ResponseBuilder\.success\(approval, "([^"]+)"\);', @'
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("$1.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
'@
        
        # Sửa ResponseBuilder.success với AuditLog
        $content = $content -replace 'return ResponseBuilder\.success\(auditLog, "([^"]+)"\);', @'
        RestResponse<AuditLog> response = RestResponse.<AuditLog>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("$1.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
'@
        
        # Sửa ResponseBuilder.noContent
        $content = $content -replace 'return ResponseBuilder\.noContent\("([^"]+)"\);', @'
        RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("$1.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
'@
        
        # Sửa ResponseBuilder.notFound
        $content = $content -replace 'return ResponseBuilder\.notFound\("([^"]+)"\);', @'
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(404)
            .shortMessage("Not Found")
            .description("$1.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
'@
        
        # Kiểm tra có thay đổi không
        if ($content -ne $originalContent) {
            # Backup file gốc
            $backupPath = $file + ".backup"
            Copy-Item -Path $file -Destination $backupPath
            Write-Host "  💾 Đã backup: $backupPath" -ForegroundColor Blue
            
            # Ghi file mới
            Set-Content -Path $file -Value $content -Encoding UTF8
            Write-Host "  ✅ Đã cập nhật file" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️ Không có thay đổi nào" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ File không tồn tại: $file" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Hoàn thành sửa tất cả ResponseBuilder!" -ForegroundColor Green
