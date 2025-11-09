# ✅ Hardware API - Complete Setup

## 🎉 What's Done

✅ **Server Running** on `http://192.168.0.249:5000`  
✅ **GET Methods** - Send data to hardware/mobile app  
✅ **POST Methods** - Receive status updates from hardware  
✅ **Smart Logic** - Auto-moves medicines between datasets  
✅ **Snooze Tracking** - Moves to missed after 2 snoozes  
✅ **Console Logging** - See real-time updates  
✅ **No MongoDB** - Uses mock data (no database needed)  

---

## 📡 API Endpoints Available

### UPCOMING MEDICINES
- **GET** `http://192.168.0.249:5000/api/hardware/upcoming` - Fetch list
- **POST** `http://192.168.0.249:5000/api/hardware/upcoming` - Update status

### TAKEN MEDICINES
- **GET** `http://192.168.0.249:5000/api/hardware/taken` - Fetch list
- **POST** `http://192.168.0.249:5000/api/hardware/taken` - Confirm taken

### MISSED MEDICINES
- **GET** `http://192.168.0.249:5000/api/hardware/missed` - Fetch list
- **POST** `http://192.168.0.249:5000/api/hardware/missed` - Confirm missed

---

## 🔄 How It Works

### 1. Hardware Fetches Upcoming (GET)
```javascript
fetch('http://192.168.0.249:5000/api/hardware/upcoming')
  .then(res => res.json())
  .then(data => console.log(data.data));
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
      "status": "pending"
    }
  ]
}
```

### 2. Hardware Sends Status Update (POST)
```javascript
fetch('http://192.168.0.249:5000/api/hardware/upcoming', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: '1', status: 'taken' })
});
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

### 3. Mobile App Fetches Taken (GET)
```javascript
fetch('http://192.168.0.249:5000/api/hardware/taken')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

---

## 🎯 Status Logic

### Medicine States
```
pending → taken (moves to taken dataset)
pending → snoozed (1st time, stays in upcoming)
pending → snoozed (2nd time, stays in upcoming)
pending → snoozed (3rd time, moves to missed)
pending → missed (moves to missed dataset)
```

### Snooze Count Tracking
```javascript
// Tracked automatically
medicine.snoozeCount = 0  // Initial
medicine.snoozeCount = 1  // After 1st snooze
medicine.snoozeCount = 2  // After 2nd snooze
medicine.snoozeCount = 3  // Moves to missed
```

---

## 📱 Integration Examples

### React Native (Mobile App)
```javascript
// Fetch upcoming
const fetchUpcoming = async () => {
  const res = await fetch('http://192.168.0.249:5000/api/hardware/upcoming');
  const data = await res.json();
  setMedicines(data.data);
};

// Fetch taken
const fetchTaken = async () => {
  const res = await fetch('http://192.168.0.249:5000/api/hardware/taken');
  const data = await res.json();
  setTakenMedicines(data.data);
};

// Fetch missed
const fetchMissed = async () => {
  const res = await fetch('http://192.168.0.249:5000/api/hardware/missed');
  const data = await res.json();
  setMissedMedicines(data.data);
};
```

### Arduino/ESP32 (Hardware)
```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* SERVER = "http://192.168.0.249:5000/api/hardware";

void sendStatus(String id, String status) {
  HTTPClient http;
  http.begin(String(SERVER) + "/upcoming");
  http.addHeader("Content-Type", "application/json");
  
  String body = "{\"id\":\"" + id + "\",\"status\":\"" + status + "\"}";
  int code = http.POST(body);
  
  if (code == 200) {
    Serial.println("Status updated!");
  }
  http.end();
}

void loop() {
  // After dispensing
  sendStatus("1", "taken");
  delay(60000);
}
```

### Python (Raspberry Pi)
```python
import requests

SERVER = "http://192.168.0.249:5000/api/hardware"

def send_status(med_id, status):
    url = f"{SERVER}/upcoming"
    data = {"id": med_id, "status": status}
    response = requests.post(url, json=data)
    print(response.json())

# After dispensing
send_status("1", "taken")
```

---

## 🧪 Test Right Now!

### Browser Test (Easy!)
Open browser and paste:
```
http://192.168.0.249:5000/api/hardware/upcoming
http://192.168.0.249:5000/api/hardware/taken
http://192.168.0.249:5000/api/hardware/missed
```

### CMD Test (Windows)
```cmd
curl http://192.168.0.249:5000/api/hardware/upcoming
```

### Postman Test
1. Open Postman
2. Create new POST request
3. URL: `http://192.168.0.249:5000/api/hardware/upcoming`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "id": "1",
  "status": "taken"
}
```
6. Click Send

---

## 📊 Mock Data Included

| ID | Medicine | Status | Slot | Time |
|----|----------|--------|------|------|
| 1 | Aspirin | pending | 1 | 08:00 |
| 2 | Vitamin D | pending | 2 | 14:00 |
| 3 | Calcium | pending | 3 | 20:00 |
| 4 | Paracetamol | taken | 4 | 06:00 |
| 5 | Ibuprofen | missed | 1 | 10:00 |
| 6 | Antibiotic | snoozed | 2 | 12:00 |

---

## ⚠️ Important Notes

1. **Data is NOT saved** - Mock data in memory only
2. **Server restart** - Resets all data to original mock data
3. **Same WiFi** - Hardware must be on same network (192.168.0.x)
4. **Console logs** - Check server console for real-time updates
5. **Status updates** - Only affect mock data, not saved to database

---

## 🎯 Next Steps

### For Mobile App Developer:
1. Use GET endpoints to fetch data
2. Display in UI (upcoming, taken, missed)
3. Refresh every 30 seconds

### For Hardware Developer:
1. Use GET to fetch upcoming medicines
2. Check every 1 minute if time matches
3. Dispense medicine
4. Use POST to update status

### For Testing:
1. Use Postman for POST requests
2. Use browser for GET requests
3. Watch server console for logs

---

## 📞 Quick Reference

| What | Value |
|------|-------|
| **Server IP** | 192.168.0.249 |
| **Port** | 5000 |
| **Base URL** | http://192.168.0.249:5000/api/hardware |
| **Auth** | None (public endpoints) |
| **Data** | Mock (in-memory) |
| **Snooze Limit** | 2 times |

---

## 📚 Documentation Files

- `HARDWARE_GET_POST_GUIDE.md` - Complete API guide
- `TESTING_INSTRUCTIONS.md` - Testing steps
- `test-hardware-flow.bat` - CMD test script
- `test-hardware-flow.ps1` - PowerShell test script

---

## ✅ Checklist

- [x] Server running on IP address
- [x] GET methods working
- [x] POST methods implemented
- [x] Snooze logic added
- [x] Dataset movement logic added
- [x] Console logging added
- [x] Mock data ready
- [x] Documentation complete

---

**Everything is ready! Start testing with Postman or browser now!** 🚀

Server logs will show:
```
📥 Received from hardware - Upcoming medicine update: ID=1, Status=taken
✅ Medicine "Aspirin" moved to TAKEN
```

Happy testing! 🎉
