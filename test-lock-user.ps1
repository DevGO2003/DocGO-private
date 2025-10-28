# Test lock user functionality
$baseUrl = "http://localhost:8000"

Write-Host "Testing Lock User Feature..." -ForegroundColor Cyan

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

# Get a test user (not admin)
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

Write-Host "Test User: $($testUser.username) (Status: $($testUser.status))" -ForegroundColor Yellow
$testUserId = $testUser.id
$testUsername = $testUser.username

# Step 1: Lock user (SUSPENDED)
Write-Host "`n1. Locking user..." -ForegroundColor Yellow

$lockBody = @{
    status = "SUSPENDED"
} | ConvertTo-Json

try {
    $lockResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/user-management-service/users/$testUserId/status" `
        -Method Put `
        -Headers $headers `
        -Body $lockBody `
        -ContentType "application/json"

    Write-Host "   Status: $($lockResponse.data.status)" -ForegroundColor $(if ($lockResponse.data.status -eq "SUSPENDED") { "Green" } else { "Red" })
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

# Step 2: Try to login as locked user
Write-Host "`n2. Trying to login as locked user..." -ForegroundColor Yellow

$testLoginBody = @{
    username = $testUsername
    password = "@Luan123123"
} | ConvertTo-Json

try {
    $testLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/user-management-service/auth/login" `
        -Method Post `
        -Body $testLoginBody `
        -ContentType "application/json"

    if ($testLoginResponse.success) {
        Write-Host "   BAD! User can still login!" -ForegroundColor Red
        Write-Host "   Token: $($testLoginResponse.data.accessToken.Substring(0, 20))..." -ForegroundColor Red
    } else {
        Write-Host "   GOOD! Login blocked: $($testLoginResponse.message)" -ForegroundColor Green
    }
} catch {
    Write-Host "   GOOD! Login blocked (error)" -ForegroundColor Green
    if ($_.ErrorDetails) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Message: $($errorObj.description)" -ForegroundColor Gray
    }
}

# Step 3: Unlock user
Write-Host "`n3. Unlocking user..." -ForegroundColor Yellow

$unlockBody = @{
    status = "ACTIVE"
} | ConvertTo-Json

try {
    $unlockResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/user-management-service/users/$testUserId/status" `
        -Method Put `
        -Headers $headers `
        -Body $unlockBody `
        -ContentType "application/json"

    Write-Host "   Status: $($unlockResponse.data.status)" -ForegroundColor $(if ($unlockResponse.data.status -eq "ACTIVE") { "Green" } else { "Red" })
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`nDone!" -ForegroundColor Green
