# 🤖 Hardware Device Integration Guide

## Complete Guide for Hardware Developers

This guide explains **exactly** how your hardware device (Medicine Dispenser) should communicate with the MediBro backend API.

---

## 🎯 Overview

Your hardware device will:
1. **Register** with the backend
2. **Fetch** medicine schedule periodically
3. **Dispense** medicines at scheduled times
4. **Update** status back to backend
5. **Sync** slot configuration

---

## 🔌 API Base URL

```
http://YOUR_SERVER_IP:5000/api/hardware
```

Replace `YOUR_SERVER_IP` with:
- **Local testing**: `192.168.1.100` (your computer's IP)
- **Production**: Your deployed server URL

---

## 📡 Hardware API Endpoints (Complete List)

### 1. Health Check
**Purpose**: Check if API server is running and device is registered

```http
GET /api/hardware/health?botId=MD-BOT-01
```

**Response:**
```json
{
  "success": true,
  "message": "Hardware API is running",
  "botRegistered": true,
  "botId": "MD-BOT-01",
  "timestamp": "2024-11-08T10:30:00.000Z"
}
```

---

### 2. Register Device
**Purpose**: Register your hardware device with a user account

```http
POST /api/hardware/register
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "userId": "673e4f1a2b3c4d5e6f7a8b9c"
}
```

**When to use**: 
- During initial setup
- When user pairs device with app
- After factory reset

**Response:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "botId": "MD-BOT-01",
    "userId": "673e4f1a2b3c4d5e6f7a8b9c",
    "userName": "John Doe"
  }
}
```

---

### 3. Get Medicine Schedule ⭐ (Most Important)
**Purpose**: Fetch medicines to dispense in the next 24 hours

```http
GET /api/hardware/schedule?botId=MD-BOT-01
```

**Optional Parameters:**
```http
GET /api/hardware/schedule?botId=MD-BOT-01&startTime=2024-11-08T00:00:00Z&endTime=2024-11-09T00:00:00Z
```

**When to use**:
- Every 1 hour (recommended)
- After device restart
- When user adds new medicine
- On-demand sync button

**Response:**
```json
{
  "success": true,
  "botId": "MD-BOT-01",
  "userId": "673e4f1a2b3c4d5e6f7a8b9c",
  "scheduleCount": 3,
  "data": [
    {
      "logId": "673e5a1b2c3d4e5f6a7b8c9d",
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "scheduledTime": "2024-11-08T09:00:00.000Z",
      "slot": "A1",
      "instructions": "Take with food",
      "status": "pending"
    },
    {
      "logId": "673e5a1b2c3d4e5f6a7b8c9e",
      "medicineName": "Vitamin D",
      "dosage": "1000 IU",
      "scheduledTime": "2024-11-08T14:00:00.000Z",
      "slot": "A2",
      "instructions": "Take with a meal containing fat",
      "status": "pending"
    },
    {
      "logId": "673e5a1b2c3d4e5f6a7b8c9f",
      "medicineName": "Omega-3",
      "dosage": "1000mg",
      "scheduledTime": "2024-11-08T20:00:00.000Z",
      "slot": "A3",
      "instructions": "Can be taken with or without food",
      "status": "pending"
    }
  ]
}
```

**What to do with this data**:
1. Store schedule in hardware memory
2. Set timers for each `scheduledTime`
3. When time matches, dispense from `slot`
4. After dispensing, update status (see endpoint #4)

---

### 4. Update Medicine Status ⭐ (Critical)
**Purpose**: Notify backend after dispensing medicine

```http
POST /api/hardware/update-status
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "logId": "673e5a1b2c3d4e5f6a7b8c9d",
  "status": "dispensed",
  "timestamp": "2024-11-08T09:05:00.000Z"
}
```

**Status Options:**
- `"dispensed"` or `"taken"` - Medicine successfully dispensed
- `"skipped"` - Medicine not dispensed (user manually skipped)

**When to use**:
- Immediately after dispensing medicine
- After motor/servo completes
- When LED confirms success

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "logId": "673e5a1b2c3d4e5f6a7b8c9d",
    "status": "taken",
    "takenTime": "2024-11-08T09:05:00.000Z"
  }
}
```

