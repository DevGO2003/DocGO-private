# Script tự động chuẩn hóa ResponseBuilder sang RestResponse<T>
# Sử dụng: .\script\standardize-response-builder.ps1

param(
    [string]$ServicePath = "backend/contract-management-service",
    [switch]$DryRun = $false
)

Write-Host "🚀 Bắt đầu chuẩn hóa ResponseBuilder sang RestResponse<T>" -ForegroundColor Green
Write-Host "📁 Service Path: $ServicePath" -ForegroundColor Yellow
Write-Host "🔍 Dry Run: $DryRun" -ForegroundColor Yellow

# Tìm tất cả file Controller
$controllerFiles = Get-ChildItem -Path $ServicePath -Recurse -Filter "*Controller.java" | Where-Object { $_.FullName -like "*controller*" }

Write-Host "📋 Tìm thấy $($controllerFiles.Count) Controller files:" -ForegroundColor Cyan
foreach ($file in $controllerFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor White
}

# Pattern replacements
$replacements = @{
    # Xóa import ResponseBuilder
    'import com\.devgo2003\.docgo\.contract_service\.common\.util\.ResponseBuilder;' = ''
    
    # ResponseBuilder.success với List<T>
    'return ResponseBuilder\.success\(([^,]+), "([^"]+)"\);' = @'
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
    
    # ResponseBuilder.success với Version
    'return ResponseBuilder\.success\(version, "([^"]+)"\);' = @'
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
    
    # ResponseBuilder.success với Map<String, Object>
    'return ResponseBuilder\.success\(report, "([^"]+)"\);' = @'
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
    
    # ResponseBuilder.noContent
    'return ResponseBuilder\.noContent\("([^"]+)"\);' = @'
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
    
    # ResponseBuilder.notFound
    'return ResponseBuilder\.notFound\("([^"]+)"\);' = @'
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
}

# Xử lý từng file
foreach ($file in $controllerFiles) {
    Write-Host "`n🔧 Đang xử lý: $($file.Name)" -ForegroundColor Magenta
    
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $changesCount = 0
    
    # Áp dụng các replacements
    foreach ($pattern in $replacements.Keys) {
        $replacement = $replacements[$pattern]
        $newContent = $content -replace $pattern, $replacement
        if ($newContent -ne $content) {
            $matches = [regex]::Matches($content, $pattern)
            $changesCount += $matches.Count
            $content = $newContent
            Write-Host "  ✅ Đã thay thế $($matches.Count) pattern: $pattern" -ForegroundColor Green
        }
    }
    
    if ($changesCount -gt 0) {
        Write-Host "  📊 Tổng cộng: $changesCount thay đổi" -ForegroundColor Yellow
        
        if (-not $DryRun) {
            # Backup file gốc
            $backupPath = $file.FullName + ".backup"
            Copy-Item -Path $file.FullName -Destination $backupPath
            Write-Host "  💾 Đã backup: $backupPath" -ForegroundColor Blue
            
            # Ghi file mới
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "  ✅ Đã cập nhật file" -ForegroundColor Green
        } else {
            Write-Host "  🔍 Dry Run - Không thay đổi file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ℹ️ Không có thay đổi nào" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Hoàn thành chuẩn hóa ResponseBuilder!" -ForegroundColor Green
Write-Host "📝 Lưu ý: Kiểm tra lại các file đã được sửa và test compile" -ForegroundColor Yellow
