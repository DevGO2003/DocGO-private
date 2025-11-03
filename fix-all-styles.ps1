# Fix all style={ patterns in TSX files

$files = Get-ChildItem -Path "frontend\webapp\src" -Recurse -Include *.tsx,*.ts

$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $original = $content
    
    # Fix style={ borderColor: to style={{ borderColor:
    $content = $content -replace "style=\{\s*borderColor:", "style={{ borderColor:"
    
    # Fix style={ backgroundColor: to style={{ backgroundColor:
    $content = $content -replace "style=\{\s*backgroundColor:", "style={{ backgroundColor:"
    
    # Fix style={ color: to style={{ color:
    $content = $content -replace "style=\{\s*color:", "style={{ color:"
    
    # Fix style={ width: to style={{ width:
    $content = $content -replace "style=\{\s*width:", "style={{ width:"
    
    # Fix style={ height: to style={{ height:
    $content = $content -replace "style=\{\s*height:", "style={{ height:"
    
    # Fix style={ fontSize: to style={{ fontSize:
    $content = $content -replace "style=\{\s*fontSize:", "style={{ fontSize:"
    
    # Fix style={ fontFamily: to style={{ fontFamily:
    $content = $content -replace "style=\{\s*fontFamily:", "style={{ fontFamily:"
    
    # Fix style={ padding: to style={{ padding:
    $content = $content -replace "style=\{\s*padding:", "style={{ padding:"
    
    # Fix style={ margin: to style={{ margin:
    $content = $content -replace "style=\{\s*margin:", "style={{ margin:"
    
    # Fix style={ transform: to style={{ transform:
    $content = $content -replace "style=\{\s*transform:", "style={{ transform:"
    
    # Fix style={ opacity: to style={{ opacity:
    $content = $content -replace "style=\{\s*opacity:", "style={{ opacity:"
    
    # Fix style={ boxShadow: to style{{ boxShadow:
    $content = $content -replace "style=\{\s*boxShadow:", "style={{ boxShadow:"
    
    # Fix style={ borderRadius: to style={{ borderRadius:
    $content = $content -replace "style=\{\s*borderRadius:", "style={{ borderRadius:"
    
    # Merge duplicate style attributes: } style={{ -> ,
    $content = $content -replace "\}\s+style=\{\{", ", "
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
        $totalFixed++
    }
}

Write-Host "`nTotal files fixed: $totalFixed" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
