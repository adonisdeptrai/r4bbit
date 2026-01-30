$body = @{
    username = "0386045651"
    password = "Buiminhduy2604"
    deviceId = "BIR9wR6D6iKXBL6tR2qgeUNHvA7GULbtrc8C07kT0FquW"
} | ConvertTo-Json

try {
    Write-Host "Testing TPBank API from Docker container..."
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/settings/test-tpbank" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    Write-Host "`nResponse Status: $($response.StatusCode)"
    Write-Host "Response Body:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError occurred:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message: $($_.Exception.Message)"
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Details:"
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
}
