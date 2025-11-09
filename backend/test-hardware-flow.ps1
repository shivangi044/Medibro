# PowerShell Test Script for Hardware API
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Testing Hardware API - GET and POST" -ForegroundColor Cyan
Write-Host "  Server: http://192.168.0.249:5000" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get Upcoming
Write-Host "TEST 1: Get Upcoming Medicines" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://192.168.0.249:5000/api/hardware/upcoming" -Method Get
$response | ConvertTo-Json -Depth 10
Write-Host ""

# Test 2: Hardware Takes Medicine
Write-Host "TEST 2: Hardware Takes Medicine (POST)" -ForegroundColor Yellow
$body = @{
    id = "1"
    status = "taken"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://192.168.0.249:5000/api/hardware/upcoming" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$response | ConvertTo-Json -Depth 10
Write-Host ""

# Test 3: Verify in Taken
Write-Host "TEST 3: Verify Medicine Moved to Taken" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://192.168.0.249:5000/api/hardware/taken" -Method Get
$response | ConvertTo-Json -Depth 10
Write-Host ""

# Test 4: Snooze Medicine (1st time)
Write-Host "TEST 4: Snooze Medicine (1st time)" -ForegroundColor Yellow
$body = @{
    id = "2"
    status = "snoozed"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://192.168.0.249:5000/api/hardware/upcoming" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$response | ConvertTo-Json -Depth 10
Write-Host ""

# Test 5: Snooze Medicine (2nd time)
Write-Host "TEST 5: Snooze Medicine (2nd time)" -ForegroundColor Yellow
$body = @{
    id = "2"
    status = "snoozed"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://192.168.0.249:5000/api/hardware/upcoming" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$response | ConvertTo-Json -Depth 10
Write-Host ""

# Test 6: Snooze Medicine (3rd time - should move to missed)
Write-Host "TEST 6: Snooze Medicine (3rd time - moves to missed)" -ForegroundColor Yellow
$body = @{
    id = "2"
    status = "snoozed"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://192.168.0.249:5000/api/hardware/upcoming" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$response | ConvertTo-Json -Depth 10
Write-Host ""

# Test 7: Check Missed
Write-Host "TEST 7: Check Missed Dataset" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://192.168.0.249:5000/api/hardware/missed" -Method Get
$response | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "  All Tests Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
