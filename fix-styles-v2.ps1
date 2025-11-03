# Fix style={ to style={{ (only single brace)
# This script is more careful to avoid breaking already-correct code

$files = Get-ChildItem -Path "frontend\webapp\src" -Recurse -Include *.tsx,*.ts
$totalFixed = 0
$totalChanges = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $original = $content
    $changes = 0
    
    # Only fix style={ followed by a property name (not already style={{)
    # Pattern: style={ [property]: where property starts with a letter
    if ($content -match 'style=\{\s+[a-zA-Z]') {
        $content = $content -replace 'style=\{\s+([a-zA-Z])', 'style={{ $1'
        $changes++
    }
    
    # Merge duplicate style attributes: } style={{ -> ,
    $beforeMerge = $content
    $content = $content -replace '\}\s+style=\{\{', ', '
    if ($content -ne $beforeMerge) {
        $changes++
    }
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name) ($changes changes)" -ForegroundColor Green
        $totalFixed++
        $totalChanges += $changes
    }
}

Write-Host "`nTotal files fixed: $totalFixed" -ForegroundColor Cyan
Write-Host "Total changes: $totalChanges" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
