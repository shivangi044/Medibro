@echo off
echo ============================================
echo   Testing Hardware API - GET and POST
echo   Server: http://192.168.0.249:5000
echo ============================================
echo.

echo ============================================
echo   TEST 1: Get Upcoming Medicines (GET)
echo ============================================
curl http://192.168.0.249:5000/api/hardware/upcoming
echo.
echo.
pause

echo ============================================
echo   TEST 2: Hardware Takes Medicine (POST)
echo   Sending: id=1, status=taken
echo ============================================
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"taken\"}"
echo.
echo.
pause

echo ============================================
echo   TEST 3: Verify Medicine Moved to Taken
echo ============================================
curl http://192.168.0.249:5000/api/hardware/taken
echo.
echo.
pause

echo ============================================
echo   TEST 4: Hardware Snoozes Medicine (POST)
echo   Sending: id=2, status=snoozed
echo ============================================
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"2\",\"status\":\"snoozed\"}"
echo.
echo.
pause

echo ============================================
echo   TEST 5: Snooze Again (2nd time)
echo ============================================
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"2\",\"status\":\"snoozed\"}"
echo.
echo.
pause

echo ============================================
echo   TEST 6: Snooze 3rd Time - Should Move to Missed
echo ============================================
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"2\",\"status\":\"snoozed\"}"
echo.
echo.
pause

echo ============================================
echo   TEST 7: Verify Medicine in Missed Dataset
echo ============================================
curl http://192.168.0.249:5000/api/hardware/missed
echo.
echo.
pause

echo ============================================
echo   TEST 8: Hardware Marks Medicine as Missed (POST)
echo   Sending: id=3, status=missed
echo ============================================
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"3\",\"status\":\"missed\"}"
echo.
echo.
pause

echo ============================================
echo   TEST 9: Check All Datasets
echo ============================================
echo.
echo --- UPCOMING ---
curl http://192.168.0.249:5000/api/hardware/upcoming
echo.
echo.
echo --- TAKEN ---
curl http://192.168.0.249:5000/api/hardware/taken
echo.
echo.
echo --- MISSED ---
curl http://192.168.0.249:5000/api/hardware/missed
echo.
echo.

echo ============================================
echo   All Tests Complete!
echo ============================================
pause
