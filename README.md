# 🩺 Medicine Dispenser Bot (Prototype)

## 📘 Overview

The **Medicine Dispenser Bot** is a smart healthcare companion designed to ensure timely medicine intake.
It automates the process of **dispensing medicines at scheduled times**, tracks user actions like **Taken**, **Snoozed**, or **Skipped**, and provides insightful **AI-driven analytics** through a mobile frontend built with **React Native**.

The bot functions like a **smart drawer**, where each slot contains a specific medicine dose. The user receives notifications and can interact with the system via the app.

---

## 🚀 Features

### 🧾 1. Login & Profile Setup

* Secure login system for each user.
* Profile details include:

  * Name, Age, Gender
  * Medical Conditions
  * Prescribed Medicines & Timings
* Authentication handled via backend API or local storage (prototype mode).

### 🔗 2. Device Connection (Bluetooth Setup)

* Bluetooth pairing page to connect with the dispenser bot.
* Displays:

  * Bot ID
  * Connection status (Connected / Disconnected)
  * Option to reconnect manually

### 📊 3. Landing Page (Home)

* Dashboard showing quick overview:

  * Daily medicine schedule
  * Summary of Taken / Snoozed / Skipped doses
* Navigation bar with:

  * Dashboard
  * Analytics
  * Settings / Profile

### 💊 4. Medicine Dashboard

* Displays medicine slots and their statuses.
* Shows the following data received from the bot:

  * **Medicine Name**
  * **Scheduled Time**
  * **Status:** Taken / Snoozed / Skipped
* Users can manually update status (for prototype testing).

### 🤖 5. AI Analytics

* Provides insights such as:

  * Medicine adherence percentage
  * Missed dose trends
  * Prediction of future non-compliance
* AI model flags anomalies (e.g., frequent skips or snoozes).

---

## 📱 Frontend Architecture (React Native)

**Tech Stack:**

* React Native (Expo / React Navigation)
* Bluetooth API (e.g., `react-native-ble-plx`)
* Chart Library for analytics (e.g., `react-native-chart-kit`)
* Backend API (mocked / Firebase / local JSON)

**Page Flow:**

1. **LoginPage → SetupPage → LandingPage → DashboardPage**
2. Each page connected via navigation routes.
3. Data fetched from bot and displayed dynamically.

---

## 🧩 Data Flow

```
[Medicine Bot Hardware]
        ↓ Bluetooth
[React Native App]
        ↓
[Data Storage / AI Model]
        ↓
[Dashboard + Analytics Visualization]
```

### Example Data Format:

```json
{
  "userId": "1234",
  "botId": "MD-BOT-09",
  "medicines": [
    { "name": "Paracetamol", "time": "09:00 AM", "status": "Taken" },
    { "name": "Vitamin D", "time": "02:00 PM", "status": "Snoozed" },
    { "name": "Aspirin", "time": "09:00 PM", "status": "Skipped" }
  ]
}
```

---

## 🎯 Prototype Goals

* Build a working **UI/UX flow** for medicine tracking.
* Simulate Bluetooth data sync from bot.
* Visualize analytics for medicine intake.
* Prepare the base for integrating real AI + hardware communication.

---

## 🧠 Future Scope

* Integration with healthcare APIs or cloud dashboards.
* Voice assistant for reminders.
* Integration with smartwatches or IoT health devices.
* Predictive analytics for missed doses using ML models.

---

## 📸 Screens (Planned)

1. **Login Page** – User authentication.
2. **Setup Page** – Bluetooth connect & device info.
3. **Landing Page** – Overview & navigation.
4. **Dashboard** – Medicine status and analytics graphs.

---

## 🧑‍💻 Team Notes

This prototype focuses on **frontend flow and data visualization** — perfect for user testing and early-stage validation before full hardware integration.

---

## 📐 UI Wireframe Overview

```
┌─────────────────────────────────────┐
│           LOGIN SCREEN              │
│  ┌─────────────────────────────┐    │
│  │         Username            │    │
│  │         Password            │    │
│  │      [LOGIN BUTTON]         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         BLUETOOTH SETUP             │
│  Device: MD-BOT-09                  │
│  Status: [●] Connected              │
│  [PAIR DEVICE] [RECONNECT]          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│           HOME DASHBOARD            │
│  Today's Schedule:                  │
│  ✓ Paracetamol - 9:00 AM (Taken)   │
│  ⏰ Vitamin D - 2:00 PM (Pending)   │
│  📊 Analytics  💊 Medicines  ⚙️ Settings │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         AI ANALYTICS                │
│  📈 Adherence Rate: 85%             │
│  📊 Weekly Trend Chart              │
│  🚨 Alerts: 3 missed doses          │
│  💡 Recommendations                 │
└─────────────────────────────────────┘
```

---

## 🛠️ Getting Started (Development)

### Prerequisites
- Node.js (v16 or later)
- Expo CLI or React Native CLI
- Android Studio / Xcode (for device testing)

### Installation
```bash
# Clone the repository
git clone https://github.com/shivangi044/Medibro.git
cd Medibro

# Install dependencies
npm install

# Start the development server
expo start
# or
npx react-native start
```

### Project Structure
```
Medibro/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── services/       # Bluetooth & API services
│   ├── utils/          # Helper functions
│   └── assets/         # Images, fonts, etc.
├── package.json
└── README.md
```

---

## 🔧 Configuration

### Bluetooth Setup
- Enable Bluetooth permissions in `android/app/src/main/AndroidManifest.xml`
- Add iOS Bluetooth permissions in `ios/Medibro/Info.plist`

### Mock Data
For prototype testing, mock data is used to simulate bot responses:
```javascript
const mockMedicineData = [
  { id: 1, name: "Paracetamol", time: "09:00", status: "taken" },
  { id: 2, name: "Vitamin D", time: "14:00", status: "pending" },
  { id: 3, name: "Aspirin", time: "21:00", status: "skipped" }
];
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

- **Shivangi** - Project Lead & Development
- **Anubhav** - Development & Documentation

---

## 📞 Contact

For questions or collaboration opportunities:
- GitHub: [@shivangi044](https://github.com/shivangi044)
- Project Repository: [Medibro](https://github.com/shivangi044/Medibro)