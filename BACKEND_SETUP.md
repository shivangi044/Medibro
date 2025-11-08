# 🚀 MediBro Complete Setup Guide

## Complete Project Overview

MediBro consists of:
1. **Frontend** - React Native mobile app (Expo)
2. **Backend** - Node.js REST API server
3. **Database** - MongoDB
4. **Hardware** - IoT device (communicates via API)

---

## 📋 Prerequisites

Before starting, install:

1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
   - OR use MongoDB Atlas (cloud)
3. **Git** - [Download](https://git-scm.com/)
4. **Expo CLI** (for mobile app)
   ```bash
   npm install -g @expo/cli
   ```
5. **Expo Go App** on your phone (iOS/Android)

---

## 🗂️ Project Structure

```
Medibro/
├── src/                    # React Native Frontend
│   ├── screens/
│   ├── components/
│   ├── services/
│   └── utils/
├── backend/               # Node.js Backend API
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── App.js
├── package.json
└── README.md
```

---

## 🔧 Setup Instructions

### Part 1: Database Setup (MongoDB)

#### Option A: Local MongoDB

1. **Install MongoDB Community Edition**
   - Windows: Download installer from MongoDB website
   - Mac: `brew install mongodb-community`
   - Linux: Follow official MongoDB docs

2. **Start MongoDB Service**
   
   Windows:
   ```bash
   net start MongoDB
   ```
   
   Mac/Linux:
   ```bash
   brew services start mongodb-community
   # OR
   mongod
   ```

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # You should see MongoDB shell
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `backend/.env` with your connection string

---

### Part 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file:
   ```bash
   copy .env.example .env    # Windows
   cp .env.example .env      # Mac/Linux
   ```
   
   Edit `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/medibro
   JWT_SECRET=your_secret_key_change_this
   JWT_EXPIRE=7d
   ```

4. **Start backend server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

5. **Verify backend is running**
   
   Open browser: `http://localhost:5000`
   
   You should see:
   ```json
   {
     "success": true,
     "message": "MediBro API Server is running! 🚀",
     "version": "1.0.0"
   }
   ```

---

### Part 3: Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..   # Go back to Medibro directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API endpoint in frontend**
   
   Create `src/utils/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   // For testing on phone, replace localhost with your computer's IP
   // const API_BASE_URL = 'http://192.168.1.100:5000/api';
   
   export default API_BASE_URL;
   ```

4. **Start Expo development server**
   ```bash
   npm start
   ```

5. **Run on device**
   
   - Scan QR code with Expo Go app
   - OR press `a` for Android emulator
   - OR press `i` for iOS simulator (Mac only)

---

## 🔄 Connecting Frontend to Backend

### Step 1: Get Your Computer's IP Address

**Windows:**
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# Look for inet under your network interface
```

### Step 2: Update Frontend API URL

In your frontend code, create an API configuration file:

`src/config/api.js`:
```javascript
// Replace with your computer's IP when testing on phone
const API_URL = __DEV__ 
  ? 'http://192.168.1.100:5000/api'  // Replace with YOUR IP
  : 'https://your-production-api.com/api';

export default API_URL;
```

### Step 3: Create API Service

`src/services/api.js`:
```javascript
import API_URL from '../config/api';

export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },
  
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
};

export const medicineAPI = {
  getAll: async (token) => {
    const response = await fetch(`${API_URL}/medicines`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },
  
  add: async (token, medicineData) => {
    const response = await fetch(`${API_URL}/medicines`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(medicineData)
    });
    return response.json();
  }
};

export const logAPI = {
  getTodaySchedule: async (token) => {
    const response = await fetch(`${API_URL}/logs/today`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },
  
  updateStatus: async (token, logId, status) => {
    const response = await fetch(`${API_URL}/logs/${logId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  }
};
```

---

## 🤖 Hardware Integration Guide

### Hardware Setup

Your hardware device should:

1. **Connect to WiFi**
2. **Know the API server URL** (e.g., `http://192.168.1.100:5000/api/hardware`)
3. **Have a unique Bot ID** (e.g., `MD-BOT-01`)

### Hardware API Workflow

```python
# Python example for hardware (Arduino/Raspberry Pi)
import requests
import time

API_URL = "http://192.168.1.100:5000/api/hardware"
BOT_ID = "MD-BOT-01"

# 1. Register device
def register_device(user_id):
    response = requests.post(f"{API_URL}/register", json={
        "botId": BOT_ID,
        "userId": user_id
    })
    return response.json()

# 2. Get schedule
def get_schedule():
    response = requests.get(f"{API_URL}/schedule", params={
        "botId": BOT_ID
    })
    return response.json()

# 3. Update status after dispensing
def update_status(log_id, status="dispensed"):
    response = requests.post(f"{API_URL}/update-status", json={
        "botId": BOT_ID,
        "logId": log_id,
        "status": status
    })
    return response.json()

# Main loop
while True:
    # Get today's schedule
    schedule = get_schedule()
    
    for medicine in schedule['data']:
        scheduled_time = medicine['scheduledTime']
        slot = medicine['slot']
        
        # Check if it's time to dispense
        if is_time_to_dispense(scheduled_time):
            dispense_from_slot(slot)
            update_status(medicine['logId'], 'dispensed')
    
    time.sleep(60)  # Check every minute
```

---

## ✅ Testing the Complete System

### Test Flow

1. **Start MongoDB**
2. **Start Backend** (`cd backend && npm run dev`)
3. **Start Frontend** (`npm start`)
4. **Register a user** in the mobile app
5. **Complete profile setup**
6. **Connect Bluetooth device** (or skip for testing)
7. **Add medicines** with schedules
8. **View today's schedule**
9. **Test hardware API** (simulate with curl/Postman)
10. **Update medicine status**
11. **Check analytics**

### Quick Test Commands

```bash
# Test backend health
curl http://localhost:5000

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"123456","name":"Demo User","age":25}'

# Login (save the token!)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"123456"}'
```

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
✓ Check MongoDB is running: mongosh
✓ Verify connection string in .env
✓ Check firewall settings
```

**Port Already in Use:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**Cannot connect to backend:**
```
✓ Replace localhost with your IP address
✓ Ensure backend is running
✓ Check both devices on same WiFi
✓ Disable firewall temporarily
```

**Expo Go not loading:**
```
✓ Clear Expo cache: expo start -c
✓ Restart Expo Go app
✓ Check QR code scanner permissions
```

---

## 📚 Useful Commands Reference

### Backend
```bash
npm install          # Install dependencies
npm start           # Start server
npm run dev         # Start with auto-reload
```

### Frontend
```bash
npm install          # Install dependencies
npm start           # Start Expo
npm run android     # Run on Android
npm run ios         # Run on iOS (Mac only)
```

### MongoDB
```bash
mongosh             # Open MongoDB shell
mongod              # Start MongoDB server
use medibro         # Switch to medibro database
db.users.find()     # View all users
```

---

## 🎯 Next Steps

1. **Integrate real authentication** (OAuth, Firebase)
2. **Add push notifications** (Expo Notifications)
3. **Implement real hardware** communication
4. **Deploy backend** (Heroku, Railway, AWS)
5. **Deploy database** (MongoDB Atlas)
6. **Build mobile app** (`eas build`)

---

## 📞 Support

- Check `backend/README.md` for API documentation
- Check `backend/API_TESTING.md` for testing guide
- Review error logs in terminal
- Ensure all prerequisites are installed

---

**Happy Coding! 🚀**