---

### 5. Get Slot Configuration
**Purpose**: Get information about which medicine is in which slot

```http
GET /api/hardware/slots?botId=MD-BOT-01
```

**When to use**:
- During initial setup
- After user adds/removes medicines
- For LCD display showing slot contents

**Response:**
```json
{
  "success": true,
  "botId": "MD-BOT-01",
  "slotCount": 3,
  "data": [
    {
      "slot": "A1",
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "remaining": 25,
      "times": ["09:00", "18:00"]
    },
    {
      "slot": "A2",
      "medicineName": "Vitamin D",
      "dosage": "1000 IU",
      "remaining": 28,
      "times": ["14:00"]
    },
    {
      "slot": "A3",
      "medicineName": "Omega-3",
      "dosage": "1000mg",
      "remaining": 55,
      "times": ["08:00"]
    }
  ]
}
```

---

### 6. Bulk Update (Optional)
**Purpose**: Update multiple medicine statuses at once

```http
POST /api/hardware/bulk-update
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "updates": [
    {
      "logId": "673e5a1b2c3d4e5f6a7b8c9d",
      "status": "dispensed"
    },
    {
      "logId": "673e5a1b2c3d4e5f6a7b8c9e",
      "status": "dispensed"
    }
  ]
}
```

**When to use**:
- After multiple medicines dispensed quickly
- During batch sync operations
- Recovery from offline mode

**Response:**
```json
{
  "success": true,
  "message": "Bulk update completed",
  "totalUpdates": 2,
  "successCount": 2,
  "data": [
    {
      "logId": "673e5a1b2c3d4e5f6a7b8c9d",
      "success": true,
      "status": "taken"
    },
    {
      "logId": "673e5a1b2c3d4e5f6a7b8c9e",
      "success": true,
      "status": "taken"
    }
  ]
}
```

---

## 🔄 Complete Hardware Workflow

### Step-by-Step Integration

```
┌─────────────────────────────────────────────────────────────┐
│                  Hardware Startup Flow                      │
└─────────────────────────────────────────────────────────────┘

1. POWER ON
   └─► Connect to WiFi
       └─► Check internet connection
           └─► GET /api/hardware/health?botId=MD-BOT-01
               ├─► Success: Continue
               └─► Fail: Show error LED, retry

2. INITIAL SYNC
   └─► GET /api/hardware/schedule?botId=MD-BOT-01
       └─► Store schedule in memory
           └─► Display on LCD: "3 medicines today"

3. CONTINUOUS MONITORING (Loop every minute)
   └─► Check current time
       └─► Compare with scheduled times
           └─► If match found:
               ├─► Beep buzzer
               ├─► Flash LED
               ├─► Dispense from slot
               └─► POST /api/hardware/update-status

4. PERIODIC SYNC (Every 1 hour)
   └─► GET /api/hardware/schedule?botId=MD-BOT-01
       └─► Update local schedule
```

---

## 💻 Hardware Code Examples

### Arduino/ESP32 Example (C++)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuration
const char* ssid = "Your_WiFi_SSID";
const char* password = "Your_WiFi_Password";
const char* serverUrl = "http://192.168.1.100:5000/api/hardware";
const char* botId = "MD-BOT-01";

// Schedule structure
struct Medicine {
  String logId;
  String name;
  String dosage;
  String scheduledTime;
  String slot;
};

Medicine schedule[10];
int scheduleCount = 0;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  
  // Initial sync
  fetchSchedule();
}

void loop() {
  // Check if it's time to dispense
  checkSchedule();
  
  // Periodic sync (every hour)
  static unsigned long lastSync = 0;
  if (millis() - lastSync > 3600000) { // 1 hour
    fetchSchedule();
    lastSync = millis();
  }
  
  delay(60000); // Check every minute
}

