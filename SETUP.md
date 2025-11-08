# 🚀 MediBro Setup Guide

## Prerequisites

Before running the MediBro React Native app, make sure you have the following installed:

- **Node.js** (v16 or later): [Download here](https://nodejs.org/)
- **npm** or **yarn**: Comes with Node.js
- **Expo CLI**: Install globally with `npm install -g @expo/cli`
- **Git**: [Download here](https://git-scm.com/)

For device testing:
- **Expo Go app** on your mobile device (iOS/Android)
- Or **Android Studio** for Android emulator
- Or **Xcode** for iOS simulator (Mac only)

---

## 📱 Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory (if not already there)
cd /home/anubhav/Desktop/Medibro

# Install dependencies
npm install

# Start the development server
npm start
```

### 2. Run on Device

#### Option A: Physical Device (Recommended for testing)
1. Install **Expo Go** app from App Store/Play Store
2. Scan the QR code shown in terminal/browser
3. The app will load on your device

#### Option B: Simulator/Emulator
```bash
# For iOS simulator (Mac only)
npm run ios

# For Android emulator
npm run android

# For web browser
npm run web
```

---

## 📋 Demo Usage Guide

### Login Credentials
- **Username**: `demo`
- **Password**: `123456`

### App Flow
1. **Login** → Enter demo credentials
2. **Profile Setup** → Fill in your details
3. **Bluetooth Setup** → Mock connection to medicine bot
4. **Main App** → Explore dashboard, medicines, and analytics

---

## 📁 Project Structure

```
Medibro/
├── App.js                 # Main app component with navigation
├── package.json           # Dependencies and scripts
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
└── src/
    ├── screens/          # All app screens
    │   ├── LoginScreen.js
    │   ├── SetupScreen.js
    │   ├── BluetoothScreen.js
    │   ├── HomeScreen.js
    │   ├── MedicineScreen.js
    │   ├── AnalyticsScreen.js
    │   └── ProfileScreen.js
    ├── components/       # Reusable UI components
    │   ├── CustomButton.js
    │   └── MedicineCard.js
    ├── services/         # Business logic and mock services
    │   ├── BluetoothService.js
    │   └── MedicineService.js
    └── utils/            # Helper functions and constants
        └── helpers.js
```

---

## 🔧 Key Features Implemented

### ✅ Completed Features
- **User Authentication** (Login/Profile Setup)
- **Bluetooth Connection Simulation**
- **Medicine Tracking & Status Updates**
- **Interactive Dashboard** with quick stats
- **AI Analytics** with charts and insights
- **Profile Management** with settings
- **Mock Data Services** for prototype testing

### 📱 Screens Overview
1. **Login** - Authentication with demo credentials
2. **Profile Setup** - User information collection
3. **Bluetooth Setup** - Device pairing simulation
4. **Home Dashboard** - Overview and quick actions
5. **Medicine Tracker** - Detailed medicine management
6. **Analytics** - Charts, trends, and AI insights
7. **Profile** - Settings and user information

---

## 🔍 Testing the App

### Core Workflows to Test
1. **Onboarding Flow**
   - Login → Setup → Bluetooth → Dashboard

2. **Medicine Management**
   - View medicine list
   - Update medicine status (Taken/Snoozed/Skipped)
   - Check medicine details

3. **Analytics & Insights**
   - View adherence trends
   - Check AI recommendations
   - Explore weekly patterns

4. **Profile & Settings**
   - View user information
   - Check bot connection status
   - Adjust app preferences

---

## 🎨 UI/UX Features

- **Gradient Headers** for visual appeal
- **Tab Navigation** for easy access
- **Interactive Cards** with status indicators
- **Charts & Visualizations** for data insights
- **Responsive Design** for different screen sizes
- **Smooth Animations** and transitions

---

## 🔧 Mock Services

The app includes fully functional mock services:

### BluetoothService
- Device scanning simulation
- Connection/disconnection
- Command sending (dispense, status, schedule)
- Real-time status updates

### MedicineService
- Medicine data management
- Schedule generation
- Adherence calculations
- AI insights generation

---

## 🚨 Troubleshooting

### Common Issues

**1. Metro bundler issues**
```bash
# Clear cache and restart
npx expo start -c
```

**2. Node modules issues**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**3. Expo CLI not found**
```bash
# Install Expo CLI globally
npm install -g @expo/cli
```

**4. Port already in use**
```bash
# Kill processes on port 19000
npx expo start --port 19001
```

---

## 📝 Development Notes

### Mock Data
- All data is simulated for prototype purposes
- Bluetooth connections are mocked with realistic delays
- Medicine adherence uses randomized realistic data
- AI insights are template-based with dynamic content

### Future Enhancements
- Real Bluetooth integration with hardware
- Backend API integration
- Push notifications
- Data persistence with SQLite
- Real-time sync with cloud services

---

## 📞 Support

For development questions or issues:
- Check the console for detailed error messages
- Ensure all dependencies are installed correctly
- Verify Node.js version compatibility
- Review the Expo documentation for device-specific issues

---

## 🎉 Success!

If everything is working correctly, you should see:
- Smooth navigation between screens
- Interactive medicine cards
- Functional status updates
- Beautiful charts in analytics
- Responsive UI elements

Your MediBro prototype is now ready for demonstration and testing!