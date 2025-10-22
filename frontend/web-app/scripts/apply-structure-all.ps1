#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Áp dụng cấu trúc chuẩn cho TẤT CẢ pages và groups hiện có
.DESCRIPTION
    Script này sẽ:
    1. Tạo _shared cho tất cả route groups
    2. Tạo _folders chuẩn cho tất cả pages
.EXAMPLE
    .\apply-structure-all.ps1
.EXAMPLE
    .\apply-structure-all.ps1 -DryRun
#>

param(
    [switch]$DryRun = $false
)

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

Write-Host "🚀 Applying standard structure to all pages and groups..." -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Danh sách các route groups và pages
$structure = @{
    "repositories" = @("repositories")
    "dashboard" = @("dashboard")
    "auth" = @("auth")
    "settings" = @("settings")
    "analytics" = @("analytics")
    "communications" = @("communications")
    "workflow" = @("workflow")
    "support" = @("support")
    "users" = @("users")
    "integrations" = @("integrations")
    "development" = @("development")
}

$totalGroups = 0
$totalPages = 0

Write-Host "📋 Plan:" -ForegroundColor Cyan
Write-Host ""

foreach ($group in $structure.Keys) {
    Write-Host "  ($group)/" -ForegroundColor Magenta
    Write-Host "    ├── _shared/" -ForegroundColor Gray
    
    $pages = $structure[$group]
    foreach ($page in $pages) {
        Write-Host "    └── $page/" -ForegroundColor Gray
        $totalPages++
    }
    Write-Host ""
    $totalGroups++
}

Write-Host "Total: $totalGroups groups, $totalPages pages" -ForegroundColor Gray
Write-Host ""

if ($DryRun) {
    Write-Host "✅ Dry run complete - no changes made" -ForegroundColor Green
    exit 0
}

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Executing..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Tạo _shared cho tất cả groups
Write-Host "📁 Creating _shared folders..." -ForegroundColor Yellow
foreach ($group in $structure.Keys) {
    Write-Host "  Processing ($group)..." -ForegroundColor Gray
    & "$scriptPath\create-group-shared.ps1" -GroupName $group
    Write-Host ""
}

# Step 2: Tạo _folders cho tất cả pages
Write-Host "📄 Creating page structures..." -ForegroundColor Yellow
foreach ($group in $structure.Keys) {
    $pages = $structure[$group]
    foreach ($page in $pages) {
        Write-Host "  Processing ($group)/$page..." -ForegroundColor Gray
        & "$scriptPath\create-page-structure.ps1" -GroupName $group -PageName $page
        Write-Host ""
    }
}

Write-Host ""
Write-Host "✨ All done!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   - Created _shared for $totalGroups groups" -ForegroundColor Green
Write-Host "   - Created structure for $totalPages pages" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review generated .gitkeep files" -ForegroundColor Gray
Write-Host "   2. Move existing code to appropriate folders" -ForegroundColor Gray
Write-Host "   3. Update imports in pages" -ForegroundColor Gray
Write-Host "   4. Follow guidelines in src/README.md" -ForegroundColor Gray
Write-Host "   5. Commit changes to git" -ForegroundColor Gray
