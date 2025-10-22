#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Tạo cấu trúc _shared cho một route group
.DESCRIPTION
    Script này tạo _shared folder với components, hooks, types, utils
    cho code sharing giữa các pages trong cùng một group
.EXAMPLE
    .\create-group-shared.ps1 -GroupName "repositories"
.EXAMPLE
    .\create-group-shared.ps1 -GroupName "dashboard"
#>

param(
    [Parameter(Mandatory=$true, HelpMessage="Tên group (không có dấu ngoặc)")]
    [string]$GroupName
)

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# Base path cho _shared
$sharedPath = Join-Path $projectRoot "src\app\($GroupName)\_shared"

Write-Host "🚀 Creating _shared structure for group..." -ForegroundColor Cyan
Write-Host "   Group: $GroupName" -ForegroundColor Gray
Write-Host "   Path: $sharedPath" -ForegroundColor Gray
Write-Host ""

# Kiểm tra nếu _shared đã tồn tại
if (Test-Path $sharedPath) {
    Write-Host "⚠️  _shared folder already exists: $sharedPath" -ForegroundColor Yellow
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "❌ Cancelled" -ForegroundColor Red
        exit 1
    }
} else {
    # Tạo thư mục _shared
    New-Item -ItemType Directory -Path $sharedPath -Force | Out-Null
    Write-Host "✅ Created _shared folder for ($GroupName)" -ForegroundColor Green
}

# Danh sách thư mục cần tạo
$folders = @(
    "components",
    "hooks",
    "types",
    "utils"
)

$created = 0
$skipped = 0

foreach ($folder in $folders) {
    $folderPath = Join-Path $sharedPath $folder
    
    if (-not (Test-Path $folderPath)) {
        # Tạo thư mục
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
        
        # Tạo .gitkeep với metadata
        $gitkeepPath = Join-Path $folderPath ".gitkeep"
        $gitkeepContent = @"
# Shared $folder for ($GroupName) group

## Usage
This folder contains **$folder** that are shared between multiple pages in the **($GroupName)** group.

### When to use _shared/
- ✅ Code is used by ≥2 pages in this group
- ✅ Code is specific to this group (not used by other groups)
- ❌ DO NOT use for code shared across multiple groups (use src/ instead)

### Examples
**Components**: Shared UI components used by multiple pages
**Hooks**: Shared React hooks for data fetching, state management
**Types**: Shared TypeScript types/interfaces
**Utils**: Shared utility functions

### Migration guideline
If code in _shared/ is used by another group:
1. Move it to src/components/, src/hooks/, or src/lib/utils/
2. Update imports in all pages

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
Write-Host "✨ Done! _shared structure created for ($GroupName)" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Guidelines:" -ForegroundColor Cyan
Write-Host "   - Use _shared/ for code shared between ≥2 pages in this group" -ForegroundColor Gray
Write-Host "   - If used by other groups, move to src/ instead" -ForegroundColor Gray
Write-Host "   - Follow structure guidelines in src/README.md" -ForegroundColor Gray
