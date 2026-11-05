Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    VaxCare - E-Vaccine Reminder & Tracker" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Start MongoDB if not running
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "[OK] MongoDB is already running (PID: $($mongoProcess.Id))." -ForegroundColor Green
} else {
    Write-Host "Starting local MongoDB instance..." -ForegroundColor Yellow
    $dbPath = Join-Path $PSScriptRoot "backend\data\db"
    Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" -ArgumentList "--dbpath `"$dbPath`" --port 27017 --bind_ip 127.0.0.1" -WindowStyle Minimized
    Start-Sleep -Seconds 2
}

# 2. Start Backend API
Write-Host "Starting Backend API on http://localhost:5000 ..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$backendPath`" && node server.js"

# 3. Start Frontend React App
Write-Host "Starting Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$frontendPath`" && npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  System launched successfully!" -ForegroundColor Green
Write-Host "  - Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan
