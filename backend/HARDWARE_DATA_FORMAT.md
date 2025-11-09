# 📡 Hardware Data Format Reference

## 🎯 Data Format for POST Requests from Hardware

---

## 1️⃣ POST `/api/hardware/upcoming` - Update Medicine Status

### Use Case:
Hardware sends status updates when:
- Medicine is taken from dispenser
- User presses snooze button
- Medicine time is missed

### Request Format:
```json
{
  "id": "1",
  "status": "taken",
  "snoozeCount": 0
}
```

### Field Details:
| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `id` | String | ✅ Yes | "1", "2", "3", etc. | Medicine ID from GET /upcoming |
| `status` | String | ✅ Yes | "taken", "snoozed", "missed" | Current status |
| `snoozeCount` | Number | ❌ Optional | 0, 1, 2, 3, etc. | Current snooze count (backend auto-increments if omitted) |

### Valid Status Values:
- **`"taken"`** - Medicine dispensed and taken by user
- **`"snoozed"`** - User pressed snooze button (will auto-move to missed after 2 snoozes)
- **`"missed"`** - User didn't take medicine, time passed

### Complete Examples:

#### Example 1: Medicine Taken
```json
{
  "id": "1",
  "status": "taken"
}
```
**Result:** Medicine moves from upcoming → taken dataset

#### Example 2: Medicine Snoozed (1st time)
```json
{
  "id": "2",
  "status": "snoozed",
  "snoozeCount": 1
}
```
**Result:** Medicine stays in upcoming, snoozeCount = 1

#### Example 3: Medicine Snoozed (3rd time)
```json
{
  "id": "2",
  "status": "snoozed",
  "snoozeCount": 3
}
```
**Result:** Medicine moves to missed (snoozeCount > 2)

#### Example 4A: Medicine Snoozed (Backend auto-increment)
```json
{
  "id": "2",
  "status": "snoozed"
}
```
**Result:** Backend automatically increments snoozeCount

#### Example 4B: Medicine Missed
```json
{
  "id": "3",
  "status": "missed"
}
```
**Result:** Medicine moves from upcoming → missed dataset

---

## 2️⃣ POST `/api/hardware/taken` - Confirm Taken Medicine

### Use Case:
Hardware sends confirmation when user acknowledges a taken medicine in the app/hardware

### Request Format:
```json
{
  "id": "4",
  "status": "taken"
}
```

### Field Details:
| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `id` | String | ✅ Yes | "1", "2", "3", etc. | Medicine ID from GET /taken |
| `status` | String | ✅ Yes | "taken" | Must be "taken" |

### Complete Example:
```json
{
  "id": "4",
  "status": "taken"
}
```
**Result:** Updates confirmation timestamp

---

## 3️⃣ POST `/api/hardware/missed` - Confirm Missed Medicine

### Use Case:
Hardware sends confirmation when user acknowledges a missed medicine in the app/hardware

### Request Format:
```json
{
  "id": "5",
  "status": "missed"
}
```

### Field Details:
| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `id` | String | ✅ Yes | "1", "2", "3", etc. | Medicine ID from GET /missed |
| `status` | String | ✅ Yes | "missed" | Must be "missed" |

### Complete Example:
```json
{
  "id": "5",
  "status": "missed"
}
```
**Result:** Updates confirmation timestamp

---

## 📊 Complete Hardware Integration Flow

### Step 1: Hardware Fetches Upcoming Medicines (GET)
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
      "dosage": "1000IU",
      "slot": 2,
      "scheduledTime": "14:00",
      "status": "snoozed",
      "snoozeCount": 2,
      "snoozedUntil": "2025-11-09T14:30:00.000Z"
    },
    {
      "id": "3",
      "medicineName": "Calcium",
      "dosage": "500mg",
      "slot": 3,
      "scheduledTime": "20:00",
      "status": "pending",
      "snoozeCount": 0
    }
  ]
}
```

**Note:** `snoozeCount` is now included in all GET responses!

### Step 2: Hardware Checks Time and Dispenses
```cpp
// Arduino/ESP32 pseudocode
if (currentTime == medicine.scheduledTime) {
  dispenseMedicine(medicine.slot);
  
  // Wait for user confirmation
  if (userTookMedicine()) {
    sendStatus(medicine.id, "taken");
  }
  else if (userPressedSnooze()) {
    sendStatus(medicine.id, "snoozed");
  }
  else if (timePassed(5)) { // 5 minutes passed
    sendStatus(medicine.id, "missed");
  }
}
```

### Step 3: Hardware Sends Status Update (POST)
```http
POST http://192.168.0.249:5000/api/hardware/upcoming
Content-Type: application/json

