@echo off
echo ============================================
echo   Testing Hardware API Endpoints
echo ============================================
echo.

echo Starting backend server...
echo Please wait for server to start (5 seconds)...
echo.
start /B node server.js
timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo   Test 1: Health Check
echo ============================================
curl http://localhost:5000/api/hardware/health
echo.
echo.

echo ============================================
echo   Test 2: Get Upcoming Medicines
echo ============================================
curl http://localhost:5000/api/hardware/upcoming
echo.
echo.

echo ============================================
echo   Test 3: Get Taken Medicines
echo ============================================
curl http://localhost:5000/api/hardware/taken
echo.
echo.

echo ============================================
echo   Test 4: Get Missed Medicines
echo ============================================
curl http://localhost:5000/api/hardware/missed
echo.
echo.

echo ============================================
echo   Test 5: Update Medicine Status
echo ============================================
curl -X POST http://localhost:5000/api/hardware/update-status ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"taken\"}"
echo.
echo.

echo ============================================
echo   Test 6: Verify Status Update
echo ============================================
curl http://localhost:5000/api/hardware/taken
echo.
echo.

echo ============================================
echo   All Tests Complete!
echo ============================================
echo.
echo Press any key to stop the server...
pause > nul

echo Stopping server...
taskkill /F /IM node.exe > nul 2>&1
echo Done!
