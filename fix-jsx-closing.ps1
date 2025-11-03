# Fix JSX style closing braces: } /> -> }} />

$files = Get-ChildItem -Path "frontend\webapp\src" -Recurse -Include *.tsx,*.ts
$totalFixed = 0
$totalChanges = 0

Write-Host "Fixing JSX style closing braces..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if (-not $content) { continue }
        
        $original = $content
        
        # Fix: style={{ ... } [space or /> or >] -> style={{ ... }} [space or /> or >]
        # Match: } followed by space/> but NOT already }}
        $pattern = '(style=\{\{[^}]+)\}\s*([/>])'
        $replacement = '$1}} $2'
        $content = $content -replace $pattern, $replacement
        
        if ($content -ne $original) {
            $matchCount = ([regex]::Matches($original, $pattern)).Count
            
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            
            $relativePath = $file.FullName.Replace("$PWD\", "")
            Write-Host "Fixed: $relativePath ($matchCount changes)" -ForegroundColor Green
            
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
Write-Host "Total changes: $totalChanges" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