void fetchSchedule() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(serverUrl) + "/schedule?botId=" + botId;
    
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode == 200) {
      String payload = http.getString();
      
      // Parse JSON
      DynamicJsonDocument doc(4096);
      deserializeJson(doc, payload);
      
      scheduleCount = doc["scheduleCount"];
      JsonArray data = doc["data"];
      
      for (int i = 0; i < scheduleCount && i < 10; i++) {
        schedule[i].logId = data[i]["logId"].as<String>();
        schedule[i].name = data[i]["medicineName"].as<String>();
        schedule[i].dosage = data[i]["dosage"].as<String>();
        schedule[i].scheduledTime = data[i]["scheduledTime"].as<String>();
        schedule[i].slot = data[i]["slot"].as<String>();
      }
      
      Serial.println("Schedule fetched: " + String(scheduleCount) + " medicines");
    } else {
      Serial.println("Error fetching schedule: " + String(httpCode));
    }
    
    http.end();
  }
}

void checkSchedule() {
  // Get current time (you'll need RTC or NTP)
  String currentTime = getCurrentTime(); // Implement this
  
  for (int i = 0; i < scheduleCount; i++) {
    if (isTimeToDispense(currentTime, schedule[i].scheduledTime)) {
      dispenseFromSlot(schedule[i].slot);
      updateStatus(schedule[i].logId, "dispensed");
    }
  }
}

void dispenseFromSlot(String slot) {
  Serial.println("Dispensing from slot: " + slot);
  
  // Activate motor/servo for the slot
  if (slot == "A1") {
    // Activate motor 1
    digitalWrite(MOTOR_PIN_1, HIGH);
    delay(2000);
    digitalWrite(MOTOR_PIN_1, LOW);
  } else if (slot == "A2") {
    // Activate motor 2
    digitalWrite(MOTOR_PIN_2, HIGH);
    delay(2000);
    digitalWrite(MOTOR_PIN_2, LOW);
  }
  // ... more slots
  
  // Flash LED/Buzzer
  digitalWrite(LED_PIN, HIGH);
  tone(BUZZER_PIN, 1000, 500);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
}

void updateStatus(String logId, String status) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(serverUrl) + "/update-status";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON
    DynamicJsonDocument doc(512);
    doc["botId"] = botId;
    doc["logId"] = logId;
    doc["status"] = status;
    doc["timestamp"] = getCurrentTime();
    
    String jsonStr;
    serializeJson(doc, jsonStr);
    
    int httpCode = http.POST(jsonStr);
    
    if (httpCode == 200) {
      Serial.println("Status updated successfully");
    } else {
      Serial.println("Error updating status: " + String(httpCode));
    }
    
    http.end();
  }
}

String getCurrentTime() {
  // Implement using RTC or NTP
  // Format: "2024-11-08T09:00:00.000Z"
  return "2024-11-08T09:00:00.000Z";
}

bool isTimeToDispense(String current, String scheduled) {
  // Compare timestamps (implement your logic)
  return current == scheduled;
}
```

---

### Raspberry Pi Example (Python)

```python
import requests
import time
from datetime import datetime
import json

# Configuration
SERVER_URL = "http://192.168.1.100:5000/api/hardware"
BOT_ID = "MD-BOT-01"

