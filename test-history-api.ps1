$baseUrl = "http://localhost:5000"

# 1. Login
$loginBody = @{
    username = "mquyendeptrai"
    password = "mquyendeptrai"
} | ConvertTo-Json

Write-Host "`n=== TPBank Transaction History API Test ===" -ForegroundColor Cyan
Write-Host "Đang login..." -ForegroundColor Yellow

try {
    $loginRes = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $token = ($loginRes.Content | ConvertFrom-Json).token
    Write-Host "✓ Login thành công`n" -ForegroundColor Green

    # 2. Get History
    Write-Host "Đang lấy lịch sử giao dịch..." -ForegroundColor Yellow
    $historyRes = Invoke-WebRequest `
        -Uri "$baseUrl/api/settings/tpbank-history" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -ContentType "application/json" `
        -UseBasicParsing

    $history = $historyRes.Content | ConvertFrom-Json

    Write-Host "✓ Lấy lịch sử thành công`n" -ForegroundColor Green
    Write-Host "=== LỊCH SỬ GIAO DỊCH (30 ngày gần nhất) ===" -ForegroundColor Cyan
    Write-Host "Tổng: $($history.transactionInfos.Count) giao dịch"
    Write-Host "Từ ngày: $($history.fromDate)"
    Write-Host "Đến ngày: $($history.toDate)`n"

    if ($history.transactionInfos.Count -eq 0) {
        Write-Host "Không có giao dịch nào trong 30 ngày qua." -ForegroundColor Yellow
    }
    else {
        $history.transactionInfos | ForEach-Object {
            $type = if ($_.creditDebitIndicator -eq "CRDT") { "+" } else { "-" }
            $color = if ($_.creditDebitIndicator -eq "CRDT") { "Green" } else { "Red" }
            
            Write-Host "$($_.bookingDate) | $type$($_.amount.ToString('N0')) VND | Balance: $($_.runningBalance.ToString('N0'))" -ForegroundColor $color
            Write-Host "  $($_.description)" -ForegroundColor Gray
            Write-Host ""
        }
    }

    Write-Host "`n=== Test hoàn tất ===" -ForegroundColor Cyan

}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
