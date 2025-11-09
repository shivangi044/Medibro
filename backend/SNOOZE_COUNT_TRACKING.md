# 🔄 Snooze Count Tracking - Hardware ↔️ Backend

## 📊 Overview

The `snoozeCount` variable is now **transferred bidirectionally** between hardware and backend:
- **Backend → Hardware (GET)**: Backend sends current snoozeCount
- **Hardware → Backend (POST)**: Hardware can send updated snoozeCount
- **Auto-increment**: If hardware doesn't send snoozeCount, backend auto-increments it

---

## 📡 Data Format with snoozeCount

### 1️⃣ GET `/api/hardware/upcoming` - Backend sends snoozeCount

**Request:**
```http
GET http://192.168.0.249:5000/api/hardware/upcoming
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "1",
      "medicineName": "Aspirin",
      "dosage": "100mg",
      "slot": 1,
      "scheduledTime": "08:00",
      "status": "pending",
      "snoozeCount": 0
    },
    {
      "id": "2",
      "medicineName": "Vitamin D",
      "dosage": "50mg",
      "slot": 2,
      "scheduledTime": "14:00",
      "status": "snoozed",
      "snoozeCount": 2,
      "snoozedUntil": "2025-11-09T14:30:00.000Z"
    }
  ]
}
```

**Note:** Hardware receives `snoozeCount` for each medicine!

---

### 2️⃣ POST `/api/hardware/upcoming` - Hardware sends snoozeCount

#### Option A: Hardware tracks snoozeCount (Recommended)
**Request:**
```json
{
  "id": "1",
  "status": "snoozed",
  "snoozeCount": 1
}
```

**Backend Response:**
```json
{
  "success": true,
  "message": "Upcoming medicine status received successfully",
  "data": {
    "id": "1",
    "medicineName": "Aspirin",
    "status": "snoozed",
    "snoozeCount": 1,
    "movedTo": "upcoming dataset"
  }
}
```

#### Option B: Backend auto-increments (Fallback)
**Request:**
```json
{
  "id": "1",
  "status": "snoozed"
}
```

**Backend Response:**
```json
{
  "success": true,
  "message": "Upcoming medicine status received successfully",
  "data": {
    "id": "1",
    "medicineName": "Aspirin",
    "status": "snoozed",
    "snoozeCount": 1,
    "movedTo": "upcoming dataset"
  }
}
```

**Note:** If hardware doesn't send `snoozeCount`, backend automatically increments it!

---

## 🎯 Complete Flow Example

### Scenario: User snoozes medicine 3 times

#### **Snooze 1:**
```json
// Hardware → Backend
POST /api/hardware/upcoming
{
  "id": "1",
  "status": "snoozed",
  "snoozeCount": 1
}

// Backend Response
{
  "success": true,
  "data": {
    "status": "snoozed",
    "snoozeCount": 1,
    "movedTo": "upcoming dataset"
  }
}
```

#### **Snooze 2:**
```json
// Hardware → Backend
POST /api/hardware/upcoming
{
  "id": "1",
  "status": "snoozed",
  "snoozeCount": 2
}

// Backend Response
{
  "success": true,
  "data": {
    "status": "snoozed",
    "snoozeCount": 2,
    "movedTo": "upcoming dataset"
  }
}
```

#### **Snooze 3 (Auto-moves to Missed):**
```json
// Hardware → Backend
POST /api/hardware/upcoming
{
  "id": "1",
  "status": "snoozed",
  "snoozeCount": 3
}

// Backend Response
{
  "success": true,
  "data": {
    "status": "missed",
    "snoozeCount": 3,
    "movedTo": "missed dataset"  ← Automatically moved!
  }
}
```

**Server Console:**
```
📥 Received from hardware - Upcoming medicine update: ID=1, Status=snoozed, SnoozeCount=3
⏰ Hardware sent snoozeCount: 3
❌ Medicine "Aspirin" snoozed 3 times - moved to MISSED
```

---

## 🔄 Both Tracking Methods Work

### Method 1: Hardware Tracks snoozeCount (Recommended)

