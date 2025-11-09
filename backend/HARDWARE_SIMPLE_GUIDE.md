# 🔌 Simple Hardware Connection Guide

## ✅ No MongoDB Required | No botId Required | Just Simple Endpoints!

---

## 🎯 3 Main GET Endpoints (For Mobile App to Display)

### 1️⃣ GET Upcoming Medicines
```http
GET http://localhost:5000/api/hardware/upcoming
```

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
    },
    {
      "id": "2",
      "medicineName": "Vitamin D",
      "dosage": "50mg",
      "slot": 2,
      "scheduledTime": "14:00",
      "status": "pending"
    }
  ]
}
```

---

### 2️⃣ GET Taken Medicines
```http
GET http://localhost:5000/api/hardware/taken
```

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

---

### 3️⃣ GET Missed Medicines (includes snoozed)
```http
GET http://localhost:5000/api/hardware/missed
```

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

---

## 🔄 1 POST Endpoint (For Hardware to Update)

### POST Update Status
```http
POST http://localhost:5000/api/hardware/update-status
Content-Type: application/json

{
  "id": "1",
  "status": "taken"
}
```

**Valid Status Values:**
- `pending` - Not yet taken
- `taken` - Successfully dispensed
- `missed` - Past scheduled time, not taken
- `snoozed` - Delayed by 30 minutes
- `skipped` - User manually skipped

**Response:**
```json
{
  "success": true,
  "message": "Medicine status updated successfully",
  "data": {
    "id": "1",
    "medicineName": "Aspirin",
    "dosage": "100mg",
    "slot": 1,
    "scheduledTime": "08:00",
    "status": "taken",
    "takenTime": "2024-01-15T08:00:15.000Z"
  }
}
```

---

## 🚀 Quick Start

### Step 1: Start Backend
```bash
cd backend
npm install
npm run dev
```

### Step 2: Test with Browser/Postman

**Upcoming:**
```
http://localhost:5000/api/hardware/upcoming
```

**Taken:**
```
http://localhost:5000/api/hardware/taken
```

**Missed:**
```
http://localhost:5000/api/hardware/missed
```

---

## 🧪 Test with cURL (Windows CMD)

### Get Upcoming Medicines
```cmd
curl http://localhost:5000/api/hardware/upcoming
```

### Get Taken Medicines
```cmd
curl http://localhost:5000/api/hardware/taken
```

### Get Missed Medicines
```cmd
curl http://localhost:5000/api/hardware/missed
```

### Update Medicine Status
```cmd
curl -X POST http://localhost:5000/api/hardware/update-status ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"taken\"}"
```

---

## 📱 Mobile App Integration

### Display Upcoming Medicines
```javascript
// HomeScreen.js
const fetchUpcoming = async () => {
  const response = await fetch('http://your-server:5000/api/hardware/upcoming');
  const data = await response.json();
  setUpcomingMedicines(data.data);
};
```

### Display Taken Medicines
```javascript
// AnalyticsScreen.js
const fetchTaken = async () => {
  const response = await fetch('http://your-server:5000/api/hardware/taken');
  const data = await response.json();
  setTakenMedicines(data.data);
};
```

### Display Missed Medicines
```javascript
// HomeScreen.js
const fetchMissed = async () => {
  const response = await fetch('http://your-server:5000/api/hardware/missed');
  const data = await response.json();
  setMissedMedicines(data.data);
};
```

---

## 🤖 Hardware Integration

### Arduino/ESP32 Code
```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* SERVER = "http://192.168.1.100:5000/api/hardware";

void updateStatus(String medicineId, String status) {
  HTTPClient http;
  http.begin(SERVER + String("/update-status"));
  http.addHeader("Content-Type", "application/json");
  
  String body = "{\"id\":\"" + medicineId + "\",\"status\":\"" + status + "\"}";
  int httpCode = http.POST(body);
  
  if (httpCode == 200) {
    Serial.println("Status updated!");
  }
  http.end();
}

void loop() {
  // When medicine is dispensed
  updateStatus("1", "taken");
  delay(60000);
}
```

### Python Code
```python
import requests

SERVER = "http://localhost:5000/api/hardware"

def get_upcoming():
    response = requests.get(f"{SERVER}/upcoming")
    return response.json()

def update_status(medicine_id, status):
    payload = {
        "id": medicine_id,
        "status": status
    }
    response = requests.post(f"{SERVER}/update-status", json=payload)
    return response.json()

# Example usage
upcoming = get_upcoming()
print(f"Upcoming medicines: {upcoming['count']}")

# After dispensing
result = update_status("1", "taken")
print(f"Update result: {result['message']}")
```

---

## 📊 Mock Data Included

The backend includes 6 sample medicines:

| ID | Name | Slot | Time | Status |
|----|------|------|------|--------|
| 1 | Aspirin | 1 | 08:00 | pending |
| 2 | Vitamin D | 2 | 14:00 | pending |
| 3 | Calcium | 3 | 20:00 | pending |
| 4 | Paracetamol | 4 | 06:00 | taken |
| 5 | Ibuprofen | 1 | 10:00 | missed |
| 6 | Antibiotic | 2 | 12:00 | snoozed |

---

## 🎯 Workflow

```
Mobile App                    Backend                    Hardware
    |                            |                           |
    |--GET /upcoming----------->|                           |
    |<--[pending medicines]------|                           |
    |                            |                           |
    |                            |<--POST /update-status-----|
    |                            |   {id: "1", status: "taken"}
    |                            |                           |
    |--GET /taken-------------->|                           |
    |<--[taken medicines]--------|                           |
```

---

## ✅ Benefits

✅ **No MongoDB setup needed** - Uses in-memory mock data  
✅ **No authentication** - Simple GET/POST requests  
✅ **No botId required** - Direct endpoint access  
✅ **Easy testing** - Works with browser/curl/Postman  
✅ **Ready to integrate** - Just 4 simple endpoints  

---

## 🔗 API Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/upcoming` | Get pending medicines | ❌ No |
| GET | `/taken` | Get completed medicines | ❌ No |
| GET | `/missed` | Get missed/snoozed medicines | ❌ No |
| POST | `/update-status` | Update medicine status | ❌ No |
| GET | `/health` | Check API status | ❌ No |

---

## 🆘 Troubleshooting

**Problem:** "Cannot connect to server"
- ✅ Check backend is running: `npm run dev`
- ✅ Check port 5000 is not blocked
- ✅ Use correct IP address

**Problem:** "Empty data array"
- ✅ This is normal - mock data is filtered by date
- ✅ Mock data resets on server restart

**Problem:** "CORS error in browser"
- ✅ Backend already has CORS enabled
- ✅ Check server logs for errors

---

**Ready to test?** Just run `npm run dev` and open browser! 🚀
