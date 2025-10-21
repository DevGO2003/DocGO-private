$source = "P:\DevGO2003\DocGO-private\frontend\web-app\src\app\(repositories)\repositories\[repositoryId]\files"
$target = "P:\DevGO2003\DocGO-private\frontend\web-app\src\app\(repositories)\repositories"

Write-Host "Moving folders from $source to $target" -ForegroundColor Yellow

$folders = @("_components", "_services", "_hooks", "_types", "_constants")

foreach ($folder in $folders) {
    $src = Join-Path $source $folder
    $dst = Join-Path $target $folder
    
    if (Test-Path $src) {
        Write-Host "Moving $folder..." -ForegroundColor Green
        if (Test-Path $dst) {
            Remove-Item $dst -Recurse -Force
        }
        Move-Item $src $dst -Force
        Write-Host "  -> Done" -ForegroundColor Cyan
    } else {
        Write-Host "  -> $folder not found, skipping" -ForegroundColor Gray
    }
}

Write-Host "`nCompleted!" -ForegroundColor Green
