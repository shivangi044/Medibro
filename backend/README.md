# 🏥 MediBro Backend API

A comprehensive Node.js backend API for MediBro - A smart medicine reminder and dispenser system that connects with hardware devices to help patients manage their medication schedules.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Hardware Integration](#hardware-integration)

## ✨ Features

- **User Authentication** - Secure JWT-based authentication
- **Medicine Management** - CRUD operations for medicines with scheduling
- **Medicine Logging** - Track taken, snoozed, and skipped medicines
- **Analytics & Insights** - AI-driven adherence tracking and recommendations
- **Hardware API** - RESTful endpoints for IoT device integration
- **Automated Scheduling** - Automatic log generation for medicine schedules
- **Low Stock Alerts** - Notifications when medicines are running low

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Bcrypt
- **Logging**: Morgan

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```

5. **Run the server**
   
   Development mode (with auto-restart):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Server will start on**
   ```
   http://localhost:5000
   ```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/medibro

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Hardware API Configuration
HARDWARE_API_KEY=hardware_api_key_here

# App Configuration
APP_NAME=MediBro
API_VERSION=v1
```

## 🚀 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123",
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "medicalConditions": "Diabetes, Hypertension",
  "emergencyContact": "+1234567890",
  "doctorName": "Dr. Smith",
  "doctorPhone": "+0987654321"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "age": 31
}
```

#### Complete Setup
```http
POST /api/auth/complete-setup
Authorization: Bearer <token>
Content-Type: application/json

{
  "connectedBotId": "MD-BOT-01"
}
```

### Medicine Endpoints

#### Add Medicine
```http
POST /api/medicines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Paracetamol",
  "dosage": "500mg",
  "times": ["09:00", "18:00"],
  "frequency": "twice_daily",
  "slot": "A1",
  "quantity": 60,
  "remaining": 60,
  "description": "For pain relief",
  "instructions": "Take with food",
  "prescribedBy": "Dr. Smith",
  "category": "pain_relief"
}
```

#### Get All Medicines
```http
GET /api/medicines
Authorization: Bearer <token>

# Query parameters (optional):
# ?isActive=true
# ?category=pain_relief
```

#### Get Medicine by ID
```http
GET /api/medicines/:id
Authorization: Bearer <token>
```

#### Update Medicine
```http
PUT /api/medicines/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "remaining": 55,
  "dosage": "1000mg"
}
```

#### Delete Medicine
```http
DELETE /api/medicines/:id
Authorization: Bearer <token>
```

#### Get Low Stock Medicines
```http
GET /api/medicines/alerts/low-stock
Authorization: Bearer <token>

# Query parameters (optional):
# ?threshold=7
```

### Medicine Log Endpoints

#### Get All Logs
```http
GET /api/logs
Authorization: Bearer <token>

# Query parameters (optional):
# ?startDate=2024-01-01
# ?endDate=2024-12-31
# ?status=taken
```

#### Get Today's Schedule
```http
GET /api/logs/today
Authorization: Bearer <token>
```

#### Get Pending Medicines
```http
GET /api/logs/pending
Authorization: Bearer <token>
```

#### Get Log by ID
```http
GET /api/logs/:id
Authorization: Bearer <token>
```

#### Update Log Status
```http
PUT /api/logs/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "taken",
  "notes": "Taken with breakfast"
}

# For snooze:
{
  "status": "snoozed",
  "snoozeMinutes": 15
}

# For skip:
{
  "status": "skipped",
  "notes": "Feeling better, skipped dose"
}
```

#### Get Medicine History
```http
GET /api/logs/history/:medicineId
Authorization: Bearer <token>

# Query parameters (optional):
# ?startDate=2024-01-01
# ?endDate=2024-12-31
```

### Analytics Endpoints

#### Get Adherence Statistics
```http
GET /api/analytics/adherence
Authorization: Bearer <token>

