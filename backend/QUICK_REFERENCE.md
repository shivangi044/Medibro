# 🚀 MediBro Backend - Quick Reference

## ⚡ Quick Start
```bash
cd backend
npm install
npm run dev
```

## 🔑 Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medibro
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## 📡 API Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication Flow
```
1. Register → POST /api/auth/register
2. Login → POST /api/auth/login (get token)
3. Use token → Add "Authorization: Bearer <token>" header
```

## 📋 Common Endpoints

### User
```
POST   /api/auth/register           Register
POST   /api/auth/login              Login (get token)
GET    /api/auth/profile            Get profile
PUT    /api/auth/profile            Update profile
```

### Medicines
```
POST   /api/medicines               Add medicine
GET    /api/medicines               Get all
PUT    /api/medicines/:id           Update
DELETE /api/medicines/:id           Delete
```

### Schedule & Logs
```
GET    /api/logs/today              Today's schedule
GET    /api/logs/pending            Pending doses
PUT    /api/logs/:id/status         Update status
```

### Analytics
```
GET    /api/analytics/adherence     Stats
GET    /api/analytics/insights      AI insights
GET    /api/analytics/patterns      Patterns
```

### Hardware
```
GET    /api/hardware/schedule?botId=MD-BOT-01
POST   /api/hardware/update-status
GET    /api/hardware/slots?botId=MD-BOT-01
```

## 🧪 Test Commands (Windows CMD)

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"demo\",\"password\":\"123456\",\"name\":\"Demo User\",\"age\":25}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"demo\",\"password\":\"123456\"}"
```

### Add Medicine (replace TOKEN)
```bash
curl -X POST http://localhost:5000/api/medicines ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Paracetamol\",\"dosage\":\"500mg\",\"times\":[\"09:00\"],\"slot\":\"A1\",\"quantity\":30,\"remaining\":30}"
```

## 📊 Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ]
}
```

## 🗂️ File Structure
```
backend/
├── config/db.js              MongoDB connection
├── models/                   Database schemas
├── controllers/              Business logic
├── routes/                   API routes
├── middleware/               Auth, validation, errors
├── server.js                 Main app
├── .env                      Configuration
└── package.json              Dependencies
```

## 🐛 Common Issues

### MongoDB not connected
```bash
# Start MongoDB
net start MongoDB           # Windows
brew services start mongodb # Mac
mongod                      # Linux
```

### Port in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Cannot connect from phone
```
1. Get your IP: ipconfig (Windows) / ifconfig (Mac)
2. Use IP instead of localhost
3. Ensure same WiFi network
4. Disable firewall temporarily
```

## 📱 Frontend Integration

```javascript
const API_URL = 'http://YOUR_IP:5000/api';

// Login and save token
const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  // Save data.data.token
  return data;
};

// Use token in requests
const getMedicines = async (token) => {
  const res = await fetch(`${API_URL}/medicines`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};
```

## 🤖 Hardware Integration

```python
import requests

API = "http://192.168.1.100:5000/api/hardware"
BOT_ID = "MD-BOT-01"

# Get schedule
schedule = requests.get(f"{API}/schedule?botId={BOT_ID}").json()

# Update status
requests.post(f"{API}/update-status", json={
    "botId": BOT_ID,
    "logId": log_id,
    "status": "dispensed"
})
```

## 📚 Documentation Files

- `README.md` - Complete API documentation
- `API_TESTING.md` - Testing guide with examples
- `BACKEND_SETUP.md` - Setup instructions
- `IMPLEMENTATION_SUMMARY.md` - What's implemented

## 💾 Database Collections

```
users           User accounts & profiles
medicines       Medicine information
medicinelogs    Schedule & status tracking
adherences      Analytics & statistics
```

## ⚙️ NPM Scripts

```bash
npm start       # Start production server
npm run dev     # Start with nodemon (auto-reload)
```

## 🔒 Security Checklist

✅ Passwords hashed (bcrypt)
✅ JWT tokens for auth
✅ Input validation
✅ Error handling
✅ CORS enabled
✅ Helmet security headers

## 📞 Next Steps

1. ✅ Start MongoDB
2. ✅ Start backend server
3. ✅ Test with curl/Postman
4. ✅ Connect frontend
5. ✅ Test complete flow
6. ✅ Integrate hardware

## 🎯 Key Features

- ✅ User authentication
- ✅ Medicine CRUD
- ✅ Automatic scheduling
- ✅ Status tracking
- ✅ Analytics & AI insights
- ✅ Hardware API
- ✅ Low stock alerts

---

**Need help?** Check the detailed documentation in README.md

**Server running?** Visit http://localhost:5000

**API working?** Test with: `curl http://localhost:5000`
