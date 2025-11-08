# 🧪 Hardware Integration Testing Guide

## Step-by-Step Testing Process

---

## 🎯 Overview

This guide will help you test hardware integration **WITHOUT actual hardware** using:
1. Backend API server
2. Python simulator tool
3. Mobile app (or Postman)

---

## 📋 Prerequisites Checklist

- [ ] MongoDB installed and running
- [ ] Node.js installed (v16+)
- [ ] Python installed (3.7+) with `requests` library
- [ ] Backend code in `backend/` folder
- [ ] `.env` file configured

---

## 🚀 Phase 1: Backend Setup (5 minutes)

### Step 1: Install Dependencies

```cmd
cd backend
npm install
```

**Expected Output:**
```
added 150 packages, and audited 151 packages in 30s
```

### Step 2: Configure Environment

Open `backend/.env` and verify:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medibro
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Step 3: Start MongoDB

**Option A: Windows Service**
```cmd
net start MongoDB
```

**Option B: Manual Start**
```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**Verify:** Open browser → `http://localhost:27017`  
Should see: "It looks like you are trying to access MongoDB over HTTP..."

### Step 4: Start Backend Server

```cmd
npm run dev
```

**Expected Output:**
```
> backend@1.0.0 dev
> nodemon server.js

[nodemon] starting `node server.js`
Server running in development mode on port 5000
MongoDB Connected: localhost
```

✅ **Backend is ready!**

---

## 🧪 Phase 2: Create Test User & Medicine (10 minutes)

### Option A: Using Mobile App (Recommended)

1. Open Medibro app
2. Register new account:
   - Name: Test User
   - Email: test@medibro.com
   - Password: Test123!
3. Complete setup wizard
4. Add a medicine:
   - Name: Aspirin
   - Dosage: 100mg
   - Slot: 1
   - Time: (current time + 2 minutes)

### Option B: Using Postman/cURL

**1. Register User:**
```cmd
curl -X POST "http://localhost:5000/api/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@medibro.com\",\"password\":\"Test123!\",\"age\":30,\"gender\":\"male\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "675a1b2c3d4e5f6g7h8i9j0k",
    "name": "Test User",
    "email": "test@medibro.com"
  }
}
```

📝 **SAVE THE TOKEN!** You'll need it for next steps.

**2. Add Medicine:**
```cmd
curl -X POST "http://localhost:5000/api/medicines" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"name\":\"Aspirin\",\"dosage\":\"100mg\",\"frequency\":\"daily\",\"times\":[\"08:00\"],\"slot\":1,\"stock\":30,\"startDate\":\"2024-01-15\",\"endDate\":\"2024-02-15\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "675b1c2d3e4f5g6h7i8j9k0l",
    "name": "Aspirin",
    "slot": 1,
    "stock": 30
  },
  "message": "Medicine added and 7-day schedule created"
}
```

✅ **Test data is ready!**

---

## 🔌 Phase 3: Hardware API Testing (15 minutes)

### Step 1: Install Python Tool Dependencies

```cmd
pip install requests
```

### Step 2: Run Hardware Simulator

```cmd
cd backend
python test_hardware.py
```

**You'll see:**
```
============================================================
             MediBro Hardware Simulator
============================================================

Server URL: http://localhost:5000/api/hardware
Bot ID: MD-BOT-01

Available Tests:
  1. Health Check
  2. Fetch Medicine Schedule
  3. Update Medicine Status (after dispensing)
  4. Get Slot Configuration
  5. Simulate Complete Dispense Flow
  6. Run All Tests
  7. Change Configuration
  0. Exit

Select option (0-7):
```

### Step 3: Test 1 - Health Check

**Action:** Press `1` and Enter

**Expected Output:**
```
============================================================
                    Test 1: Health Check
============================================================

✓ Server is running!
ℹ Bot ID: MD-BOT-01
ℹ Bot Registered: False
ℹ Timestamp: 2024-01-15T10:30:00.000Z
```

✅ **Health check passed!**

### Step 4: Register Bot (One-time)

**Manual Registration via cURL:**
```cmd
curl -X POST "http://localhost:5000/api/hardware/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"botId\":\"MD-BOT-01\",\"userId\":\"675a1b2c3d4e5f6g7h8i9j0k\"}"
```

Replace `userId` with your actual user ID from Step 2.

**Expected Response:**
```json
{
  "success": true,
  "message": "Hardware registered successfully"
}
```

### Step 5: Test 2 - Fetch Schedule

**Action:** Press `2` and Enter

**Expected Output (if medicines scheduled):**
```
============================================================
                Test 2: Fetch Schedule
============================================================

✓ Schedule fetched: 1 medicine(s)

Schedule Details:

  1. Aspirin
     Dosage: 100mg
     Slot: 1
     Time: 08:00
     Log ID: 675c1d2e3f4g5h6i7j8k9l0m
     Status: pending
```

**Expected Output (if no medicines):**
```
⚠ No medicines scheduled for dispensing
```

💡 **Tip:** If no medicines, add one via mobile app or curl command above.

### Step 6: Test 5 - Complete Flow Simulation