# Query parameters (optional):
# ?period=week (options: week, month, year)
```

#### Get AI Insights
```http
GET /api/analytics/insights
Authorization: Bearer <token>
```

#### Get Pattern Analysis
```http
GET /api/analytics/patterns
Authorization: Bearer <token>
```

### Hardware API Endpoints

#### Health Check
```http
GET /api/hardware/health

# With bot ID:
GET /api/hardware/health?botId=MD-BOT-01
```

#### Register Device
```http
POST /api/hardware/register
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "userId": "user_mongodb_id_here"
}
```

#### Get Schedule (for hardware)
```http
GET /api/hardware/schedule?botId=MD-BOT-01

# Optional parameters:
# &startTime=2024-01-01T00:00:00Z
# &endTime=2024-01-02T00:00:00Z
```

#### Get Slot Configuration
```http
GET /api/hardware/slots?botId=MD-BOT-01
```

#### Update Status from Hardware
```http
POST /api/hardware/update-status
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "logId": "log_mongodb_id_here",
  "status": "dispensed",
  "timestamp": "2024-01-01T09:00:00Z"
}
```

#### Bulk Update Status
```http
POST /api/hardware/bulk-update
Content-Type: application/json

{
  "botId": "MD-BOT-01",
  "updates": [
    {
      "logId": "log_id_1",
      "status": "dispensed"
    },
    {
      "logId": "log_id_2",
      "status": "skipped"
    }
  ]
}
```

## 📊 Database Models

### User Model
- username, password
- Personal info (name, age, gender)
- Medical info (conditions, doctor details)
- Device info (connectedBotId, bluetoothConnected)

### Medicine Model
- Basic info (name, dosage)
- Schedule (times, frequency)
- Hardware info (slot)
- Stock tracking (quantity, remaining)
- Prescription details

### MedicineLog Model
- References (userId, medicineId)
- Schedule (scheduledTime, takenTime)
- Status (pending, taken, snoozed, skipped, taken_late)
- Hardware sync info

### Adherence Model
- Period-based statistics
- Adherence rates
- Medicine-wise breakdown

## 🤖 Hardware Integration

### How Hardware Communicates

1. **Get Schedule**: Hardware polls `/api/hardware/schedule` with its botId
2. **Receive Schedule**: Gets list of medicines to dispense with times and slots
3. **Dispense Medicine**: Hardware dispenses medicine at scheduled time
4. **Update Status**: Hardware sends status update via `/api/hardware/update-status`
5. **Sync Complete**: Backend updates database and mobile app reflects changes

### Hardware Data Flow

```
Hardware Device → GET /api/hardware/schedule
                ← JSON with medicine schedule

Hardware Device → Dispenses medicine at slot A1

Hardware Device → POST /api/hardware/update-status
                  { botId, logId, status: "dispensed" }
                ← Success confirmation

Mobile App      → GET /api/logs/today
                ← Updated status (medicine marked as taken)
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if any */ ]
}
```

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Helmet for security headers
- CORS enabled
- Input validation with express-validator
- MongoDB injection prevention

## 🧪 Testing

Use tools like:
- **Postman** - Import endpoints and test
- **Thunder Client** (VS Code extension)
- **curl** commands

Example curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"123456"}'

# Get medicines (replace TOKEN with your JWT)
curl http://localhost:5000/api/medicines \
  -H "Authorization: Bearer TOKEN"
```

## 📚 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── medicineController.js # Medicine CRUD logic
│   ├── logController.js      # Medicine log logic
│   ├── analyticsController.js# Analytics logic
│   └── hardwareController.js # Hardware API logic
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Error handling
│   └── validator.js         # Input validation
├── models/
│   ├── User.js              # User schema
│   ├── Medicine.js          # Medicine schema
│   ├── MedicineLog.js       # Medicine log schema
│   └── Adherence.js         # Adherence schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── medicineRoutes.js    # Medicine endpoints
│   ├── logRoutes.js         # Log endpoints
│   ├── analyticsRoutes.js   # Analytics endpoints
│   └── hardwareRoutes.js    # Hardware endpoints
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

MediBro Team

## 🆘 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ for better healthcare management
