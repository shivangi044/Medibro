import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    vibration: false,
    autoDispense: true,
    emergencyAlerts: true,
  });
  const [botInfo, setBotInfo] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      const botId = await AsyncStorage.getItem('connectedBotId');
      
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
      
      if (botId) {
        setBotInfo({
          id: botId,
          status: 'connected',
          batteryLevel: 78,
          lastSync: new Date().toISOString(),
          firmwareVersion: '2.1.4'
        });
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userToken',
                'userProfile',
                'setupComplete',
                'connectedBotId',
                'bluetoothConnected'
              ]);
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const menuItems = [
    {
      id: 'medicines',
      title: 'Manage Medicines',
      icon: 'medical',
      action: () => navigation.navigate('Medicines'),
    },
    {
      id: 'reminders',
      title: 'Reminder Settings',
      icon: 'notifications',
      action: () => Alert.alert('Coming Soon', 'Reminder settings will be available in the next update'),
    },
    {
      id: 'doctor',
      title: 'Doctor Information',
      icon: 'person',
      action: () => Alert.alert('Doctor Info', userProfile?.doctorName ? `Dr. ${userProfile.doctorName}\n${userProfile.doctorPhone}` : 'No doctor information added'),
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      icon: 'call',
      action: () => Alert.alert('Emergency Contact', userProfile?.emergencyContact || 'No emergency contact set'),
    },
    {
      id: 'export',
      title: 'Export Data',
      icon: 'download',
      action: () => Alert.alert('Export', 'Data export feature coming soon'),
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle',
      action: () => Alert.alert('Support', 'Contact support at support@medibro.com'),
    },
    {
      id: 'about',
      title: 'About MediBro',
      icon: 'information-circle',
      action: () => Alert.alert('About', 'MediBro v1.0.0\nYour Medicine Companion'),
    },
  ];

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons 
              name={userProfile.gender === 'female' ? 'person' : 'person'} 
              size={50} 
              color="#2E86AB" 
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userDetails}>
              {userProfile.age} years • {userProfile.gender}
            </Text>
            {userProfile.medicalConditions && (
              <Text style={styles.medicalConditions}>
                {userProfile.medicalConditions}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#2E86AB" />
          </TouchableOpacity>
        </View>

        {/* Bot Status Card */}
        {botInfo && (
          <View style={styles.botCard}>
            <View style={styles.botHeader}>
              <View style={styles.botLeft}>
                <Ionicons name="hardware-chip" size={24} color="#2E86AB" />
                <Text style={styles.botTitle}>Medicine Dispenser</Text>
              </View>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            </View>
            
            <View style={styles.botDetails}>
              <View style={styles.botDetailItem}>
                <Text style={styles.botDetailLabel}>Device ID:</Text>
                <Text style={styles.botDetailValue}>{botInfo.id}</Text>
              </View>
              
              <View style={styles.botDetailItem}>
                <Text style={styles.botDetailLabel}>Battery:</Text>
                <Text style={styles.botDetailValue}>{botInfo.batteryLevel}%</Text>
              </View>
              
              <View style={styles.botDetailItem}>
                <Text style={styles.botDetailLabel}>Firmware:</Text>
                <Text style={styles.botDetailValue}>v{botInfo.firmwareVersion}</Text>
              </View>
              
              <View style={styles.botDetailItem}>
                <Text style={styles.botDetailLabel}>Last Sync:</Text>
                <Text style={styles.botDetailValue}>
                  {new Date(botInfo.lastSync).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color="#2E86AB" />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{ false: '#767577', true: '#2E86AB' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-high-outline" size={20} color="#2E86AB" />
              <Text style={styles.settingText}>Sound Alerts</Text>
            </View>
            <Switch
              value={settings.soundAlerts}
              onValueChange={(value) => updateSetting('soundAlerts', value)}
              trackColor={{ false: '#767577', true: '#2E86AB' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait-outline" size={20} color="#2E86AB" />
              <Text style={styles.settingText}>Vibration</Text>
            </View>
            <Switch
              value={settings.vibration}
              onValueChange={(value) => updateSetting('vibration', value)}
              trackColor={{ false: '#767577', true: '#2E86AB' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="sync-outline" size={20} color="#2E86AB" />
              <Text style={styles.settingText}>Auto Dispense</Text>
            </View>
            <Switch
              value={settings.autoDispense}
              onValueChange={(value) => updateSetting('autoDispense', value)}
              trackColor={{ false: '#767577', true: '#2E86AB' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="warning-outline" size={20} color="#2E86AB" />
              <Text style={styles.settingText}>Emergency Alerts</Text>
            </View>
            <Switch
              value={settings.emergencyAlerts}
              onValueChange={(value) => updateSetting('emergencyAlerts', value)}
              trackColor={{ false: '#767577', true: '#2E86AB' }}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={20} color="#2E86AB" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>MediBro v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 MediBro Team</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  medicalConditions: {
    fontSize: 12,
    color: '#2E86AB',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  botCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  botLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  botDetails: {
    gap: 8,
  },
  botDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  botDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
});

export default ProfileScreen;