**Action:** Press `5` and Enter

**Expected Output:**
```
============================================================
        Complete Dispense Flow Simulation
============================================================

ℹ Step 1: Checking server connection...
✓ Server is running!

ℹ Step 2: Fetching today's schedule...
✓ Schedule fetched: 1 medicine(s)

ℹ Step 3: Simulating medicine dispensing...

🔔 DISPENSING MEDICINE...
   Medicine: Aspirin
   Slot: 1
   [Motor activating...]
   [LED blinking...]
   [Buzzer beeping...]
✓ Medicine dispensed successfully!

ℹ Step 4: Updating status in backend...
✓ Status updated successfully!
ℹ New Status: dispensed
ℹ Taken Time: 2024-01-15T08:00:00.000Z

✓ Complete flow simulation finished!
```

✅ **Complete flow working!**

---

## 📱 Phase 4: Verify in Mobile App (5 minutes)

### Open Mobile App

1. Go to "Home" screen
2. Check "Today's Schedule"
3. Medicine should show status: **"Taken ✓"**
4. Go to "Analytics" screen
5. Adherence rate should be **100%**

✅ **End-to-end integration working!**

---

## 🐛 Troubleshooting

### ❌ Problem: "Connection error: [Errno 10061]"

**Solution:**
- Backend not running → Run `npm run dev`
- Wrong port → Check `.env` has `PORT=5000`
- Firewall blocking → Allow Node.js through Windows Firewall

### ❌ Problem: "No medicines scheduled"

**Solution:**
- Add medicine via mobile app with time in next 2 hours
- Or use curl command to add medicine
- Check medicine times match current time window

### ❌ Problem: "Bot not registered"

**Solution:**
- Register bot with curl command:
  ```cmd
  curl -X POST "http://localhost:5000/api/hardware/register" ^
    -H "Content-Type: application/json" ^
    -d "{\"botId\":\"MD-BOT-01\",\"userId\":\"YOUR_USER_ID\"}"
  ```
- Get userId from registration response (Step 2)

### ❌ Problem: "MongoDB connection failed"

**Solution:**
- Start MongoDB service: `net start MongoDB`
- Or run mongod manually with `--dbpath`
- Check MONGODB_URI in `.env` is correct

---

## 📊 Testing Checklist

- [ ] Backend server starts without errors
- [ ] MongoDB connected successfully
- [ ] User registration works
- [ ] User login works
- [ ] Medicine can be added
- [ ] Health check returns 200
- [ ] Bot registration succeeds
- [ ] Schedule fetch returns medicines
- [ ] Status update changes medicine to "dispensed"
- [ ] Mobile app shows updated status
- [ ] Analytics show correct adherence

---

## 🎓 What Each Test Does

### Test 1: Health Check
- **Purpose:** Verify backend is reachable
- **Hardware Code:** Call on boot and every 5 minutes
- **Success:** Returns 200 with bot status

### Test 2: Fetch Schedule
- **Purpose:** Get list of medicines to dispense
- **Hardware Code:** Call every 1 hour
- **Success:** Returns array of pending medicines

### Test 3: Update Status
- **Purpose:** Mark medicine as dispensed
- **Hardware Code:** Call after dispensing
- **Success:** Medicine status changes to "dispensed"

### Test 4: Get Slots
- **Purpose:** Know which medicine is in which slot
- **Hardware Code:** Call every 6 hours
- **Success:** Returns slot→medicine mapping

### Test 5: Complete Flow
- **Purpose:** Simulate entire dispense cycle
- **Success:** Fetches → Dispenses → Updates → Syncs

### Test 6: Run All Tests
- **Purpose:** Full system validation
- **Success:** All 4 tests pass sequentially

---

## 🚀 Next Steps

After successful testing:

1. **Program Real Hardware:**
   - Use Arduino code from `HARDWARE_INTEGRATION.md`
   - Update WiFi credentials
   - Change `SERVER` to your computer's IP address
   - Upload to ESP32/Arduino

2. **Test with Real Hardware:**
   - Power on device
   - Check serial monitor for connection
   - Verify schedule fetching every hour
   - Test actual medicine dispensing

3. **Production Setup:**
   - Deploy backend to cloud (AWS/Heroku/DigitalOcean)
   - Update hardware with production server URL
   - Enable HTTPS for security
   - Set up error monitoring

---

## 📚 Testing Tips

1. **Test incrementally:** Don't skip steps
2. **Check logs:** Backend console shows all API calls
3. **Use timestamps:** Helps debug timing issues
4. **Save responses:** Keep track of IDs for next steps
5. **Test edge cases:** No medicines, wrong times, network errors

---

## 🆘 Need Help?

1. Check backend console for error messages
2. Check `backend/logs/` for detailed logs
3. Run `npm run dev` to see real-time logs
4. Check MongoDB with `mongosh`:
   ```
   mongosh
   use medibro
   db.users.find()
   db.medicines.find()
   db.medicinelogs.find()
   ```

---

**🎉 Once all tests pass, your hardware integration is ready!**

Next: Upload code to your ESP32/Arduino and test with real motors! 🤖
