# TPBank Transaction History API

## Endpoint: Lấy lịch sử giao dịch

### Request

```http
POST /api/settings/tpbank-history
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Authentication:**
- ✅ Requires JWT token (login required)
- ✅ Admin role required

**Body:** Không cần body (API tự lấy credentials từ Settings)

### Response

**Success (200 OK):**
```json
{
  "transactionInfos": [
    {
      "id": "xxx",
      "description": "R4B CD4D4N",
      "amount": 2500,
      "currency": "VND",
      "creditDebitIndicator": "CRDT",
      "bookingDate": "2026-01-24",
      "postingDate": "2026-01-24",
      "arrangementId": "23434978888",
      "reference": "...",
      "runningBalance": 12345.00
    }
  ],
  "totalRecords": 1,
  "fromDate": "20251225",
  "toDate": "20260124"
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Bank settings not provided"
}
```

**Error (401 Unauthorized):**
```json
{
  "message": "No token, authorization denied"
}
```

**Error (500 Server Error):**
```json
{
  "message": "Failed to fetch history",
  "error": "Error details..."
}
```

---

## Sử dụng với cURL

### Windows PowerShell

```powershell
# 1. Login để lấy token
$loginBody = @{
    username = "mquyendeptrai"
    password = "mquyendeptrai"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json" `
    -UseBasicParsing

$token = ($loginResponse.Content | ConvertFrom-Json).token

# 2. Lấy lịch sử giao dịch
$historyResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/settings/tpbank-history" `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer $token" } `
    -ContentType "application/json" `
    -UseBasicParsing

$historyResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Linux/Mac (curl)

```bash
# 1. Login để lấy token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mquyendeptrai","password":"mquyendeptrai"}' \
  | jq -r '.token')

# 2. Lấy lịch sử giao dịch
curl -X POST http://localhost:5000/api/settings/tpbank-history \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq .
```

---

## Sử dụng với JavaScript/Frontend

### Fetch API

```javascript
// Giả sử đã có token từ login
const token = localStorage.getItem('token');

async function getTPBankHistory() {
  try {
    const response = await fetch('http://localhost:5000/api/settings/tpbank-history', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log('Transaction History:', data);
    
    // Hiển thị transactions
    data.transactionInfos?.forEach(tx => {
      console.log(`${tx.description} - ${tx.amount.toLocaleString('vi-VN')} VND`);
    });

    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

// Gọi hàm
getTPBankHistory();
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để tự động thêm token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lấy lịch sử giao dịch
async function getTPBankHistory() {
  try {
    const { data } = await api.post('/api/settings/tpbank-history');
    return data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}
```

---

## Response Fields Giải thích

| Field | Type | Description |
|-------|------|-------------|
| `transactionInfos` | Array | Danh sách giao dịch (30 ngày gần nhất) |
| `transactionInfos[].id` | String | ID giao dịch từ TPBank |
| `transactionInfos[].description` | String | Nội dung chuyển khoản |
| `transactionInfos[].amount` | Number | Số tiền (VND) |
| `transactionInfos[].creditDebitIndicator` | String | `CRDT` (tiền vào) hoặc `DBIT` (tiền ra) |
| `transactionInfos[].bookingDate` | String | Ngày giao dịch (YYYY-MM-DD) |
| `transactionInfos[].arrangementId` | String | Số tài khoản |
| `transactionInfos[].runningBalance` | Number | Số dư sau giao dịch |

---

## Lưu ý quan trọng

> [!IMPORTANT]
> **Credentials từ Settings:**
> API tự động lấy thông tin TPBank từ database Settings:
> - `bank.username` - TPBank username
> - `bank.password` - TPBank password  
> - `bank.deviceId` - TPBank device ID
> - `bank.accountNo` - Số tài khoản

> [!WARNING]
> **Security:**
> - API này chỉ dành cho Admin
> - Không expose token ra ngoài
> - Sử dụng HTTPS trong production

> [!TIP]
> **Auto-login:**
> Nếu token TPBank hết hạn (401), API tự động re-login và retry request.

---

## Test Script

Tôi đã tạo sẵn test script cho bạn:

### PowerShell Test Script

```powershell
# File: test-history-api.ps1
$baseUrl = "http://localhost:5000"

# 1. Login
$loginBody = @{
    username = "mquyendeptrai"
    password = "mquyendeptrai"
} | ConvertTo-Json

Write-Host "Đang login..."
$loginRes = Invoke-WebRequest `
    -Uri "$baseUrl/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json" `
    -UseBasicParsing

$token = ($loginRes.Content | ConvertFrom-Json).token
Write-Host "✓ Login thành công`n"

# 2. Get History
Write-Host "Đang lấy lịch sử giao dịch..."
$historyRes = Invoke-WebRequest `
    -Uri "$baseUrl/api/settings/tpbank-history" `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer $token" } `
    -ContentType "application/json" `
    -UseBasicParsing

$history = $historyRes.Content | ConvertFrom-Json

Write-Host "✓ Lấy lịch sử thành công`n"
Write-Host "=== LỊCH SỬ GIAO DỊCH ===" -ForegroundColor Green
Write-Host "Tổng: $($history.transactionInfos.Count) giao dịch`n"

$history.transactionInfos | ForEach-Object {
    $type = if ($_.creditDebitIndicator -eq "CRDT") { "+" } else { "-" }
    $color = if ($_.creditDebitIndicator -eq "CRDT") { "Green" } else { "Red" }
    
    Write-Host "$($_.bookingDate) | $type$($_.amount.ToString('N0')) VND" -ForegroundColor $color
    Write-Host "  $($_.description)" -ForegroundColor Gray
    Write-Host ""
}
```

**Chạy:**
```powershell
.\test-history-api.ps1
```

---

## Related APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/settings` | GET | Lấy settings hiện tại |
| `/api/settings` | PUT | Cập nhật settings (Admin) |
| `/api/settings/test-tpbank` | POST | Test TPBank connection (Admin) |
| `/api/settings/tpbank-logs` | GET | Lấy system logs (Admin) |
| `/api/settings/tpbank-history` | POST | **Lấy lịch sử giao dịch (Admin)** |
