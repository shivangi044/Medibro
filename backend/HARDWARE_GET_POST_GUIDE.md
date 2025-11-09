# 🔄 Hardware API - GET & POST Methods

## 📡 Complete API Flow

Each endpoint now has **both GET and POST** methods:
- **GET** - Backend sends data to hardware/mobile app
- **POST** - Hardware sends status updates back to backend

---

## 🎯 API Endpoints

### 1. UPCOMING MEDICINES

#### GET /api/hardware/upcoming
**Purpose:** Backend sends list of upcoming medicines to hardware  
**Called by:** Hardware device, Mobile app  

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "1",
      "medicineName": "Aspirin",
      "dosage": "100mg",
      "slot": 1,
      "scheduledTime": "08:00",
      "status": "pending"
    }
  ]
}
```

#### POST /api/hardware/upcoming
**Purpose:** Hardware sends status update after dispensing  
**Called by:** Hardware device  

**Request Body:**
```json
{
  "id": "1",
  "status": "taken"
}
```

**Status options:**
- `taken` - Medicine dispensed successfully → Moves to **taken** dataset
- `snoozed` - User delayed → Stays in **upcoming** (if ≤2 times) or moves to **missed** (if >2 times)
- `missed` - User missed it → Moves to **missed** dataset

**Response:**
```json
{
  "success": true,
  "message": "Upcoming medicine status received successfully",
  "data": {
    "id": "1",
    "medicineName": "Aspirin",
    "status": "taken",
    "snoozeCount": 0,
    "movedTo": "taken dataset"
  }
}
```

---

### 2. TAKEN MEDICINES

#### GET /api/hardware/taken
**Purpose:** Backend sends list of taken medicines to mobile app  
**Called by:** Mobile app  

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "4",
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "slot": 4,
      "scheduledTime": "06:00",
      "takenTime": "2024-01-15T06:05:00.000Z",
      "status": "taken"
    }
  ]
}
```

#### POST /api/hardware/taken
**Purpose:** Hardware confirms medicine was taken or snoozed again  
**Called by:** Hardware device  

**Request Body:**
```json
{
  "id": "4",
  "status": "taken"
}
```

**Status options:**
- `taken` - Confirmed as taken
- `snoozed` - Snoozed again (if >2 times → moves to **missed**)

**Response:**
```json
{
  "success": true,
  "message": "Taken medicine status received successfully",
  "data": {
    "id": "4",
    "medicineName": "Paracetamol",
    "status": "taken",
    "snoozeCount": 0,
    "takenTime": "2024-01-15T06:05:00.000Z",
    "movedTo": "taken dataset"
  }
}
```

---

### 3. MISSED MEDICINES

#### GET /api/hardware/missed
**Purpose:** Backend sends list of missed/snoozed medicines to mobile app  
**Called by:** Mobile app  

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "5",
      "medicineName": "Ibuprofen",
      "dosage": "200mg",
      "slot": 1,
      "scheduledTime": "10:00",
      "status": "missed"
    },
    {
      "id": "6",
      "medicineName": "Antibiotic",
      "dosage": "250mg",
      "slot": 2,
      "scheduledTime": "12:00",
      "status": "snoozed",
      "snoozedUntil": "2024-01-15T12:30:00.000Z"
    }
  ]
}
```

#### POST /api/hardware/missed
**Purpose:** Hardware confirms medicine was missed  
**Called by:** Hardware device  

**Request Body:**
```json
{
  "id": "5",
  "status": "missed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Missed medicine status received successfully",
  "data": {
    "id": "5",
    "medicineName": "Ibuprofen",
    "status": "missed",
    "missedTime": "2024-01-15T10:30:00.000Z",
    "movedTo": "missed dataset"
  }
}
```

---

## 🔄 Logic Flow

### Snooze Count Logic
```
Snooze Count = 0 → Status: pending (upcoming)
Snooze Count = 1 → Status: snoozed (upcoming)
Snooze Count = 2 → Status: snoozed (upcoming)
Snooze Count > 2 → Status: missed (moved to missed)
```

### Medicine Movement
```
UPCOMING (pending)
    ↓
    ├─ taken → TAKEN dataset
    ├─ snoozed (≤2) → Stay in UPCOMING
    ├─ snoozed (>2) → MISSED dataset
    └─ missed → MISSED dataset

TAKEN
    ↓
    └─ snoozed (>2) → MISSED dataset

MISSED
    ↓
    └─ Stays in MISSED
