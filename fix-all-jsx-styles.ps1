# Script đơn giản fix style={ } thành style={{ }}
# Pattern: Chỉ thay "style={ " (có space) thành "style={{ "

$sourceDir = "frontend\webapp\src"
$files = Get-ChildItem -Path $sourceDir -Recurse -Include *.tsx,*.ts
$totalFixed = 0
$totalChanges = 0

Write-Host "=== BẮT ĐẦU FIX STYLE ATTRIBUTES ===" -ForegroundColor Cyan
Write-Host "Tổng số files: $($files.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if (-not $content) { continue }
        
        $original = $content
        $changeCount = 0
        
        # Pattern 1: style={ [space] [letter] → style={{ [space] [letter]
        # Example: "style={ color:" → "style={{ color:"
        # Example: "style={ backgroundColor:" → "style={{ backgroundColor:"
        $pattern1 = 'style=\{\s+([a-zA-Z])'
        $replacement1 = 'style={{ $1'
        $content = $content -replace $pattern1, $replacement1
        
        if ($content -ne $original) {
            # Count changes
            $matches = [regex]::Matches($original, $pattern1)
            $changeCount = $matches.Count
            
            # Save file
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            
            $relativePath = $file.FullName.Replace("$PWD\", "")
            Write-Host "✓ $relativePath" -ForegroundColor Green
            Write-Host "  → Fixed $changeCount occurrences" -ForegroundColor DarkGray
            
            $totalFixed++
            $totalChanges += $changeCount
        }
    }
    catch {
        Write-Host "✗ ERROR: $($file.Name)" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor DarkRed
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ HOÀN THÀNH!" -ForegroundColor Green
Write-Host "   Files đã sửa: $totalFixed" -ForegroundColor Yellow
Write-Host "   Tổng số fixes: $totalChanges" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