class MedicineBotAPI:
    def __init__(self, server_url, bot_id):
        self.server_url = server_url
        self.bot_id = bot_id
        self.schedule = []
    
    def health_check(self):
        """Check if API server is reachable"""
        try:
            response = requests.get(
                f"{self.server_url}/health",
                params={"botId": self.bot_id},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Server healthy. Bot registered: {data.get('botRegistered')}")
                return True
            return False
        except Exception as e:
            print(f"✗ Health check failed: {e}")
            return False
    
    def fetch_schedule(self):
        """Fetch medicine schedule from server"""
        try:
            response = requests.get(
                f"{self.server_url}/schedule",
                params={"botId": self.bot_id},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.schedule = data.get('data', [])
                count = data.get('scheduleCount', 0)
                print(f"✓ Fetched {count} medicines to dispense")
                return True
            else:
                print(f"✗ Error fetching schedule: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Error fetching schedule: {e}")
            return False
    
    def update_status(self, log_id, status="dispensed"):
        """Update medicine status after dispensing"""
        try:
            payload = {
                "botId": self.bot_id,
                "logId": log_id,
                "status": status,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            response = requests.post(
                f"{self.server_url}/update-status",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✓ Status updated for log {log_id}")
                return True
            else:
                print(f"✗ Error updating status: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Error updating status: {e}")
            return False
    
    def get_slot_config(self):
        """Get current slot configuration"""
        try:
            response = requests.get(
                f"{self.server_url}/slots",
                params={"botId": self.bot_id},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                slots = data.get('data', [])
                print(f"✓ Slot configuration retrieved: {len(slots)} slots")
                return slots
            return []
        except Exception as e:
            print(f"✗ Error getting slot config: {e}")
            return []

class MedicineDispenser:
    def __init__(self, api):
        self.api = api
    
    def dispense_from_slot(self, slot):
        """Activate hardware to dispense medicine from slot"""
        print(f"🔔 Dispensing from slot {slot}...")
        
        # Activate motor/servo based on slot
        if slot == "A1":
            # GPIO or motor control for slot A1
            print("  → Activating motor for slot A1")
        elif slot == "A2":
            # GPIO or motor control for slot A2
            print("  → Activating motor for slot A2")
        elif slot == "A3":
            # GPIO or motor control for slot A3
            print("  → Activating motor for slot A3")
        
        # Flash LED, play buzzer
        print("  → LED ON")
        print("  → BEEP!")
        time.sleep(2)  # Wait for dispense to complete
        print("  → Dispense complete")
    
    def is_time_to_dispense(self, scheduled_time):
        """Check if current time matches scheduled time"""
        scheduled = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
        current = datetime.utcnow()
        
        # Check if within 1 minute window
        diff = abs((scheduled - current).total_seconds())
        return diff < 60
    
    def check_and_dispense(self):
        """Check schedule and dispense if time matches"""
        for medicine in self.api.schedule:
            if self.is_time_to_dispense(medicine['scheduledTime']):
                print(f"\n⏰ Time to dispense: {medicine['medicineName']}")
                print(f"   Dosage: {medicine['dosage']}")
                print(f"   Slot: {medicine['slot']}")
                
                # Dispense
                self.dispense_from_slot(medicine['slot'])
                
                # Update status
                self.api.update_status(medicine['logId'], 'dispensed')
                
                # Remove from schedule to avoid re-dispensing
                self.api.schedule.remove(medicine)

def main():
    print("=" * 60)
    print("MediBro Hardware Device Starting...")
    print("=" * 60)
    
    # Initialize API client
    api = MedicineBotAPI(SERVER_URL, BOT_ID)
    dispenser = MedicineDispenser(api)
    
    # Health check
    if not api.health_check():
        print("✗ Cannot connect to server. Please check network and server URL.")
        return
    
    # Initial schedule fetch
    api.fetch_schedule()
    
    # Display slot configuration
    slots = api.get_slot_config()
    print("\n📋 Slot Configuration:")
    for slot in slots:
        print(f"  {slot['slot']}: {slot['medicineName']} ({slot['remaining']} remaining)")
    
    print("\n🔄 Starting monitoring loop...")
    print("   Checking every minute...")
    print("   Syncing schedule every hour...")
    
    last_sync = time.time()
    
    try:
        while True:
            # Check if it's time to dispense
            dispenser.check_and_dispense()
            
            # Periodic sync (every hour)
            if time.time() - last_sync > 3600:
                print("\n🔄 Hourly sync...")
                api.fetch_schedule()
                last_sync = time.time()
            
            # Wait 1 minute before next check
            time.sleep(60)
            
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down gracefully...")

if __name__ == "__main__":
    main()
```

---

## 🔧 Testing Your Hardware Integration

### Step 1: Test with curl (Command Line)

```bash
# 1. Health Check
curl "http://192.168.1.100:5000/api/hardware/health?botId=MD-BOT-01"

# 2. Get Schedule
curl "http://192.168.1.100:5000/api/hardware/schedule?botId=MD-BOT-01"

# 3. Update Status
curl -X POST http://192.168.1.100:5000/api/hardware/update-status ^
  -H "Content-Type: application/json" ^
  -d "{\"botId\":\"MD-BOT-01\",\"logId\":\"YOUR_LOG_ID\",\"status\":\"dispensed\"}"
```

### Step 2: Test with Postman

1. Create a collection: "MediBro Hardware"
2. Add requests for each endpoint
3. Set environment variables for `BASE_URL` and `BOT_ID`
4. Test all endpoints

### Step 3: Test with Python Script

```python
# quick_test.py
import requests

BASE_URL = "http://192.168.1.100:5000/api/hardware"
BOT_ID = "MD-BOT-01"

# Test 1: Health Check
print("Testing health check...")
response = requests.get(f"{BASE_URL}/health?botId={BOT_ID}")
print(response.json())

# Test 2: Get Schedule
print("\nTesting schedule fetch...")
response = requests.get(f"{BASE_URL}/schedule?botId={BOT_ID}")
data = response.json()
print(f"Found {data['scheduleCount']} medicines")

# Test 3: Update Status (use real logId from schedule)
if data['scheduleCount'] > 0:
    log_id = data['data'][0]['logId']
    print(f"\nTesting status update for {log_id}...")
    response = requests.post(f"{BASE_URL}/update-status", json={
        "botId": BOT_ID,
        "logId": log_id,
        "status": "dispensed"
    })
    print(response.json())
```

---

## 📊 Hardware Response Handling

### Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* relevant data */ }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created (for registration)
- `400` - Bad Request (invalid data)
- `404` - Not Found (device not registered)
- `500` - Server Error

---

## 🚨 Error Handling in Hardware

```python
def safe_api_call(func):
    """Decorator for safe API calls with retry logic"""
    def wrapper(*args, **kwargs):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except requests.exceptions.Timeout:
                print(f"Timeout on attempt {attempt + 1}")
                time.sleep(2 ** attempt)  # Exponential backoff
            except requests.exceptions.ConnectionError:
                print(f"Connection error on attempt {attempt + 1}")
                time.sleep(5)
            except Exception as e:
                print(f"Error: {e}")
                break
        return None
    return wrapper

@safe_api_call
def fetch_schedule_safe():
    response = requests.get(
        f"{SERVER_URL}/schedule",
        params={"botId": BOT_ID},
        timeout=10
    )
    return response.json()
```

---

## 💡 Best Practices

### 1. **Sync Frequency**
```
✓ Fetch schedule: Every 1 hour
✓ Check time: Every 1 minute
✓ Health check: Every 30 minutes (optional)
✗ Don't poll continuously (wastes bandwidth)
```

### 2. **Offline Handling**
```python
# Store schedule locally
import json

def save_schedule_locally(schedule):
    with open('schedule_cache.json', 'w') as f:
        json.dump(schedule, f)

def load_schedule_locally():
    try:
        with open('schedule_cache.json', 'r') as f:
            return json.load(f)
    except:
        return []
```

### 3. **Time Synchronization**
```python
import ntplib
from datetime import datetime

def sync_time_with_ntp():
    try:
        client = ntplib.NTPClient()
        response = client.request('pool.ntp.org')
        return datetime.fromtimestamp(response.tx_time)
    except:
        return datetime.now()
```

### 4. **Logging**
```python
import logging

logging.basicConfig(
    filename='hardware.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logging.info("Device started")
logging.info(f"Dispensed from slot A1")
logging.error(f"Failed to update status: {error}")
```

---

## 🎯 Summary - What Your Hardware Must Do

### Required Endpoints (Minimum):
1. ✅ **GET /schedule** - Fetch medicines (every hour)
2. ✅ **POST /update-status** - Report dispense (after each dispense)

### Optional but Recommended:
3. ✅ **GET /health** - Check connection (every 30 min)
4. ✅ **POST /register** - Register device (on first setup)
5. ✅ **GET /slots** - Display slot info (on LCD/screen)

### Hardware Logic:
```
1. Connect to WiFi
2. Fetch schedule
3. Store schedule in memory
4. Every minute:
   - Check if current time matches any scheduled time
   - If yes: Dispense + Update status
5. Every hour:
   - Fetch new schedule
```

---

## 📞 Need Help?

Check these files:
- `backend/README.md` - Complete API documentation
- `backend/API_TESTING.md` - Testing examples
- `backend/ARCHITECTURE.md` - System architecture

---

**Your hardware is ready to connect! 🚀**

Start with the Python example for quick testing, then implement in your hardware platform (Arduino, ESP32, Raspberry Pi, etc.)
