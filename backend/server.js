require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const logRoutes = require('./routes/logRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const hardwareRoutes = require('./routes/hardwareRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MediBro API Server is running! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      medicines: '/api/medicines',
      logs: '/api/logs',
      analytics: '/api/analytics',
      hardware: '/api/hardware'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/hardware', hardwareRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Get local IP address
const os = require('os');
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces
const LOCAL_IP = getLocalIPAddress();

const server = app.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🏥  MediBro Backend Server                        ║
║                                                           ║
║        Server running in ${process.env.NODE_ENV || 'development'} mode                     ║
║        Port: ${PORT}                                          ║
║                                                           ║
║        🌐 Access URLs:                                    ║
║        📱 Local:    http://localhost:${PORT}                 ║
║        🌍 Network:  http://${LOCAL_IP}:${PORT}              ║
║                                                           ║
║        API Documentation:                                 ║
║        📚 Auth API:       /api/auth                       ║
║        💊 Medicines API:  /api/medicines                  ║
║        📋 Logs API:       /api/logs                       ║
║        📊 Analytics API:  /api/analytics                  ║
║        🤖 Hardware API:   /api/hardware                   ║
║                                                           ║
║        📡 Hardware Endpoints (for testing):               ║
║        GET  http://${LOCAL_IP}:${PORT}/api/hardware/upcoming    ║
║        GET  http://${LOCAL_IP}:${PORT}/api/hardware/taken       ║
║        GET  http://${LOCAL_IP}:${PORT}/api/hardware/missed      ║
║        POST http://${LOCAL_IP}:${PORT}/api/hardware/update-status ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
