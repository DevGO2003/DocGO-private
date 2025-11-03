# Merge duplicate style attributes - CORRECT PATTERN
# Pattern: style={{ ... } style={{ ... }} -> style={{ ..., ... }}

$files = Get-ChildItem -Path "frontend\webapp\src" -Recurse -Include *.tsx,*.ts
$totalFixed = 0
$totalChanges = 0

Write-Host "Merging duplicate style attributes..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if (-not $content) { continue }
        
        $original = $content
        $changeCount = 0
        
        # Pattern 1: style={{ ... } style={{ ... }} (missing one } in first style)
        # Match and merge
        $pattern1 = 'style=\{\{\s*([^}]+?)\s*\}\s+style=\{\{\s*([^}]+?)\s*\}\}'
        while ($content -match $pattern1) {
            $content = $content -replace $pattern1, 'style={{ $1, $2 }}'
            $changeCount++
        }
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            
            $relativePath = $file.FullName.Replace("$PWD\", "")
            Write-Host "Fixed: $relativePath ($changeCount merges)" -ForegroundColor Green
            
            $totalFixed++
            $totalChanges += $changeCount
        }
    }
    catch {
        Write-Host "Error: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DONE! Files fixed: $totalFixed" -ForegroundColor Green
Write-Host "Total merges: $totalChanges" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
