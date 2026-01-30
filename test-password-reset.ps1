# Password Reset Flow Test Script

# Test Configuration
$baseUrl = "http://localhost:5000"
$testEmail = "test-reset@example.com"
$testUsername = "testreset" + (Get-Date -Format "HHmmss")
$testPassword = "oldpassword123"
$newPassword = "newpassword456"

Write-Host "`n=== PASSWORD RESET FLOW TEST ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "Test Email: $testEmail`n" -ForegroundColor Gray

# Step 1: Register Test User (if needed)
Write-Host "[1/5] Registering test user..." -ForegroundColor Yellow

$registerBody = @{
    username = $testUsername
    email    = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json" `
        -UseBasicParsing | Out-Null

    Write-Host "✓ User registered!" -ForegroundColor Green
    
    # Auto-verify user (manual DB update approach - for testing only)
    Write-Host "  NOTE: Manually verify user in DB if needed:" -ForegroundColor Gray
    Write-Host "  db.users.updateOne({ email: '$testEmail' }, { `$set: { isVerified: true } })" -ForegroundColor DarkGray
    
    Write-Host "`nPress Enter when user is verified..." -ForegroundColor Yellow
    Read-Host
}
catch {
    Write-Host "⚠ Registration failed (user may already exist)" -ForegroundColor Yellow
}

# Step 2: Request Password Reset
Write-Host "`n[2/5] Requesting password reset..." -ForegroundColor Yellow

$forgotBody = @{
    email = $testEmail
} | ConvertTo-Json

try {
    $forgotRes = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/forgot-password" `
        -Method POST `
        -Body $forgotBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $forgotData = $forgotRes.Content | ConvertFrom-Json
    Write-Host "✓ Reset request sent!" -ForegroundColor Green
    Write-Host "  Message: $($forgotData.message)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed to request reset!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Get Reset Token
Write-Host "`n[3/5] Check server console for reset link" -ForegroundColor Yellow
Write-Host "Format: http://localhost:8080/reset-password?token={64-char-token}" -ForegroundColor Gray
$resetToken = Read-Host "Enter reset token from console/email"

# Step 4: Reset Password
Write-Host "`n[4/5] Resetting password..." -ForegroundColor Yellow

$resetBody = @{
    password        = $newPassword
    confirmPassword = $newPassword
} | ConvertTo-Json

try {
    $resetRes = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/reset-password/$resetToken" `
        -Method POST `
        -Body $resetBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $resetData = $resetRes.Content | ConvertFrom-Json
    Write-Host "✓ Password reset successful!" -ForegroundColor Green
    Write-Host "  Message: $($resetData.message)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Password reset failed!" -ForegroundColor Red
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error: $($errorBody.message)" -ForegroundColor Red
    exit 1
}

# Step 5: Login with New Password
Write-Host "`n[5/5] Testing login with new password..." -ForegroundColor Yellow

$loginBody = @{
    username = $testUsername
    password = $newPassword
} | ConvertTo-Json

try {
    $loginRes = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $loginData = $loginRes.Content | ConvertFrom-Json
    Write-Host "✓ Login successful with new password!" -ForegroundColor Green
    Write-Host "  Username: $($loginData.user.username)" -ForegroundColor Gray
    Write-Host "  Token: $($loginData.token.Substring(0,20))..." -ForegroundColor Gray
}
catch {
    Write-Host "✗ Login failed!" -ForegroundColor Red
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error: $($errorBody.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== ALL TESTS PASSED! ===" -ForegroundColor Green

# Additional Tests
Write-Host "`n--- Additional Tests (Optional) ---" -ForegroundColor Cyan

# Test expired token
Write-Host "`n[BONUS] Test Expired Token (Manual DB Update Required):" -ForegroundColor Yellow
Write-Host "  db.users.updateOne(" -ForegroundColor DarkGray
Write-Host "    { email: '$testEmail' }," -ForegroundColor DarkGray
Write-Host "    { `$set: { resetPasswordExpires: new Date(Date.now() - 1000) } }" -ForegroundColor DarkGray
Write-Host "  )" -ForegroundColor DarkGray
Write-Host "  Then retry reset → Should get 'expired token' error" -ForegroundColor DarkGray

# Test invalid token
Write-Host "`n[BONUS] Test Invalid Token:" -ForegroundColor Yellow
Write-Host "  Try reset-password with fake token → Should get 'invalid token' error" -ForegroundColor DarkGray

# Cleanup
Write-Host "`n--- Cleanup ---" -ForegroundColor Cyan
Write-Host "Delete test user from MongoDB:" -ForegroundColor Gray
Write-Host "  db.users.deleteOne({ username: '$testUsername' })" -ForegroundColor DarkGray
