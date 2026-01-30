# Quick Test Script for Email Verification

# Test Configuration
$baseUrl = "http://localhost:5000"
$testEmail = "test-" + (Get-Date -Format "MMddHHmmss") + "@example.com"
$testUsername = "testuser" + (Get-Date -Format "HHmmss")
$testPassword = "password123"

Write-Host "`n=== EMAIL VERIFICATION FLOW TEST ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "Test User: $testUsername" -ForegroundColor Gray
Write-Host "Test Email: $testEmail`n" -ForegroundColor Gray

# Step 1: Register User
Write-Host "[1/4] Registering user..." -ForegroundColor Yellow

$registerBody = @{
    username = $testUsername
    email    = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $registerRes = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $registerData = $registerRes.Content | ConvertFrom-Json
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "  Message: $($registerData.message)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Registration failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Prompt for verification token
Write-Host "`n[2/4] Email verification" -ForegroundColor Yellow
Write-Host "Check server console for verification token (6 digits)" -ForegroundColor Gray
$token = Read-Host "Enter verification token from email/console"

# Step 3: Verify Email
Write-Host "`n[3/4] Verifying email with token: $token..." -ForegroundColor Yellow

try {
    $verifyRes = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/verify-email/$token" `
        -Method GET `
        -UseBasicParsing

    $verifyData = $verifyRes.Content | ConvertFrom-Json
    Write-Host "✓ Email verified successfully!" -ForegroundColor Green
    Write-Host "  Message: $($verifyData.message)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Verification failed!" -ForegroundColor Red
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error: $($errorBody.message)" -ForegroundColor Red
    exit 1
}

# Step 4: Login
Write-Host "`n[4/4] Testing login..." -ForegroundColor Yellow

$loginBody = @{
    username = $testUsername
    password = $testPassword
} | ConvertTo-Json

try {
    $loginRes = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $loginData = $loginRes.Content | ConvertFrom-Json
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Username: $($loginData.user.username)" -ForegroundColor Gray
    Write-Host "  Email: $($loginData.user.email)" -ForegroundColor Gray
    Write-Host "  Token: $($loginData.token.Substring(0,20))..." -ForegroundColor Gray
}
catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error: $($errorBody.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== ALL TESTS PASSED! ===" -ForegroundColor Green
Write-Host "`nCleanup: Delete test user from MongoDB if needed" -ForegroundColor Gray
Write-Host "  db.users.deleteOne({ username: '$testUsername' })" -ForegroundColor DarkGray
