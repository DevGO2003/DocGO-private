# Script tổ chức lại cấu trúc web-app

$basePath = "p:\DevGO2003\DocGO-private\frontend\web-app\src\app\(repositories)\repositories"
$sourcePath = "$basePath\[repositoryId]\files"
$targetPath = $basePath

Write-Host "Di chuyen cac thu muc shared..." -ForegroundColor Green

# Di chuyển _components
if (Test-Path "$sourcePath\_components") {
    Write-Host "Moving _components..."
    Move-Item -Path "$sourcePath\_components" -Destination "$targetPath\_components" -Force
}

# Di chuyển _services
if (Test-Path "$sourcePath\_services") {
    Write-Host "Moving _services..."
    Move-Item -Path "$sourcePath\_services" -Destination "$targetPath\_services" -Force
}

# Di chuyển _hooks
if (Test-Path "$sourcePath\_hooks") {
    Write-Host "Moving _hooks..."
    Move-Item -Path "$sourcePath\_hooks" -Destination "$targetPath\_hooks" -Force
}

# Di chuyển _types
if (Test-Path "$sourcePath\_types") {
    Write-Host "Moving _types..."
    Move-Item -Path "$sourcePath\_types" -Destination "$targetPath\_types" -Force
}

# Di chuyển _constants
if (Test-Path "$sourcePath\_constants") {
    Write-Host "Moving _constants..."
    Move-Item -Path "$sourcePath\_constants" -Destination "$targetPath\_constants" -Force
}

Write-Host "Hoan thanh!" -ForegroundColor Green
Write-Host "Cac thu muc da duoc di chuyen len $targetPath" -ForegroundColor Cyan