```

---

## 🧪 Testing with cURL (Windows CMD)

### 1. Test UPCOMING APIs

**GET - Fetch upcoming medicines:**
```cmd
curl http://192.168.0.247:5000/api/hardware/upcoming
```

**POST - Hardware reports medicine taken:**
```cmd
curl -X POST http://192.168.0.247:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"taken\"}"
```

**POST - Hardware reports medicine snoozed:**
```cmd
curl -X POST http://192.168.0.247:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"2\",\"status\":\"snoozed\"}"
```

**POST - Hardware reports medicine missed:**
```cmd
curl -X POST http://192.168.0.247:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"3\",\"status\":\"missed\"}"
```

### 2. Test TAKEN APIs

**GET - Fetch taken medicines:**
```cmd
curl http://192.168.0.247:5000/api/hardware/taken
```

**POST - Hardware confirms taken:**
```cmd
curl -X POST http://192.168.0.247:5000/api/hardware/taken ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"4\",\"status\":\"taken\"}"
```

### 3. Test MISSED APIs

**GET - Fetch missed medicines:**
```cmd
curl http://192.168.0.247:5000/api/hardware/missed
```

**POST - Hardware confirms missed:**
```cmd
curl -X POST http://192.168.0.247:5000/api/hardware/missed ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"5\",\"status\":\"missed\"}"
```

---

## 🤖 Hardware Integration Example

### Arduino/ESP32 Code
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SERVER = "http://192.168.0.247:5000/api/hardware";

// 1. Fetch upcoming medicines
void fetchUpcoming() {
  HTTPClient http;
  http.begin(String(SERVER) + "/upcoming");
  
  int httpCode = http.GET();
  if (httpCode == 200) {
    String response = http.getString();
    // Parse JSON and process medicines
  }
  http.end();
}

// 2. Send status update
void updateMedicineStatus(String id, String status) {
  HTTPClient http;
  http.begin(String(SERVER) + "/upcoming");
  http.addHeader("Content-Type", "application/json");
  
  String body = "{\"id\":\"" + id + "\",\"status\":\"" + status + "\"}";
  int httpCode = http.POST(body);
  
  if (httpCode == 200) {
    Serial.println("Status updated successfully");
  }
  http.end();
}

void loop() {
  // Fetch upcoming every 1 hour
  fetchUpcoming();
  
  // After dispensing medicine
  updateMedicineStatus("1", "taken");
  
  delay(3600000); // 1 hour
}
```

### Python Code (Raspberry Pi)
```python
import requests

SERVER = "http://192.168.0.247:5000/api/hardware"

# 1. Fetch upcoming medicines
def fetch_upcoming():
    response = requests.get(f"{SERVER}/upcoming")
    data = response.json()
    return data['data']

# 2. Send status update
def update_medicine(medicine_id, status):
    payload = {
        "id": medicine_id,
        "status": status
    }
    response = requests.post(f"{SERVER}/upcoming", json=payload)
    return response.json()

# Example usage
medicines = fetch_upcoming()
print(f"Upcoming medicines: {len(medicines)}")

# After dispensing
result = update_medicine("1", "taken")
print(f"Result: {result['message']}")
```

---

## 📱 Mobile App Integration

### Fetch Upcoming (React Native)
```javascript
const fetchUpcoming = async () => {
  const response = await fetch('http://192.168.0.247:5000/api/hardware/upcoming');
  const data = await response.json();
  setUpcomingMedicines(data.data);
};
```

### Fetch Taken
```javascript
const fetchTaken = async () => {
  const response = await fetch('http://192.168.0.247:5000/api/hardware/taken');
  const data = await response.json();
  setTakenMedicines(data.data);
};
```

### Fetch Missed
```javascript
const fetchMissed = async () => {
  const response = await fetch('http://192.168.0.247:5000/api/hardware/missed');
  const data = await response.json();
  setMissedMedicines(data.data);
};
```

---

## 📊 Complete Testing Sequence

### Test 1: Medicine Taken Flow
```cmd
REM 1. Get upcoming medicines
curl http://192.168.0.247:5000/api/hardware/upcoming

REM 2. Hardware dispenses medicine
curl -X POST http://192.168.0.247:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"taken\"}"

REM 3. Verify it's now in taken
curl http://192.168.0.247:5000/api/hardware/taken
```

### Test 2: Snooze Flow (Normal)
```cmd
REM Snooze 1st time
curl -X POST http://192.168.0.247:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"2\",\"status\":\"snoozed\"}"

REM Still in upcoming
curl http://192.168.0.247:5000/api/hardware/upcoming
```

### Test 3: Snooze Flow (>2 times → Missed)
```cmd
REM Snooze 1st time
curl -X POST http://192.168.0.247:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"3\",\"status\":\"snoozed\"}"

REM Snooze 2nd time
curl -X POST http://192.168.0.247:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"3\",\"status\":\"snoozed\"}"

REM Snooze 3rd time - moves to missed
curl -X POST http://192.168.0.247:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"3\",\"status\":\"snoozed\"}"

REM Verify it's now in missed
curl http://192.168.0.247:5000/api/hardware/missed
```

---

## 🎯 Data Flow Diagram

```
┌─────────────┐                    ┌─────────────┐
│  Hardware   │                    │   Backend   │
│   Device    │                    │   Server    │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  GET /upcoming                   │
       │─────────────────────────────────>│
       │                                  │
       │  [Medicine List]                 │
       │<─────────────────────────────────│
       │                                  │
       │  (User takes medicine)           │
       │                                  │
       │  POST /upcoming                  │
       │  {id: "1", status: "taken"}      │
       │─────────────────────────────────>│
       │                                  │
       │  (Backend moves to taken)        │
       │                                  │
       │  [Success Response]              │
       │<─────────────────────────────────│
       │                                  │
```

---

## ✅ Key Features

✅ **Bidirectional Communication** - GET to send, POST to receive  
✅ **Smart Snooze Logic** - Auto-moves to missed after 2 snoozes  
✅ **Real-time Updates** - Hardware status immediately reflected  
✅ **No Database** - Uses in-memory mock data (won't persist)  
✅ **Console Logging** - See all updates in server console  

---

## 📝 Important Notes

1. **Data is NOT saved** - Mock data in memory, resets on server restart
2. **Snooze count tracked** - Automatically moves to missed after 2 snoozes
3. **Real-time console logs** - Check server console for all updates
4. **Same structure** - POST request uses same structure as GET response

---

**Start testing:** `node server.js` and use the cURL commands above! 🚀
