# 🎯 Hardware Connection - Complete Answer

## Quick Answer to "How to connect with hardware?"

Your hardware needs to make **HTTP requests** to these **6 API endpoints**:

---

## 📍 The 2 Most Important Endpoints

### 1️⃣ GET Schedule (Call every hour)
```
http://your-server:5000/api/hardware/schedule?botId=MD-BOT-01
```
**Returns:** List of medicines to dispense right now

### 2️⃣ POST Update Status (Call after dispensing)
```
http://your-server:5000/api/hardware/update-status
Body: { botId, logId, status: "dispensed", timestamp }
```
**Does:** Marks medicine as taken in the app

---

## 🔄 Complete Hardware Flow

```
START → WiFi Connect → Health Check → Fetch Schedule
  ↓
Check Time Every Minute
  ↓
If Time Matches Scheduled Time:
  ↓
Activate Motor (dispense medicine)
  ↓
POST Update Status to Backend
  ↓
Loop Back ↑
```

---

## 💻 Actual Code for ESP32/Arduino

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

// Configure these
const char* WIFI_SSID = "YourWiFi";
const char* WIFI_PASS = "YourPassword";
const char* SERVER = "http://192.168.1.100:5000/api/hardware";
const char* BOT_ID = "MD-BOT-01";

void setup() {
  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void loop() {
  // 1. Fetch schedule (every hour)
  HTTPClient http;
  http.begin(SERVER + String("/schedule?botId=") + BOT_ID);
  int code = http.GET();
  
  if (code == 200) {
    String json = http.getString();
    // Parse JSON to get medicines
    // Check if current time matches scheduled time
    // If yes → dispense() and updateStatus()
  }
  
  http.end();
  delay(60000); // Wait 1 minute
}

void dispense(int slot) {
  // Your motor control code here
  digitalWrite(MOTOR_PIN[slot], HIGH);
  delay(3000);
  digitalWrite(MOTOR_PIN[slot], LOW);
}

void updateStatus(String logId) {
  HTTPClient http;
  http.begin(SERVER + String("/update-status"));
  http.addHeader("Content-Type", "application/json");
  
  String body = "{\"botId\":\"" + String(BOT_ID) + 
                "\",\"logId\":\"" + logId + 
                "\",\"status\":\"dispensed\",\"timestamp\":\"2024-01-15T08:00:00Z\"}";
  
  http.POST(body);
  http.end();
}
```

---

## 🐍 Actual Code for Raspberry Pi (Python)

```python
import requests
import time
from datetime import datetime

SERVER = "http://192.168.1.100:5000/api/hardware"
BOT_ID = "MD-BOT-01"

def fetch_schedule():
    """Get medicines to dispense"""
    response = requests.get(f"{SERVER}/schedule?botId={BOT_ID}")
    if response.status_code == 200:
        return response.json()['data']
    return []

def dispense(slot):
    """Control motor to dispense"""
    # Your GPIO motor control code
    print(f"Dispensing from slot {slot}")
    time.sleep(3)

def update_status(log_id):
    """Tell backend medicine was dispensed"""
    payload = {
        "botId": BOT_ID,
        "logId": log_id,
        "status": "dispensed",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    response = requests.post(f"{SERVER}/update-status", json=payload)
    return response.status_code == 200

# Main loop
while True:
    # Fetch schedule every hour
    schedule = fetch_schedule()
    
    for medicine in schedule:
        # Check if time to dispense
        if is_time_now(medicine['scheduledTime']):
            dispense(medicine['slot'])
            update_status(medicine['logId'])
    
    time.sleep(60)  # Check every minute
```

---

## 📋 All 6 API Endpoints

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 1 | `/health?botId=X` | GET | Check server connection |
| 2 | `/register` | POST | Link bot to user (one-time) |
| 3 | `/schedule?botId=X` | GET | **Get medicines to dispense** ⭐ |
| 4 | `/update-status` | POST | **Mark medicine as dispensed** ⭐ |
| 5 | `/slots?botId=X` | GET | Get slot configuration |
| 6 | `/bulk-update` | POST | Update multiple medicines |

---

## 🧪 Test Without Hardware (3 Steps)

### Step 1: Start Backend
```cmd
cd backend
npm install
npm run dev
```

### Step 2: Run Python Simulator
```cmd
python test_hardware.py
```

### Step 3: Test Complete Flow
- Press `5` in the menu
- Watch simulated dispensing
- Check mobile app for updates

---

## 📱 What Happens in Mobile App?

1. User adds medicine "Aspirin" for 8:00 AM
2. Backend creates schedule entry with `status: "pending"`
3. At 8:00 AM, hardware fetches schedule
4. Hardware dispenses medicine
5. Hardware POSTs to `/update-status`
6. Backend changes status to `"dispensed"`
7. Mobile app shows ✓ Taken
8. Analytics updates adherence rate

---

## 🎯 What You Need to Provide Hardware

Give your hardware developer these 3 things:

### 1. Server IP Address
```
Example: http://192.168.1.100:5000
```

### 2. Bot ID
```
Example: MD-BOT-01
```

### 3. Two API Endpoints
```
GET  /api/hardware/schedule?botId=MD-BOT-01
POST /api/hardware/update-status
```

---

## 📦 Hardware Requirements

**Must Have:**
- WiFi connectivity (ESP32/ESP8266/Raspberry Pi)
- HTTP client library
- JSON parser
- Real-time clock (RTC)
- Motor driver for dispensing

**Nice to Have:**
- LED indicators
- Buzzer for alerts
- LCD display
- Sensors to detect dispensing

---

## 🚀 Quick Start for Hardware Developer

1. **Get Backend Running:**
   ```cmd
   cd backend
   npm install
   npm run dev
   ```

2. **Test with cURL:**
   ```cmd
   curl "http://localhost:5000/api/hardware/schedule?botId=MD-BOT-01"
   ```

3. **Copy Arduino Code:**
   - Open `HARDWARE_INTEGRATION.md`
   - Copy Arduino example (lines 200-400)
   - Change WiFi credentials
   - Change SERVER IP
   - Upload to ESP32

4. **Test:**
   - Power on device
   - Check serial monitor for "Connected"
   - Add medicine via mobile app
   - Watch hardware fetch and dispense

---

## 📚 Documentation Files

| File | What's Inside |
|------|---------------|
| `HARDWARE_API_QUICK_REFERENCE.md` | Quick cheat sheet ⚡ |
| `HARDWARE_INTEGRATION.md` | Complete guide with code 📖 |
| `TESTING_GUIDE.md` | Step-by-step testing 🧪 |
| `test_hardware.py` | Python simulator tool 🐍 |
| `README.md` | Full backend API reference 📚 |

---

## 🎓 Understanding the System

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │  WiFi   │             │  REST   │             │
│  Hardware   │◄───────►│   Backend   │◄───────►│  Mobile App │
│  (ESP32)    │  JSON   │  (Node.js)  │   API   │  (React N)  │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      ↓                        ↓                       ↓
   Dispense              Store Data              Show Status
   Medicine              in MongoDB              & Analytics
```

**Flow:**
1. User adds medicine in mobile app
2. Backend stores in MongoDB
3. Backend creates schedule entries
4. Hardware fetches schedule via WiFi
5. Hardware dispenses at scheduled time
6. Hardware updates status to backend
7. Backend updates MongoDB
8. Mobile app shows real-time status

---

## 🔒 Security Note

Hardware endpoints do **NOT require authentication** (no JWT token needed).

**Why?**
- Simplifies hardware code
- Hardware can't store tokens securely
- Bot ID acts as identifier

**Security Measures:**
- Use HTTPS in production
- Validate botId on every request
- Rate limiting on hardware endpoints
- Network-level security (VPN/firewall)

---

## 💡 Pro Tips

1. **Save bandwidth:** Cache schedule locally, only fetch every hour
2. **Handle offline:** Store failed updates, retry when online
3. **Sync time:** Use NTP to keep clock accurate
4. **Error handling:** Retry 3 times with exponential backoff
5. **Logging:** Log all API calls for debugging

---

## 🆘 Troubleshooting

**Problem:** Hardware can't connect to server
- ✅ Check server is running: `npm run dev`
- ✅ Check IP address is correct
- ✅ Check both on same WiFi network
- ✅ Ping server from hardware: `ping 192.168.1.100`

**Problem:** No medicines in schedule
- ✅ Add medicine via mobile app first
- ✅ Set time within next 2 hours
- ✅ Check medicine has correct slot assigned

**Problem:** Status update not working
- ✅ Check logId is correct (get from schedule response)
- ✅ Check JSON format is correct
- ✅ Check Content-Type header is `application/json`

---

## 📞 Need More Help?

1. **Testing:** Read `TESTING_GUIDE.md`
2. **Code Examples:** Read `HARDWARE_INTEGRATION.md`
3. **API Reference:** Read `README.md`
4. **Quick Lookup:** Read `HARDWARE_API_QUICK_REFERENCE.md`

---

## ✅ Final Checklist

Before connecting hardware:

- [ ] Backend running on `localhost:5000`
- [ ] MongoDB connected
- [ ] User account created
- [ ] At least 1 medicine added with schedule
- [ ] Tested with `test_hardware.py` simulator
- [ ] All tests passing
- [ ] Network connectivity verified
- [ ] Server IP noted down
- [ ] Bot ID decided (e.g., MD-BOT-01)

---

## 🎉 That's It!

Your hardware just needs to:
1. **Fetch schedule** every hour (GET)
2. **Update status** after dispensing (POST)

Everything else is optional. These 2 endpoints are all you need for basic functionality! 🚀

---

**Start testing now with:** `python test_hardware.py`
