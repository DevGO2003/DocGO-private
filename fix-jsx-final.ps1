# Fix JSX style={ to style={{

$files = Get-ChildItem -Path "frontend\webapp\src" -Recurse -Include *.tsx,*.ts
$totalFixed = 0
$totalChanges = 0

Write-Host "Starting JSX style fix..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if (-not $content) { continue }
        
        $original = $content
        
        # Fix: style={ [letter] -> style={{ [letter]
        $pattern = 'style=\{\s+([a-zA-Z])'
        $replacement = 'style={{ $1'
        $content = $content -replace $pattern, $replacement
        
        if ($content -ne $original) {
            $matches = [regex]::Matches($original, $pattern)
            $count = $matches.Count
            
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            
            $relativePath = $file.FullName.Replace("$PWD\", "")
            Write-Host "Fixed: $relativePath ($count changes)" -ForegroundColor Green
            
            $totalFixed++
            $totalChanges += $count
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
