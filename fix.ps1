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
    
    $content = $content -replace 'style=\{ ', 'style={{ '
    $content = $content -replace '\} style=\{\{ ', ', '
    
    if ($content -ne $original) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "Done"
