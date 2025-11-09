# 🎯 Quick Testing Guide - Hardware API

## ✅ Your Server is Running on:
```
http://192.168.0.249:5000
```

---

## 🧪 Test Using Browser (Easy!)

### 1. Test GET Requests (Open in Browser)

**Upcoming Medicines:**
```
http://192.168.0.249:5000/api/hardware/upcoming
```

**Taken Medicines:**
```
http://192.168.0.249:5000/api/hardware/taken
```

**Missed Medicines:**
```
http://192.168.0.249:5000/api/hardware/missed
```

---

## 🔄 Test POST Requests (Use Postman or cURL)

### Using Postman:

**1. Test Medicine Taken**
- Method: `POST`
- URL: `http://192.168.0.249:5000/api/hardware/upcoming`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "id": "1",
  "status": "taken"
}
```

**2. Test Medicine Snoozed**
- Method: `POST`
- URL: `http://192.168.0.249:5000/api/hardware/upcoming`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "id": "2",
  "status": "snoozed"
}
```

**3. Test Snooze Again (2nd time)**
- Method: `POST`
- URL: `http://192.168.0.249:5000/api/hardware/upcoming`
- Body (raw JSON):
```json
{
  "id": "2",
  "status": "snoozed"
}
```

**4. Test Snooze 3rd Time (Moves to Missed)**
- Method: `POST`
- URL: `http://192.168.0.249:5000/api/hardware/upcoming`
- Body (raw JSON):
```json
{
  "id": "2",
  "status": "snoozed"
}
```

**5. Test Medicine Missed**
- Method: `POST`
- URL: `http://192.168.0.249:5000/api/hardware/upcoming`
- Body (raw JSON):
```json
{
  "id": "3",
  "status": "missed"
}
```

---

## 🖥️ Using CMD (Command Prompt)

Open CMD and run these commands:

### GET Requests
```cmd
curl http://192.168.0.249:5000/api/hardware/upcoming
curl http://192.168.0.249:5000/api/hardware/taken
curl http://192.168.0.249:5000/api/hardware/missed
```

### POST Requests
```cmd
REM Medicine Taken
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming -H "Content-Type: application/json" -d "{\"id\":\"1\",\"status\":\"taken\"}"

REM Medicine Snoozed (1st time)
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming -H "Content-Type: application/json" -d "{\"id\":\"2\",\"status\":\"snoozed\"}"

REM Medicine Snoozed (2nd time)
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming -H "Content-Type: application/json" -d "{\"id\":\"2\",\"status\":\"snoozed\"}"

REM Medicine Snoozed (3rd time - moves to missed)
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming -H "Content-Type: application/json" -d "{\"id\":\"2\",\"status\":\"snoozed\"}"

REM Medicine Missed
curl -X POST http://192.168.0.249:5000/api/hardware/upcoming -H "Content-Type: application/json" -d "{\"id\":\"3\",\"status\":\"missed\"}"
```

---

## 📱 Test from Mobile Phone (Same WiFi)

Open browser on your phone and visit:
```
http://192.168.0.249:5000/api/hardware/upcoming
http://192.168.0.249:5000/api/hardware/taken
http://192.168.0.249:5000/api/hardware/missed
```

---

## 📊 Expected Results

### Before Any POST:
- **Upcoming**: Aspirin, Vitamin D, Calcium (3 medicines)
- **Taken**: Paracetamol (1 medicine)
- **Missed**: Ibuprofen, Antibiotic (2 medicines)

### After POST Medicine "1" Taken:
- **Upcoming**: Vitamin D, Calcium (2 medicines) ← Aspirin removed
- **Taken**: Paracetamol, Aspirin (2 medicines) ← Aspirin added
- **Missed**: Ibuprofen, Antibiotic (2 medicines) ← No change

### After POST Medicine "2" Snoozed 3 Times:
- **Upcoming**: Calcium (1 medicine) ← Vitamin D removed
- **Taken**: Paracetamol, Aspirin (2 medicines) ← No change
- **Missed**: Ibuprofen, Antibiotic, Vitamin D (3 medicines) ← Vitamin D added

---

## 🎯 What to Check in Server Console

When you send POST requests, you should see console logs like:

```
📥 Received from hardware - Upcoming medicine update: ID=1, Status=taken
✅ Medicine "Aspirin" moved to TAKEN

📥 Received from hardware - Upcoming medicine update: ID=2, Status=snoozed
⏰ Medicine "Vitamin D" snoozed (count: 1)

📥 Received from hardware - Upcoming medicine update: ID=2, Status=snoozed
⏰ Medicine "Vitamin D" snoozed (count: 2)

📥 Received from hardware - Upcoming medicine update: ID=2, Status=snoozed
❌ Medicine "Vitamin D" snoozed 3 times - moved to MISSED
```

---

## 🤖 Hardware Integration Code

### For ESP32/Arduino:
```cpp
// Send medicine status to backend
void sendStatus(String medicineId, String status) {
  HTTPClient http;
  http.begin("http://192.168.0.249:5000/api/hardware/upcoming");
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"id\":\"" + medicineId + "\",\"status\":\"" + status + "\"}";
  int httpCode = http.POST(payload);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Response: " + response);
  }
  http.end();
}

// Usage
sendStatus("1", "taken");
```

### For Python (Raspberry Pi):
```python
import requests

def send_status(medicine_id, status):
    url = "http://192.168.0.249:5000/api/hardware/upcoming"
    payload = {
        "id": medicine_id,
        "status": status
    }
    response = requests.post(url, json=payload)
    print(response.json())

# Usage
send_status("1", "taken")
```

### For React Native (Mobile App):
```javascript
const sendStatus = async (medicineId, status) => {
  const response = await fetch('http://192.168.0.249:5000/api/hardware/upcoming', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: medicineId,
      status: status
    })
  });
  const data = await response.json();
  console.log(data);
};

// Usage
sendStatus('1', 'taken');
```

---

## ✅ All Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/upcoming` | Fetch upcoming medicines |
| POST | `/upcoming` | Update medicine status from hardware |
| GET | `/taken` | Fetch taken medicines |
| POST | `/taken` | Confirm medicine taken |
| GET | `/missed` | Fetch missed medicines |
| POST | `/missed` | Confirm medicine missed |

---

## 🎯 Status Values for POST

- `taken` - Medicine dispensed successfully
- `snoozed` - User delayed (auto-moves to missed after 2 snoozes)
- `missed` - User missed it completely

---

**Your server is LIVE and ready for testing!** 🚀

Use Postman or browser to test GET requests right now!
