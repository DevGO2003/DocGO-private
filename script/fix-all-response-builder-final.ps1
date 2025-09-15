# Script để sửa tất cả ResponseBuilder thành RestResponse
$controllers = @(
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/VersionController.java",
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/AuditController.java",
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/ApprovalController.java",
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/CommentController.java",
    "backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/controller/ESignatureController.java"
)

foreach ($file in $controllers) {
    Write-Host "Processing $file..."
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Sửa ResponseBuilder.success cho List<T>
        $content = $content -replace 'return ResponseBuilder\.success\(([^,]+),\s*"([^"]+)"\);', @'
        RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
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
        
        # Sửa ResponseBuilder.success cho T
        $content = $content -replace 'return ResponseBuilder\.success\(([^,]+),\s*"([^"]+)"\);', @'
        RestResponse<Version> response = RestResponse.<Version>builder()
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
        
        Set-Content $file $content -Encoding UTF8
        Write-Host "Updated $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "All files processed!"
