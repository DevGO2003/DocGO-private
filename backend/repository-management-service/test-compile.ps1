#!/usr/bin/env pwsh
# Test Maven Compile - Repository Management Service

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Maven Compile" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Set Maven path
$env:PATH = "C:\Program Files\Apache\apache-maven-3.9.11\bin;$env:PATH"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"

Write-Host "Java Version:" -ForegroundColor Yellow
java -version

Write-Host ""
Write-Host "Maven Version:" -ForegroundColor Yellow
mvn -v

Write-Host ""
Write-Host "Starting Maven Clean Compile..." -ForegroundColor Green
Write-Host ""

# Run Maven compile
mvn clean compile

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Compile Completed!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
