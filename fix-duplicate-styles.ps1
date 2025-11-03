# Merge duplicate style attributes
# Pattern: style={{ ... }} style={{ ... }} -> style={{ ..., ... }}

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
        
        # Pattern: style={{ prop1: val1 }} style={{ prop2: val2 }}
        # This regex captures two consecutive style attributes and merges them
        $pattern = 'style=\{\{\s*([^}]+?)\s*\}\}\s+style=\{\{\s*([^}]+?)\s*\}\}'
        
        while ($content -match $pattern) {
            $content = $content -replace $pattern, 'style={{ $1, $2 }}'
        }
        
        if ($content -ne $original) {
            $matchCount = 0
            $temp = $original
            while ($temp -match $pattern) {
                $matchCount++
                $temp = $temp -replace $pattern, 'style={{ $1, $2 }}' -replace $pattern, '', 1
            }
            
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            
            $relativePath = $file.FullName.Replace("$PWD\", "")
            Write-Host "Fixed: $relativePath ($matchCount merges)" -ForegroundColor Green
            
            $totalFixed++
            $totalChanges += $matchCount
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
