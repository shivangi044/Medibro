import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BluetoothScreen = ({ navigation }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [botId, setBotId] = useState('');
  const [signalStrength, setSignalStrength] = useState(0);
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    // Generate random bot ID for demo
    setBotId(`MD-BOT-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`);
    
    // Start pulse animation
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleConnect = () => {
    setConnectionStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected');
      setSignalStrength(Math.floor(Math.random() * 30) + 70); // 70-100% signal strength
      Alert.alert(
        'Success!',
        `Connected to ${botId}`,
        [
          {
            text: 'Continue',
            onPress: handleSetupComplete,
          },
        ]
      );
    }, 3000);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setSignalStrength(0);
  };

  const handleSetupComplete = async () => {
    try {
      await AsyncStorage.setItem('setupComplete', 'true');
      await AsyncStorage.setItem('connectedBotId', botId);
      await AsyncStorage.setItem('bluetoothConnected', 'true');
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      default: return '#F44336';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  const renderConnectionIcon = () => {
    if (connectionStatus === 'connecting') {
      return <ActivityIndicator size="large" color="#2E86AB" />;
    }
    
    return (
      <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
        <Ionicons 
          name={connectionStatus === 'connected' ? 'bluetooth' : 'bluetooth-outline'} 
          size={80} 
          color={getStatusColor()} 
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.title}>Device Setup</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.deviceCard}>
          <View style={styles.iconContainer}>
            {renderConnectionIcon()}
          </View>

          <Text style={styles.deviceName}>Medicine Dispenser Bot</Text>
          <Text style={styles.deviceId}>ID: {botId}</Text>
          
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>

          {connectionStatus === 'connected' && (
            <View style={styles.signalContainer}>
              <Ionicons name="wifi" size={20} color="#4CAF50" />
              <Text style={styles.signalText}>Signal: {signalStrength}%</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Connection Requirements</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#2E86AB" />
            <Text style={styles.infoText}>Enable Bluetooth on your device</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="wifi-outline" size={20} color="#2E86AB" />
            <Text style={styles.infoText}>Stay within 10 meters of the bot</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#2E86AB" />
            <Text style={styles.infoText}>Secure pairing with encryption</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {connectionStatus === 'connected' ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={handleSetupComplete}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.connectButton,
              connectionStatus === 'connecting' && styles.connectButtonDisabled
            ]}
            onPress={handleConnect}
            disabled={connectionStatus === 'connecting'}
          >
            <Text style={styles.connectButtonText}>
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Device'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  deviceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  deviceId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 15,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E86AB',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  footer: {
    padding: 20,
  },
  connectButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  disconnectButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BluetoothScreen;