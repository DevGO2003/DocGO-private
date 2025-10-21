$fileId = "9589f945"

Write-Host "=== CHECKING TRANSFORM CODE ===" -ForegroundColor Cyan

Write-Host "`n1. File processing logs:" -ForegroundColor Yellow
docker-compose logs automation-service --since 3m 2>&1 | Where-Object { $_ -match $fileId }

Write-Host "`n2. Contract metadata preparation:" -ForegroundColor Yellow
docker-compose logs automation-service --since 3m 2>&1 | Where-Object { $_ -match "contract.summary.generated" } | Select-Object -Last 5

Write-Host "`n3. Check response data structure:" -ForegroundColor Yellow
$fileId = "9589f945-b182-4079-9125-635304f9385e"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Start-Sleep -Seconds 30
Write-Host "Waiting for Kafka processing..." -ForegroundColor Cyan

$response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction SilentlyContinue
if ($response) {
    Write-Host "`nParties structure:" -ForegroundColor Green
    if ($response.data.contract.parties) {
        $response.data.contract.parties[0] | ConvertTo-Json -Depth 3
    } else {
        Write-Host "NO PARTIES DATA!" -ForegroundColor Red
    }
}
