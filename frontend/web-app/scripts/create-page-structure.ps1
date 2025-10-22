#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Tạo cấu trúc thư mục chuẩn cho một page mới
.DESCRIPTION
    Script này tạo các thư mục _components, _hooks, _types, _constants, _utils
    với .gitkeep files cho một page trong Next.js app directory
.EXAMPLE
    .\create-page-structure.ps1 -GroupName "repositories" -PageName "repositories"
.EXAMPLE
    .\create-page-structure.ps1 -GroupName "dashboard" -PageName "analytics"
#>

param(
    [Parameter(Mandatory=$true, HelpMessage="Tên group (không có dấu ngoặc)")]
    [string]$GroupName,
    
    [Parameter(Mandatory=$true, HelpMessage="Tên page")]
    [string]$PageName
)

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# Base path cho page
$basePath = Join-Path $projectRoot "src\app\($GroupName)\$PageName"

Write-Host "🚀 Creating page structure..." -ForegroundColor Cyan
Write-Host "   Group: $GroupName" -ForegroundColor Gray
Write-Host "   Page: $PageName" -ForegroundColor Gray
Write-Host "   Path: $basePath" -ForegroundColor Gray
Write-Host ""

# Kiểm tra nếu page đã tồn tại
if (Test-Path $basePath) {
    Write-Host "⚠️  Page folder already exists: $basePath" -ForegroundColor Yellow
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "❌ Cancelled" -ForegroundColor Red
        exit 1
    }
} else {
    # Tạo thư mục page
    New-Item -ItemType Directory -Path $basePath -Force | Out-Null
    Write-Host "✅ Created page folder: $PageName" -ForegroundColor Green
}

# Danh sách thư mục cần tạo
$folders = @(
    "_components",
    "_hooks", 
    "_types",
    "_constants",
    "_utils"
)

$created = 0
$skipped = 0

foreach ($folder in $folders) {
    $folderPath = Join-Path $basePath $folder
    
    if (-not (Test-Path $folderPath)) {
        # Tạo thư mục
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
        
        # Tạo .gitkeep với metadata
        $gitkeepPath = Join-Path $folderPath ".gitkeep"
        $gitkeepContent = @"
# Keep this folder in git

**Page**: $PageName
**Group**: $GroupName
**Folder**: $folder

## Usage
- This folder contains ${folder.TrimStart('_')} specific to the **$PageName** page
- DO NOT put shared code here - use _shared/ or src/ instead
- Follow the frontend structure guidelines in src/README.md

---
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@
        $gitkeepContent | Out-File $gitkeepPath -Encoding UTF8
        
        Write-Host "  ✅ $folder/" -ForegroundColor Green
        $created++
    } else {
        Write-Host "  ⏭️  $folder/ (already exists)" -ForegroundColor Yellow
        $skipped++
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Created: $created folders" -ForegroundColor Green
Write-Host "   Skipped: $skipped folders" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ Done! Structure created for ($GroupName)/$PageName" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Create page.tsx in $PageName/" -ForegroundColor Gray
Write-Host "   2. Add components to _components/" -ForegroundColor Gray
Write-Host "   3. Add hooks to _hooks/" -ForegroundColor Gray
Write-Host "   4. Follow guidelines in src/README.md" -ForegroundColor Gray
