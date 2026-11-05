@echo off
title VaxCare - E-Vaccine Reminder System
echo ===================================================
echo     VaxCare - E-Vaccine Reminder ^& Tracker
echo ===================================================
echo.

REM 1. Start MongoDB if not already running
echo Checking MongoDB local server...
powershell -NoProfile -Command "if (Get-Process mongod -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is already running.
) else (
    echo Starting local mongod instance...
    start "MongoDB Database" /min "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "%~dp0backend\data\db" --port 27017 --bind_ip 127.0.0.1
    ping 127.0.0.1 -n 3 >nul
)

REM 2. Start Backend in separate window
echo Starting Backend API server on http://localhost:5000 ...
start "VaxCare Backend API" cmd /k "cd /d "%~dp0backend" && node server.js"

REM 3. Start Frontend in separate window
echo Starting Frontend React application on http://localhost:5173 ...
start "VaxCare Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo   System launched!
echo   - Backend API: http://localhost:5000
echo   - Frontend UI: http://localhost:5173
echo ===================================================
echo.
pause
