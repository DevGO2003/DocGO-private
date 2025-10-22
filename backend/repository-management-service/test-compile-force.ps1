#!/usr/bin/env pwsh
# Force Clean Maven Compile - Repository Management Service

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Force Clean Maven Compile" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Set Maven path
$env:PATH = "C:\Program Files\Apache\apache-maven-3.9.11\bin;$env:PATH"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"

Write-Host "Step 1: Remove target directory..." -ForegroundColor Yellow
if (Test-Path "target") {
    Remove-Item -Path "target" -Recurse -Force
    Write-Host "✓ Target directory removed" -ForegroundColor Green
} else {
    Write-Host "✓ Target directory not found (OK)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Maven Clean..." -ForegroundColor Yellow
mvn clean -q

Write-Host ""
Write-Host "Step 3: Maven Compile (with Lombok processor)..." -ForegroundColor Yellow
Write-Host ""

# Run Maven compile with verbose Lombok
mvn compile -X 2>&1 | Select-String -Pattern "lombok|builder|Compiling|error|ERROR" -Context 0,2

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Checking Results..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

if (Test-Path "target/classes/com/devgo2003/docgo/repository_service/dto/ContentDto.class") {
    Write-Host "✓ ContentDto compiled successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ ContentDto compilation failed!" -ForegroundColor Red
}

if (Test-Path "target/classes/com/devgo2003/docgo/repository_service/dto/AuditDto.class") {
    Write-Host "✓ AuditDto compiled successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ AuditDto compilation failed!" -ForegroundColor Red
}

Write-Host ""
