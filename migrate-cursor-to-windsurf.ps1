# Migration Script: .cursor -> .windsurf
# Copy entire .cursor structure to .windsurf, renaming commands -> workflows

$cursorDir = "P:\DevGO2003\DocGO-private\.cursor"
$windsurfDir = "P:\DevGO2003\DocGO-private\.windsurf"

Write-Host "=== Migration: .cursor -> .windsurf ===" -ForegroundColor Cyan
Write-Host "Source: $cursorDir" -ForegroundColor Gray
Write-Host "Target: $windsurfDir" -ForegroundColor Gray
Write-Host ""

# Ensure windsurf directory exists
if (-not (Test-Path $windsurfDir)) {
    New-Item -ItemType Directory -Path $windsurfDir -Force | Out-Null
}

$totalCopied = 0
$totalSkipped = 0
$errors = 0

# Get all items in .cursor (directories and files)
$cursorItems = Get-ChildItem -Path $cursorDir -Force

foreach ($item in $cursorItems) {
    try {
        $itemName = $item.Name
        
        # Rename 'commands' to 'workflows'
        $targetName = if ($itemName -eq "commands") { "workflows" } else { $itemName }
        
        $sourcePath = $item.FullName
        $targetPath = Join-Path $windsurfDir $targetName
        
        Write-Host "Processing: $itemName" -ForegroundColor White
        
        if ($item.PSIsContainer) {
            # It's a directory
            if (Test-Path $targetPath) {
                Write-Host "  ⚠️  Directory exists, skipping: $targetName" -ForegroundColor Yellow
                $totalSkipped++
            } else {
                # Copy directory recursively
                Copy-Item -Path $sourcePath -Destination $targetPath -Recurse -Force
                Write-Host "  ✅ Copied directory: $targetName" -ForegroundColor Green
                $totalCopied++
                
                # Special handling for commands -> workflows: Add YAML frontmatter to .md files
                if ($itemName -eq "commands") {
                    Write-Host "  🔄 Converting commands to workflows format..." -ForegroundColor Cyan
                    $mdFiles = Get-ChildItem -Path $targetPath -Filter "*.md" -File
                    $converted = 0
                    foreach ($mdFile in $mdFiles) {
                        try {
                            $content = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
                            
                            # Only add frontmatter if it doesn't exist
                            if ($content -notmatch "^---\s*\n") {
                                # Extract description from first heading
                                $description = ""
                                if ($content -match "^#\s+(.+)") {
                                    $description = $matches[1].Trim()
                                } else {
                                    $description = $mdFile.BaseName
                                }
                                
                                $newContent = @"
---
description: $description
---

$content
"@
                                Set-Content -Path $mdFile.FullName -Value $newContent -Encoding UTF8 -NoNewline
                                $converted++
                            }
                        } catch {
                            Write-Host "    ⚠️  Failed to convert: $($mdFile.Name)" -ForegroundColor Yellow
                        }
                    }
                    Write-Host "    ✅ Converted $converted workflow files" -ForegroundColor Green
                }
            }
        } else {
            # It's a file
            if (Test-Path $targetPath) {
                Write-Host "  ⚠️  File exists, skipping: $targetName" -ForegroundColor Yellow
                $totalSkipped++
            } else {
                Copy-Item -Path $sourcePath -Destination $targetPath -Force
                Write-Host "  ✅ Copied file: $targetName" -ForegroundColor Green
                $totalCopied++
            }
        }
        
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Cyan
Write-Host "✅ Copied: $totalCopied items" -ForegroundColor Green
Write-Host "⚠️  Skipped: $totalSkipped items (already exist)" -ForegroundColor Yellow
Write-Host "❌ Errors: $errors" -ForegroundColor Red
Write-Host ""

# Summary of .windsurf structure
Write-Host "=== .windsurf Directory Structure ===" -ForegroundColor Cyan
$windsurfItems = Get-ChildItem -Path $windsurfDir -Force
foreach ($item in $windsurfItems) {
    if ($item.PSIsContainer) {
        $count = (Get-ChildItem -Path $item.FullName -Recurse -File).Count
        Write-Host "  📁 $($item.Name)/ ($count files)" -ForegroundColor Yellow
    } else {
        $size = [math]::Round($item.Length / 1KB, 2)
        Write-Host "  📄 $($item.Name) ($size KB)" -ForegroundColor Gray
    }
}