```cpp
// Arduino/ESP32 Code
int snoozeCount = 0;  // Hardware variable

void onSnoozeButtonPressed() {
  snoozeCount++;  // Increment on hardware
  
  // Send to backend
  sendStatus(medicineId, "snoozed", snoozeCount);
  
  if (snoozeCount > 2) {
    displayMessage("Medicine Missed!");
    snoozeCount = 0;  // Reset
  }
}

void sendStatus(String id, String status, int count) {
  StaticJsonDocument<200> doc;
  doc["id"] = id;
  doc["status"] = status;
  doc["snoozeCount"] = count;  // Send count
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  http.POST(jsonString);
}
```

### Method 2: Backend Auto-Increments (Fallback)

```cpp
// Arduino/ESP32 Code (Simpler)
void onSnoozeButtonPressed() {
  // Just send status, backend will track count
  sendStatus(medicineId, "snoozed");
}

void sendStatus(String id, String status) {
  StaticJsonDocument<200> doc;
  doc["id"] = id;
  doc["status"] = status;
  // No snoozeCount - backend increments automatically
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  http.POST(jsonString);
}
```

---

## 📱 Hardware Code Examples

### Arduino/ESP32 - Full Tracking

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SERVER = "http://192.168.0.249:5000/api/hardware";

// Store snooze counts for each medicine slot
int snoozeCounts[4] = {0, 0, 0, 0};  // 4 slots

void fetchUpcomingMedicines() {
  HTTPClient http;
  http.begin(String(SERVER) + "/upcoming");
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    
    DynamicJsonDocument doc(2048);
    deserializeJson(doc, response);
    
    JsonArray medicines = doc["data"];
    
    for (JsonObject med : medicines) {
      String id = med["id"];
      int slot = med["slot"];
      int snoozeCount = med["snoozeCount"];
      
      // Sync snoozeCount from backend
      snoozeCounts[slot - 1] = snoozeCount;
      
      Serial.printf("Medicine %s: Slot %d, SnoozeCount: %d\n", 
                    id.c_str(), slot, snoozeCount);
    }
  }
  
  http.end();
}

void sendMedicineStatus(String id, String status, int slot) {
  HTTPClient http;
  http.begin(String(SERVER) + "/upcoming");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["id"] = id;
  doc["status"] = status;
  
  // If snoozed, send current snoozeCount
  if (status == "snoozed") {
    snoozeCounts[slot - 1]++;  // Increment
    doc["snoozeCount"] = snoozeCounts[slot - 1];
    
    Serial.printf("🔔 Snoozing medicine %s (count: %d)\n", 
                  id.c_str(), snoozeCounts[slot - 1]);
  }
  // If taken, reset snoozeCount
  else if (status == "taken") {
    snoozeCounts[slot - 1] = 0;
    doc["snoozeCount"] = 0;
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("✅ Status updated: " + response);
    
    // Parse response to check if moved to missed
    DynamicJsonDocument resDoc(512);
    deserializeJson(resDoc, response);
    
    String movedTo = resDoc["data"]["movedTo"];
    if (movedTo == "missed dataset") {
      Serial.println("❌ Medicine moved to MISSED (snoozed > 2 times)");
      displayMessage("Medicine Missed!");
      snoozeCounts[slot - 1] = 0;  // Reset
    }
  }
  
  http.end();
}

void loop() {
  // Fetch medicines every minute
  fetchUpcomingMedicines();
  
  // Check if snooze button pressed
  if (snoozeButtonPressed(1)) {
    sendMedicineStatus("1", "snoozed", 1);
  }
  
  // Check if medicine taken
  if (medicineDispensed(1)) {
    sendMedicineStatus("1", "taken", 1);
  }
  
  delay(60000);  // 1 minute
}
```

### Python (Raspberry Pi) - Full Tracking

```python
import requests
import json
from datetime import datetime

SERVER = "http://192.168.0.249:5000/api/hardware"

# Store snooze counts
snooze_counts = {}

