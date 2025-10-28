# Test update user API
$baseUrl = "http://localhost:8000"

Write-Host "Testing Update User API..." -ForegroundColor Cyan

# Login as admin
$loginBody = @{
    username = "truongluan2"
    password = "@Luan123123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/user-management-service/auth/login" `
    -Method Post `
    -Body $loginBody `
    -ContentType "application/json"

$accessToken = $loginResponse.data.accessToken
Write-Host "Logged in as ADMIN`n" -ForegroundColor Green

# Get a test user
$headers = @{
    "Authorization" = "Bearer $accessToken"
}

$usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/user-management-service/users?limit=5" `
    -Method Get `
    -Headers $headers

$testUser = $usersResponse.data.content | Where-Object { $_.username -ne "truongluan2" } | Select-Object -First 1

if (!$testUser) {
    Write-Host "No test user found!" -ForegroundColor Red
    exit 1
}

Write-Host "Test User: $($testUser.username)" -ForegroundColor Yellow
Write-Host "  Current Name: $($testUser.firstName) $($testUser.lastName)" -ForegroundColor Gray
Write-Host "  Current Email: $($testUser.email)" -ForegroundColor Gray
Write-Host "  Current Phone: $($testUser.phone)`n" -ForegroundColor Gray

# Update user info
Write-Host "Updating user info..." -ForegroundColor Yellow

$updateBody = @{
    firstName = "Updated First"
    lastName = "Updated Last"
    email = $testUser.email
    phone = "+84123456789"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/user-management-service/users/$($testUser.id)" `
        -Method Put `
        -Headers $headers `
        -Body $updateBody `
        -ContentType "application/json"

    Write-Host "`nSUCCESS! Updated user info:" -ForegroundColor Green
    Write-Host "  New Name: $($updateResponse.data.firstName) $($updateResponse.data.lastName)" -ForegroundColor Cyan
    Write-Host "  New Email: $($updateResponse.data.email)" -ForegroundColor Cyan
    Write-Host "  New Phone: $($updateResponse.data.phone)" -ForegroundColor Cyan

} catch {
    Write-Host "`nFAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`nDone!" -ForegroundColor Green
