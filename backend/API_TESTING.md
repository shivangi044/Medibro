# MediBro API Testing Guide

## Quick Start Testing Commands

### 1. Start MongoDB (if using local)
```bash
mongod
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

### 3. Test Endpoints with curl

## Authentication Tests

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"123456\",\"name\":\"Test User\",\"age\":25,\"gender\":\"male\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"123456\"}"
```

**Save the token from response for next requests!**

### Get Profile (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Medicine Tests

### Add Medicine (replace YOUR_TOKEN)
```bash
curl -X POST http://localhost:5000/api/medicines ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Paracetamol\",\"dosage\":\"500mg\",\"times\":[\"09:00\",\"18:00\"],\"slot\":\"A1\",\"quantity\":60,\"remaining\":60,\"frequency\":\"twice_daily\",\"category\":\"pain_relief\"}"
```

### Get All Medicines (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/medicines ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Low Stock Medicines (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/medicines/alerts/low-stock ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Medicine Log Tests

### Get Today's Schedule (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/logs/today ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Pending Medicines (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/logs/pending ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Log Status (replace YOUR_TOKEN and LOG_ID)
```bash
curl -X PUT http://localhost:5000/api/logs/LOG_ID/status ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"taken\"}"
```

## Analytics Tests

### Get Adherence Stats (replace YOUR_TOKEN)
```bash
curl "http://localhost:5000/api/analytics/adherence?period=week" ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get AI Insights (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/analytics/insights ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Pattern Analysis (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/analytics/patterns ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Hardware API Tests

### Health Check
```bash
curl http://localhost:5000/api/hardware/health
```

### Register Hardware Device (replace USER_ID)
```bash
curl -X POST http://localhost:5000/api/hardware/register ^
  -H "Content-Type: application/json" ^
  -d "{\"botId\":\"MD-BOT-01\",\"userId\":\"USER_ID\"}"
```

### Get Hardware Schedule
```bash
curl "http://localhost:5000/api/hardware/schedule?botId=MD-BOT-01"
```

### Get Slot Configuration
```bash
curl "http://localhost:5000/api/hardware/slots?botId=MD-BOT-01"
```

### Update Status from Hardware (replace LOG_ID)
```bash
curl -X POST http://localhost:5000/api/hardware/update-status ^
  -H "Content-Type: application/json" ^
  -d "{\"botId\":\"MD-BOT-01\",\"logId\":\"LOG_ID\",\"status\":\"dispensed\"}"
```

## Common Testing Flow

1. **Register a user**
2. **Login and save token**
3. **Complete setup with bot ID**
4. **Add medicines**
5. **View today's schedule**
6. **Hardware fetches schedule**
7. **Hardware updates status**
8. **View analytics**

## Testing with Postman

1. Import these endpoints into Postman
2. Create an environment variable for `token` and `baseUrl`
3. Set `baseUrl` to `http://localhost:5000/api`
4. After login, save token to environment variable
5. Use `{{token}}` in Authorization header

## Notes

- Replace `YOUR_TOKEN` with actual JWT token from login
- Replace `LOG_ID`, `USER_ID`, `MEDICINE_ID` with actual MongoDB IDs
- For Windows Command Prompt, use `^` for line continuation
- For PowerShell, use `` ` `` (backtick) for line continuation
- For Linux/Mac, use `\` for line continuation
