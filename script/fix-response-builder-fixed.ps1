# Script đơn giản để sửa ResponseBuilder
# Sử dụng: .\script\fix-response-builder-fixed.ps1

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
    $pattern1 = 'return ResponseBuilder\.success\(versions, "([^"]+)"\);'
    $replacement1 = @"
        RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("`$1.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
"@
    $content = $content -replace $pattern1, $replacement1
    
    # Sửa ResponseBuilder.success với Version
    $pattern2 = 'return ResponseBuilder\.success\(version, "([^"]+)"\);'
    $replacement2 = @"
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("`$1.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
"@
    $content = $content -replace $pattern2, $replacement2
    
    # Sửa ResponseBuilder.success với Map<String, Object>
    $pattern3 = 'return ResponseBuilder\.success\(report, "([^"]+)"\);'
    $replacement3 = @"
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("`$1.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
"@
    $content = $content -replace $pattern3, $replacement3
    
    # Sửa ResponseBuilder.noContent
    $pattern4 = 'return ResponseBuilder\.noContent\("([^"]+)"\);'
    $replacement4 = @"
        RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("`$1.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
"@
    $content = $content -replace $pattern4, $replacement4
    
    # Sửa ResponseBuilder.notFound
    $pattern5 = 'return ResponseBuilder\.notFound\("([^"]+)"\);'
    $replacement5 = @"
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(404)
            .shortMessage("Not Found")
            .description("`$1.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
"@
    $content = $content -replace $pattern5, $replacement5
    
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
