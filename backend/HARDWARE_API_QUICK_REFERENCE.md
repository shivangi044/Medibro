# 🔌 Hardware API Quick Reference

> **Base URL:** `http://your-server-ip:5000/api/hardware`

---

## 📋 6 Essential API Endpoints

### 1️⃣ Health Check
```http
GET /health?botId=MD-BOT-01
```
**Use:** Check if server is running and bot is registered  
**Call Frequency:** On boot & every 5 minutes

---

### 2️⃣ Register Device
```http
POST /register
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "userId": "675a1b2c3d4e5f6g7h8i9j0k"
}
```
**Use:** Link hardware bot to user account (one-time setup)

---

### 3️⃣ Fetch Schedule ⭐ MOST IMPORTANT
```http
GET /schedule?botId=MD-BOT-01
```
**Use:** Get list of medicines to dispense NOW  
**Call Frequency:** Every 1 hour + when checking time  
**Response:**
```json
{
  "success": true,
  "scheduleCount": 2,
  "data": [
    {
      "logId": "675...",
      "medicineName": "Aspirin",
      "dosage": "100mg",
      "slot": 1,
      "scheduledTime": "08:00",
      "status": "pending"
    }
  ]
}
```

---

### 4️⃣ Update Status ⭐ MOST IMPORTANT
```http
POST /update-status
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "logId": "675a1b2c3d4e5f6g7h8i9j0k",
  "status": "dispensed",
  "timestamp": "2024-01-15T08:00:00.000Z"
}
```
**Use:** Tell backend that medicine was dispensed  
**Call:** Immediately after dispensing

---

### 5️⃣ Get Slot Configuration
```http
GET /slots?botId=MD-BOT-01
```
**Use:** Know which medicine is in which slot  
**Call Frequency:** Every 6 hours (to check stock levels)

---

### 6️⃣ Bulk Update (Optional)
```http
POST /bulk-update
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "updates": [
    {
      "logId": "675...",
      "status": "dispensed",
      "timestamp": "2024-01-15T08:00:00.000Z"
    }
  ]
}
```
**Use:** Update multiple medicines at once

---

## 🔄 Hardware Workflow

```
┌─────────────────────────────────────────────────┐
│ 1. Power On → WiFi Connect                      │
│ 2. Health Check (GET /health)                   │
│ 3. Register Device (POST /register) [first time]│
│ 4. Fetch Schedule (GET /schedule) [every 1 hour]│
│ 5. Check Current Time [every 1 minute]          │
│ 6. If match found → Dispense Medicine           │
│ 7. Update Status (POST /update-status)          │
│ 8. Loop back to step 5                          │
└─────────────────────────────────────────────────┘
```

---

## 🕒 Recommended Timing

| Action | Frequency | Why |
|--------|-----------|-----|
| Health Check | Every 5 min | Detect connectivity issues |
| Fetch Schedule | Every 1 hour | Save bandwidth, reduce load |
| Check Time | Every 1 min | Dispense at exact scheduled time |
| Update Status | Immediately | Real-time tracking |

---

## 📝 Status Values

- `pending` - Waiting to dispense
- `dispensed` - Successfully dispensed
- `skipped` - User manually skipped
- `snoozed` - User delayed by 30 min
- `taken_late` - Taken after scheduled time

---

## 🧪 Testing Commands (Windows CMD)

```cmd
REM Health Check
curl "http://localhost:5000/api/hardware/health?botId=MD-BOT-01"

REM Fetch Schedule
curl "http://localhost:5000/api/hardware/schedule?botId=MD-BOT-01"

REM Update Status
curl -X POST "http://localhost:5000/api/hardware/update-status" ^
  -H "Content-Type: application/json" ^
  -d "{\"botId\":\"MD-BOT-01\",\"logId\":\"675...\",\"status\":\"dispensed\",\"timestamp\":\"2024-01-15T08:00:00.000Z\"}"

REM Get Slots
curl "http://localhost:5000/api/hardware/slots?botId=MD-BOT-01"
```

---

## 🐍 Python Testing Tool

Run the hardware simulator:
```bash
python test_hardware.py
```

This will:
- ✅ Test all 6 endpoints
- ✅ Simulate complete dispense flow
- ✅ Show real-time status updates
- ✅ Color-coded output for easy debugging

---

## ⚠️ Error Handling

```python
# Always retry on failure
max_retries = 3
for attempt in range(max_retries):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            break
    except:
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
```

---

## 🎯 Arduino/ESP32 Minimal Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SERVER = "http://192.168.1.100:5000/api/hardware";
const char* BOT_ID = "MD-BOT-01";

void loop() {
  // Every hour: Fetch schedule
  HTTPClient http;
  http.begin(SERVER + String("/schedule?botId=") + BOT_ID);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    DynamicJsonDocument doc(2048);
    deserializeJson(doc, http.getString());
    JsonArray schedule = doc["data"];
    
    // Check each medicine
    for (JsonObject med : schedule) {
      String scheduledTime = med["scheduledTime"];
      if (isTimeNow(scheduledTime)) {
        int slot = med["slot"];
        dispense(slot);  // Your motor code
        updateStatus(med["logId"]);
      }
    }
  }
  http.end();
  delay(60000);  // Check every minute
}
```

---

## 📦 What You Need

**Hardware Side:**
- WiFi module (ESP32/ESP8266/Raspberry Pi)
- Motor driver (for dispensing)
- RTC module (for accurate time)

**Backend Side:**
- Node.js server running
- MongoDB running
- Port 5000 open
- User account created via mobile app
- Medicines added via mobile app

---

## 🚀 Getting Started (3 Steps)

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Test with Python Tool:**
   ```bash
   python test_hardware.py
   ```

3. **Program Your Hardware:**
   - Use Arduino example from HARDWARE_INTEGRATION.md
   - Change WiFi credentials
   - Change SERVER IP to your computer's IP
   - Upload to ESP32/Arduino

---

## 🔗 Related Documentation

- `HARDWARE_INTEGRATION.md` - Complete guide with code examples
- `README.md` - Backend setup and API reference
- `BACKEND_SETUP.md` - Installation instructions

---

## 💡 Tips

1. **Save bandwidth:** Cache schedule locally, only fetch every hour
2. **Handle offline:** Store failed updates, retry when online
3. **Time sync:** Use NTP to keep hardware clock accurate
4. **Low stock alert:** Check `remaining` field in slot config
5. **Multiple medicines:** Use bulk update for efficiency

---

**Need Help?** Check `HARDWARE_INTEGRATION.md` for detailed examples!
