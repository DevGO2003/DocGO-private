$files = @(
    'frontend\webapp\src\shared\layouts\MainLayout\ControlMainLayout.tsx',
    'frontend\webapp\src\shared\layouts\MainLayout\MainLayout.tsx',
    'frontend\webapp\src\shared\layouts\MainLayout\Sidebar.tsx',
    'frontend\webapp\src\shared\layouts\MainLayout\Header.tsx',
    'frontend\webapp\src\shared\layouts\HeaderLayouts\BaseHeaderLayout\BaseHeaderLayout.tsx'
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    $original = $content
    
    # Fix style={ to style={{
    $content = $content -replace 'style=\{ ', 'style={{ '
    
    # Fix closing } style={{ to , 
    $content = $content -replace '\} style=\{\{ ', ', '
    
    if ($content -ne $original) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "✓ Fixed: $file" -ForegroundColor Green
    } else {
        Write-Host "- No changes: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
