# Test users API
$baseUrl = "http://localhost:8000"

Write-Host "Testing Users API..." -ForegroundColor Cyan

# Login
$loginBody = @{
    username = "truongluan2"
    password = "@Luan123123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/user-management-service/auth/login" `
    -Method Post `
    -Body $loginBody `
    -ContentType "application/json"

$accessToken = $loginResponse.data.accessToken

Write-Host "Logged in as: $($loginResponse.data.user.username) (Role: $($loginResponse.data.user.role))`n" -ForegroundColor Green

# Get users
$headers = @{
    "Authorization" = "Bearer $accessToken"
}

Write-Host "Fetching users..." -ForegroundColor Yellow

try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/user-management-service/users?limit=10" `
        -Method Get `
        -Headers $headers

    Write-Host "`nFull Response:" -ForegroundColor Cyan
    $usersResponse | ConvertTo-Json -Depth 5 | Write-Host

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "`nError Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | Write-Host
    }
}
