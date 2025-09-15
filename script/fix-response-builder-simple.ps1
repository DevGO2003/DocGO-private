# Script đơn giản để sửa ResponseBuilder
# Sử dụng: .\script\fix-response-builder-simple.ps1

Write-Host "🚀 Bắt đầu sửa ResponseBuilder..." -ForegroundColor Green

# Tìm tất cả file Controller
$controllerFiles = Get-ChildItem -Path "backend/contract-management-service" -Recurse -Filter "*Controller.java" | Where-Object { $_.FullName -like "*controller*" }

foreach ($file in $controllerFiles) {
    Write-Host "`n🔧 Đang xử lý: $($file.Name)" -ForegroundColor Magenta
    
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Xóa import ResponseBuilder
    $content = $content -replace 'import com\.devgo2003\.docgo\.contract_service\.common\.util\.ResponseBuilder;', ''
    
    # Sửa ResponseBuilder.success với List<Version>
    $content = $content -replace 'return ResponseBuilder\.success\(versions, "([^"]+)"\);', @'
        RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("$1.")
            .data(versions)
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
    
    # Sửa ResponseBuilder.success với Map<String, Object>
    $content = $content -replace 'return ResponseBuilder\.success\(report, "([^"]+)"\);', @'
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("$1.")
            .data(report)
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
        $backupPath = $file.FullName + ".backup"
        Copy-Item -Path $file.FullName -Destination $backupPath
        Write-Host "  💾 Đã backup: $backupPath" -ForegroundColor Blue
        
        # Ghi file mới
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "  ✅ Đã cập nhật file" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️ Không có thay đổi nào" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Hoàn thành sửa ResponseBuilder!" -ForegroundColor Green