def fetch_upcoming_medicines():
    """Fetch medicines and sync snooze counts"""
    response = requests.get(f"{SERVER}/upcoming")
    
    if response.status_code == 200:
        data = response.json()
        
        for med in data['data']:
            med_id = med['id']
            snooze_count = med['snoozeCount']
            
            # Sync snoozeCount from backend
            snooze_counts[med_id] = snooze_count
            
            print(f"Medicine {med['medicineName']}: SnoozeCount={snooze_count}")
    
    return data['data']

def send_medicine_status(med_id, status, slot=None):
    """Send medicine status with snoozeCount"""
    url = f"{SERVER}/upcoming"
    
    data = {
        "id": med_id,
        "status": status
    }
    
    # Track snooze count
    if status == "snoozed":
        # Increment snoozeCount
        if med_id not in snooze_counts:
            snooze_counts[med_id] = 0
        snooze_counts[med_id] += 1
        
        data["snoozeCount"] = snooze_counts[med_id]
        print(f"🔔 Snoozing medicine {med_id} (count: {snooze_counts[med_id]})")
    
    elif status == "taken":
        # Reset snoozeCount
        snooze_counts[med_id] = 0
        data["snoozeCount"] = 0
    
    # Send POST request
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Status updated: {result}")
        
        # Check if moved to missed
        if result['data']['movedTo'] == 'missed dataset':
            print(f"❌ Medicine moved to MISSED (snoozed > 2 times)")
            snooze_counts[med_id] = 0  # Reset

# Example usage
medicines = fetch_upcoming_medicines()

# User presses snooze
send_medicine_status("1", "snoozed")

# User takes medicine
send_medicine_status("2", "taken")
```

---

## 📋 Field Reference

### All GET Responses Include:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | String | Medicine ID | "1" |
| `medicineName` | String | Medicine name | "Aspirin" |
| `dosage` | String | Dosage amount | "100mg" |
| `slot` | Number | Hardware slot number | 1 |
| `scheduledTime` | String | Time (HH:MM) | "08:00" |
| `status` | String | Current status | "pending" |
| **`snoozeCount`** | Number | Snooze attempts | 0, 1, 2, 3 |
| `snoozedUntil` | String (Optional) | Next attempt time | "2025-11-09T08:30:00.000Z" |

### All POST Requests Can Include:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | String | ✅ Yes | Medicine ID | "1" |
| `status` | String | ✅ Yes | Status update | "snoozed" |
| **`snoozeCount`** | Number | ❌ Optional | Current count | 1 |

**Note:** If `snoozeCount` is not sent, backend auto-increments!

---

## 🎯 Snooze Logic Rules

1. **snoozeCount = 0-2**: Medicine stays in "upcoming" with status "snoozed"
2. **snoozeCount > 2**: Medicine automatically moves to "missed" dataset
3. **status = "taken"**: snoozeCount resets to 0
4. **Hardware can send snoozeCount**: Backend uses hardware's value
5. **Hardware omits snoozeCount**: Backend auto-increments

---

## ✅ Summary

### What Changed:
- ✅ **GET responses** now include `snoozeCount` field
- ✅ **POST requests** can optionally include `snoozeCount`
- ✅ **Backend** uses hardware's snoozeCount if provided
- ✅ **Backend** auto-increments if not provided (backward compatible)
- ✅ **Hardware** can track snoozeCount locally or rely on backend

### Benefits:
- 🔄 **Sync**: Hardware and backend stay in sync
- 📊 **Tracking**: Hardware knows exact snooze count
- 🎯 **Control**: Hardware can manage snooze logic
- ⚡ **Fallback**: Backend handles it if hardware doesn't

---

## 🧪 Test Commands

### Test with snoozeCount (Hardware tracking)
```bash
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"snoozed\",\"snoozeCount\":1}"
```

### Test without snoozeCount (Backend auto-increment)
```bash
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"snoozed\"}"
```

### Verify GET includes snoozeCount
```bash
curl http://192.168.0.249:5000/api/hardware/upcoming
```

---

**Both methods work! Hardware decides which approach to use.** ✨
