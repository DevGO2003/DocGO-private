# SCRIPT CẨN THẬN - Chỉ fix pattern rõ ràng
# Pattern: style={ property: -> style={{ property:
# KHÔNG động vào: style={{, onClick={, className={, v.v.

$files = Get-ChildItem -Path "frontend\webapp\src" -Recurse -Include *.tsx
$totalFixed = 0

Write-Host "Starting SAFE style fix..." -ForegroundColor Yellow
Write-Host "Pattern: style={ [letter] -> style={{ [letter]" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        if (-not $content) { continue }
        
        $original = $content
        
        # ONLY fix: style={ followed by letter/space and letter
        # Example: style={ backgroundColor: -> style={{ backgroundColor:
        # Example: style={ borderColor: -> style={{ borderColor:
        $pattern = 'style=\{\s+([a-zA-Z])'
        $replacement = 'style={{ $1'
        
        $content = $content -replace $pattern, $replacement
        
        if ($content -ne $original) {
            # Count how many fixes
            $matches = [regex]::Matches($original, $pattern)
            $count = $matches.Count
            
            # Write back
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            Write-Host "✓ $($file.Name) - Fixed $count occurrences" -ForegroundColor Green
            $totalFixed++
        }
    }
    catch {
        Write-Host "✗ Error: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Total files fixed: $totalFixed" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Run docker-compose restart webapp" -ForegroundColor Yellow