{
  "id": "1",
  "status": "taken",
  "snoozeCount": 0
}
```

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

**Note:** `snoozeCount` is optional in POST - backend will auto-increment if not provided!

---

## 🔧 Hardware Code Examples

### Arduino/ESP32 Example
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SERVER = "http://192.168.0.249:5000/api/hardware";

void sendMedicineStatus(String medicineId, String status) {
  HTTPClient http;
  http.begin(String(SERVER) + "/upcoming");
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["id"] = medicineId;
  doc["status"] = status;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  int httpCode = http.POST(jsonString);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("✅ Status updated: " + response);
  } else {
    Serial.println("❌ Error: " + String(httpCode));
  }
  
  http.end();
}

void loop() {
  // Example: Medicine taken
  sendMedicineStatus("1", "taken");
  delay(60000);
  
  // Example: Medicine snoozed
  sendMedicineStatus("2", "snoozed");
  delay(60000);
  
  // Example: Medicine missed
  sendMedicineStatus("3", "missed");
  delay(60000);
}
```

### Python (Raspberry Pi) Example
```python
import requests
import json

SERVER = "http://192.168.0.249:5000/api/hardware"

def send_medicine_status(medicine_id, status):
    url = f"{SERVER}/upcoming"
    
    # Data to send
    data = {
        "id": medicine_id,
        "status": status
    }
    
    # Send POST request
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        print(f"✅ Status updated: {response.json()}")
    else:
        print(f"❌ Error: {response.status_code}")

# Examples
send_medicine_status("1", "taken")
send_medicine_status("2", "snoozed")
send_medicine_status("3", "missed")
```

### React Native (Mobile App) Example
```javascript
const sendMedicineStatus = async (medicineId, status) => {
  try {
    const response = await fetch(
      'http://192.168.0.249:5000/api/hardware/upcoming',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: medicineId,
          status: status,
        }),
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Status updated:', data);
      Alert.alert('Success', `Medicine ${status}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    Alert.alert('Error', 'Failed to update status');
  }
};

// Usage examples
<Button 
  title="Mark as Taken" 
  onPress={() => sendMedicineStatus('1', 'taken')} 
/>

<Button 
  title="Snooze" 
  onPress={() => sendMedicineStatus('1', 'snoozed')} 
/>

<Button 
  title="Mark as Missed" 
  onPress={() => sendMedicineStatus('1', 'missed')} 
/>
```

---

## ❌ Invalid Data Examples (Will Fail)

### ❌ Missing Required Fields
```json
{
  "id": "1"
}
```
**Error:** Missing `status` field

### ❌ Invalid Status Value
```json
{
  "id": "1",
  "status": "completed"
}
```
**Error:** `status` must be "taken", "snoozed", or "missed"

### ❌ Missing ID
```json
{
  "status": "taken"
}
```
**Error:** Missing `id` field

### ❌ Wrong Data Type
```json
{
  "id": 1,
  "status": "taken"
}
```
**Warning:** `id` should be string "1", not number 1 (may work but not recommended)

---

## 🎯 Quick Reference Table

| API Endpoint | Method | Fields | Example |
|--------------|--------|--------|---------|
| `/api/hardware/upcoming` | POST | `id`, `status` | `{"id":"1","status":"taken"}` |
| `/api/hardware/taken` | POST | `id`, `status` | `{"id":"4","status":"taken"}` |
| `/api/hardware/missed` | POST | `id`, `status` | `{"id":"5","status":"missed"}` |

---

## 📝 Testing Commands

### Test Upcoming (Taken)
```bash
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"taken\"}"
```

### Test Upcoming (Snoozed)
```bash
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"2\",\"status\":\"snoozed\"}"
```

### Test Upcoming (Missed)
```bash
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"3\",\"status\":\"missed\"}"
```

### Test Taken Confirmation
```bash
curl -X POST http://192.168.0.249:5000/api/hardware/taken ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"4\",\"status\":\"taken\"}"
```

### Test Missed Confirmation
```bash
curl -X POST http://192.168.0.249:5000/api/hardware/missed ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"5\",\"status\":\"missed\"}"
```

---

## ✅ Summary

**Hardware must send exactly 2 fields:**
1. **`id`** (String) - Medicine ID from GET response
2. **`status`** (String) - One of: "taken", "snoozed", "missed"

**That's it! Simple and clean.** 🎉

Copy this exact format for your hardware code!
