# 🔌 Hardware API - Updated & Simplified!

## ✨ What Changed?

### ✅ No MongoDB Required
- Uses **in-memory mock data**
- No database setup needed
- Perfect for testing and development

### ✅ No botId Required  
- **Direct endpoint access**
- No device registration needed
- Simple GET/POST requests

### ✅ 3 New Endpoints
- `GET /upcoming` - Pending medicines
- `GET /taken` - Completed medicines  
- `GET /missed` - Missed & snoozed medicines

---

## 🎯 API Endpoints

### 1. GET Upcoming Medicines
```
http://localhost:5000/api/hardware/upcoming
```
Returns all medicines with `status: "pending"`

### 2. GET Taken Medicines
```
http://localhost:5000/api/hardware/taken
```
Returns all medicines with `status: "taken"`

### 3. GET Missed Medicines
```
http://localhost:5000/api/hardware/missed
```
Returns medicines with `status: "missed"` OR `status: "snoozed"`

### 4. POST Update Status
```
POST http://localhost:5000/api/hardware/update-status
Content-Type: application/json

{
  "id": "1",
  "status": "taken"
}
```
Updates a medicine's status

### 5. GET Health Check
```
http://localhost:5000/api/hardware/health
```
Check if API is running

---

## 🚀 Quick Start

### Step 1: Install & Start
```bash
cd backend
npm install
npm run dev
```

### Step 2: Test with Browser
Open in browser:
- http://localhost:5000/api/hardware/upcoming
- http://localhost:5000/api/hardware/taken
- http://localhost:5000/api/hardware/missed

### Step 3: Run Test Script
```bash
test-api.bat
```

---

## 📱 Mobile App Usage

### Fetch Upcoming
```javascript
const response = await fetch('http://your-server:5000/api/hardware/upcoming');
const data = await response.json();
console.log(data.data); // Array of pending medicines
```

### Fetch Taken
```javascript
const response = await fetch('http://your-server:5000/api/hardware/taken');
const data = await response.json();
console.log(data.data); // Array of taken medicines
```

### Fetch Missed
```javascript
const response = await fetch('http://your-server:5000/api/hardware/missed');
const data = await response.json();
console.log(data.data); // Array of missed/snoozed medicines
```

---

## 🤖 Hardware Usage

### Update Status (Arduino/ESP32)
```cpp
void updateMedicineStatus(String id, String status) {
  HTTPClient http;
  http.begin("http://192.168.1.100:5000/api/hardware/update-status");
  http.addHeader("Content-Type", "application/json");
  
  String body = "{\"id\":\"" + id + "\",\"status\":\"" + status + "\"}";
  http.POST(body);
  http.end();
}

// After dispensing medicine
updateMedicineStatus("1", "taken");
```

### Update Status (Python/Raspberry Pi)
```python
import requests

def update_status(medicine_id, status):
    url = "http://localhost:5000/api/hardware/update-status"
    payload = {"id": medicine_id, "status": status}
    response = requests.post(url, json=payload)
    return response.json()

# After dispensing
result = update_status("1", "taken")
print(result['message'])
```

---

## 📊 Mock Data Included

| ID | Medicine | Slot | Time | Status |
|----|----------|------|------|--------|
| 1 | Aspirin | 1 | 08:00 | pending |
| 2 | Vitamin D | 2 | 14:00 | pending |
| 3 | Calcium | 3 | 20:00 | pending |
| 4 | Paracetamol | 4 | 06:00 | taken ✓ |
| 5 | Ibuprofen | 1 | 10:00 | missed ❌ |
| 6 | Antibiotic | 2 | 12:00 | snoozed ⏰ |

---

## 🔄 Status Values

- `pending` - Waiting to be dispensed
- `taken` - Successfully dispensed
- `missed` - Past scheduled time, not taken
- `snoozed` - Delayed (auto-retry in 30 min)
- `skipped` - User manually skipped

---

## 🧪 Testing with cURL

```cmd
REM Get upcoming
curl http://localhost:5000/api/hardware/upcoming

REM Get taken  
curl http://localhost:5000/api/hardware/taken

REM Get missed
curl http://localhost:5000/api/hardware/missed

REM Update status
curl -X POST http://localhost:5000/api/hardware/update-status ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":\"1\",\"status\":\"taken\"}"
```

---

## 📱 Integration Flow

```
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │
       │ GET /upcoming
       │ GET /taken
       │ GET /missed
       │
       ▼
┌──────────────┐
│   Backend    │
│ (Mock Data)  │
└──────┬───────┘
       │
       │ POST /update-status
       │
       ▼
┌──────────────┐
│  Hardware    │
│  Device      │
└──────────────┘
```

---

## ✅ Advantages

✅ **Simple** - Just 4 endpoints, no complexity  
✅ **Fast** - No database queries, instant response  
✅ **Easy** - Works with browser, curl, Postman  
✅ **Ready** - Mock data included, no setup  
✅ **Flexible** - Easy to integrate with any hardware  

---

## 🔧 Customization

Want to add more medicines? Edit `hardwareController.js`:

```javascript
const mockMedicines = [
  {
    id: '7',
    medicineName: 'Your Medicine',
    dosage: '100mg',
    slot: 5,
    scheduledTime: '16:00',
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  },
  // Add more...
];
```

---

## 🆘 Troubleshooting

**"Cannot connect"**
- Check backend is running: `npm run dev`
- Check port 5000 is available
- Use correct IP address

**"Empty array returned"**
- Mock data is filtered by today's date
- Check `date` field in mock data matches today

**"Status not updating"**
- Verify medicine ID exists
- Check status value is valid
- Check request Content-Type is `application/json`

---

## 📚 Files

- `hardwareController.js` - Controller with mock data
- `hardwareRoutes.js` - API routes
- `test-api.bat` - Windows test script
- `HARDWARE_SIMPLE_GUIDE.md` - Detailed guide

---

## 🎓 Next Steps

1. ✅ Start backend: `npm run dev`
2. ✅ Test endpoints: `test-api.bat`
3. ✅ Integrate with mobile app
4. ✅ Connect hardware device
5. ✅ Test end-to-end flow

---

**Ready to use? Just run `npm run dev` and start making requests!** 🚀

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| **Port** | 5000 |
| **Base URL** | http://localhost:5000/api/hardware |
| **Auth** | None required ❌ |
| **Database** | In-memory (no MongoDB) |
| **Data** | Mock medicines included |
| **CORS** | Enabled ✅ |

---

**Documentation:** See `HARDWARE_SIMPLE_GUIDE.md` for detailed examples!
