// Mock Bluetooth Service for prototype testing
export class BluetoothService {
  constructor() {
    this.isConnected = false;
    this.deviceId = null;
    this.connectionCallbacks = [];
    this.dataCallbacks = [];
  }

  // Simulate device scanning
  async scanForDevices() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockDevices = [
          {
            id: 'MD-BOT-01',
            name: 'Medicine Bot 01',
            rssi: -45,
            available: true
          },
          {
            id: 'MD-BOT-02',
            name: 'Medicine Bot 02',
            rssi: -65,
            available: false
          }
        ];
        resolve(mockDevices);
      }, 2000);
    });
  }

  // Simulate device connection
  async connectToDevice(deviceId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.2) { // 80% success rate
          this.isConnected = true;
          this.deviceId = deviceId;
          this.notifyConnectionChange(true);
          resolve({
            success: true,
            deviceId,
            signalStrength: Math.floor(Math.random() * 30) + 70
          });
        } else {
          reject(new Error('Failed to connect to device'));
        }
      }, 3000);
    });
  }

  // Simulate device disconnection
  async disconnectFromDevice() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = false;
        this.deviceId = null;
        this.notifyConnectionChange(false);
        resolve({ success: true });
      }, 1000);
    });
  }

  // Send command to bot
  async sendCommand(command, data = {}) {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const response = {
          command,
          status: 'success',
          timestamp: new Date().toISOString(),
          data: this.mockCommandResponse(command, data)
        };
        resolve(response);
      }, 1000);
    });
  }

  // Mock command responses
  mockCommandResponse(command, data) {
    switch (command) {
      case 'DISPENSE_MEDICINE':
        return {
          slot: data.slot,
          dispensed: true,
          quantity: data.quantity || 1,
          remainingPills: Math.floor(Math.random() * 50) + 10
        };
      
      case 'GET_STATUS':
        return {
          batteryLevel: Math.floor(Math.random() * 30) + 70,
          lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalDispensed: Math.floor(Math.random() * 1000) + 500,
          errors: []
        };
      
      case 'SET_SCHEDULE':
        return {
          scheduleId: Math.random().toString(36).substr(2, 9),
          scheduled: true,
          nextDispense: data.nextTime
        };
      
      default:
        return { acknowledged: true };
    }
  }

  // Subscribe to connection changes
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  // Subscribe to data updates
  onDataReceived(callback) {
    this.dataCallbacks.push(callback);
  }

  // Notify connection change
  notifyConnectionChange(connected) {
    this.connectionCallbacks.forEach(callback => {
      callback(connected, this.deviceId);
    });
  }

  // Simulate receiving data from bot
  simulateDataReceived(data) {
    this.dataCallbacks.forEach(callback => {
      callback(data);
    });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      deviceId: this.deviceId,
      signalStrength: this.isConnected ? Math.floor(Math.random() * 30) + 70 : 0
    };
  }
}

// Singleton instance
export const bluetoothService = new BluetoothService();

// Mock some periodic data updates
setInterval(() => {
  if (bluetoothService.isConnected) {
    bluetoothService.simulateDataReceived({
      type: 'HEALTH_CHECK',
      timestamp: new Date().toISOString(),
      batteryLevel: Math.floor(Math.random() * 30) + 70,
      temperature: Math.floor(Math.random() * 10) + 20,
      humidity: Math.floor(Math.random() * 20) + 40
    });
  }
}, 30000); // Every 30 seconds